import {get,put,del,BlobPreconditionFailedError} from '@vercel/blob';
import {createHash,randomBytes,randomUUID,scrypt,timingSafeEqual} from 'node:crypto';
import {promisify} from 'node:util';
import {NextRequest,NextResponse} from 'next/server';
import {catalog} from '../../catalog';
import type {Listing,Offer} from '../../market-types';
const derive=promisify(scrypt);
const privateBlob={access:'private',addRandomSuffix:false} as const;
const digest=(s:string)=>createHash('sha256').update(s).digest('hex');
type Board={listings:Listing[];offers:Offer[]};
type Session={user:string;expires:number};
class Problem extends Error {constructor(message:string,readonly status=400){super(message)}}
async function read<T>(path:string){
 const r=await get(path,{access:'private',useCache:false});
 if(!r||r.statusCode!==200)return null;
 return {data:await new Response(r.stream).json() as T,etag:r.blob.etag};
}
const boardPath='market/board.json';
const blank=():Board=>({listings:[],offers:[]});
async function update(change:(b:Board)=>void){
 for(let i=0;i<5;i++){
  const prev=await read<Board>(boardPath), board=prev?.data??blank();change(board);
  try{await put(boardPath,JSON.stringify(board),{...privateBlob,ifMatch:prev?.etag});return}
  catch(e){if(!(e instanceof BlobPreconditionFailedError)&&!(e instanceof Error&&/already exists/i.test(e.message)))throw e}
 }
 throw new Problem('İşlem yoğunluğu var. Tekrar dene.',409);
}
function sessionPath(req:NextRequest){const t=req.cookies.get('takas_session')?.value;return t&&/^[a-f0-9]{64}$/.test(t)?'sessions/'+digest(t):null}
async function current(req:NextRequest){const path=sessionPath(req);const s=path?(await read<Session>(path))?.data:null;return s&&s.expires>Date.now()?s.user:''}
async function login(user:string){
 const token=randomBytes(32).toString('hex'),maxAge=7*86400;
 await put('sessions/'+digest(token),JSON.stringify({user,expires:Date.now()+maxAge*1000}),privateBlob);
 const res=NextResponse.json({ok:true});res.cookies.set('takas_session',token,{httpOnly:true,secure:true,sameSite:'lax',path:'/',maxAge});return res;
}
function failure(e:unknown){return NextResponse.json({error:e instanceof Problem?e.message:'İşlem tamamlanamadı. Lütfen tekrar dene.'},{status:e instanceof Problem?e.status:503})}
export async function GET(req:NextRequest){try{
 const [user,record]=await Promise.all([current(req),read<Board>(boardPath)]);const {listings,offers}=record?.data??blank();
 const own=new Set(listings.filter(l=>l.owner===user).map(l=>l.id));
 return NextResponse.json({user,listings,offers:offers.filter(o=>o.sender===user||own.has(o.listing))},{headers:{'Cache-Control':'private, no-store'}});
}catch(e){return failure(e)}}
export async function POST(req:NextRequest){try{
 if(req.headers.get('origin')!==req.nextUrl.origin)throw new Problem('Geçersiz istek.',403);
 const f=await req.formData();const field=(key:string,max:number,min=1)=>{const v=f.get(key);if(typeof v!=='string'||v.trim().length<min||v.length>max)throw new Problem('Alanları kontrol et.');return v.trim()};
 const action=field('action',20);
 if(action==='signup'||action==='signin'){
 const name=field('name',32,3).toLowerCase();if(!/^[a-z0-9_]{3,32}$/.test(name))throw new Problem('Kullanıcı adı için a–z, rakam ve alt çizgi kullan.');
 const password=f.get('password');if(typeof password!=='string'||password.length<10||password.length>128)throw new Problem('Şifre 10–128 karakter olmalı.');
 const key='accounts/'+digest(name);const account=await read<{salt:string;hash:string}>(key);
 const salt=account?.data.salt??randomBytes(16).toString('hex');const hash=await derive(password,salt,64) as Buffer;
 if(action==='signup'){
 if(account)throw new Problem('Bu kullanıcı adı alınmış.',409);
 try{await put(key,JSON.stringify({salt,hash:hash.toString('hex')}),privateBlob)}catch(e){if(await read(key))throw new Problem('Bu kullanıcı adı alınmış.',409);throw e}
 }else if(!account||!timingSafeEqual(hash,Buffer.from(account.data.hash,'hex')))throw new Problem('Kullanıcı adı veya şifre hatalı.',401);
 return login(name);
 }
 const user=await current(req);if(!user)throw new Problem('Önce giriş yap.',401);
 if(action==='logout'){const path=sessionPath(req);if(path)await del(path);const r=NextResponse.json({ok:true});r.cookies.delete('takas_session');return r}
 if(action==='publish'){
 const cat=field('cat',80),sub=field('sub',80);if(!catalog.find(c=>c.name===cat)?.subs.includes(sub))throw new Problem('Kategori seç.');
 const id=randomUUID();const l:Listing={id,cat,sub,title:field('title',85,3),want:field('want',140),city:field('city',60),description:field('description',1500,5),photo:'',owner:user,closed:false};
 const file=f.get('photo');
 if(file instanceof File&&file.size){if(file.size>2*1024*1024)throw new Problem('Fotoğraf en fazla 2 MB olabilir.');const bytes=Buffer.from(await file.arrayBuffer());
 const mime=bytes.subarray(0,3).equals(Buffer.from([255,216,255]))?'image/jpeg':bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))?'image/png':'';
 if(!mime)throw new Problem('JPG veya PNG fotoğraf seç.');await put('photos/'+id,bytes,{...privateBlob,contentType:mime});l.photo='/api/photo?id='+id;}
 await update(b=>{b.listings.unshift(l)});
 }else{
 const id=field('listing',64),message=action==='offer'?field('message',600,5):'';
 await update(b=>{const l=b.listings.find(x=>x.id===id);if(!l||l.closed)throw new Problem('İlan kapalı veya bulunamadı.',409);
 if(action==='offer'){if(user===l.owner||b.offers.some(o=>o.listing===id&&o.sender===user&&o.status==='Bekliyor'))throw new Problem('Bu ilana yeni teklif gönderilemiyor.',409);
 b.offers.unshift({id:randomUUID(),listing:id,sender:user,message,status:'Bekliyor'});return}
 if(l.owner!==user)throw new Problem('Bu işlem ilan sahibine ait.',403);
 if(action==='close'){l.closed=true}else if(action==='accept'||action==='reject'){const o=b.offers.find(x=>x.id===field('offer',64)&&x.listing===id&&x.status==='Bekliyor');if(!o)throw new Problem('Teklif bulunamadı.',409);o.status=action==='accept'?'Kabul edildi':'Reddedildi';l.closed=action==='accept'}else throw new Problem('Geçersiz işlem.');
 if(l.closed)b.offers.forEach(o=>{if(o.listing===id&&o.status==='Bekliyor')o.status='Reddedildi'});
 });
 }
 return NextResponse.json({ok:true});
}catch(e){return failure(e)}}
