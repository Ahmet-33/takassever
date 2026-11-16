'use client';
import Image from 'next/image';
import {useEffect,useRef,useState} from 'react';
import {ArrowDown,ArrowLeftRight,ArrowRight,Camera,Flower2,Guitar,Bike,LayoutGrid,MapPin,Plus,Search,Users,X,Handshake,Menu} from 'lucide-react';
import Banner from './Banner';
import MarketPanel from './MarketPanel';
import type {Market,Listing} from './market-types';
import {catalog} from './catalog';
const categories=[{name:'Elektronik',Icon:Camera},{name:'Spor',Icon:Bike},{name:'Müzik',Icon:Guitar},{name:'Ev & Yaşam',Icon:Flower2}];
const examples=[
 {id:'camera',sub:'Fotoğraf & Kamera',title:'Aynasız fotoğraf makinesi',city:'İstanbul',want:'Plak koleksiyonu',cat:'Elektronik'},
 {id:'bike',sub:'Bisiklet',title:'Şehir bisikleti',city:'İzmir',want:'Kamp ekipmanı',cat:'Spor'},
 {id:'guitar',sub:'Telli çalgılar',title:'Akustik gitar',city:'Ankara',want:'Klavye veya ukulele',cat:'Müzik'},
 {id:'plant',sub:'Salon bitkileri',title:'Saksıda salon bitkisi',city:'Bursa',want:'Seramik saksı',cat:'Ev & Yaşam'},
{id:'books',sub:'Roman',title:'Dünya klasikleri seti',city:'Eskişehir',want:'Çizgi roman seti',cat:'Kitap & Medya'},
{id:'headphones',sub:'Ses sistemleri',title:'Kulak üstü kulaklık',city:'Antalya',want:'Bluetooth hoparlör',cat:'Elektronik'},
{id:'book-cover',sub:'Roman',title:'Çağdaş edebiyat seçkisi',city:'Çanakkale',want:'Şiir kitapları',cat:'Kitap & Medya'}];
function Brand(){return <a className="brand" href="#" aria-label="Takassever ana sayfa"><Image src="/mark.svg" alt="" width={38} height={38}/>takas<span>sever</span></a>}
export default function Home(){
const [query,setQuery]=useState(''),[cat,setCat]=useState('Tümü'),[modal,setModal]=useState(''),[menu,setMenu]=useState(false);
const [market,setMarket]=useState<Market>({user:'',listings:[],offers:[]});
const [selected,setSelected]=useState<Listing>();
const [marketError,setMarketError]=useState(false);
async function refresh(){const r=await fetch('/api/market',{cache:'no-store'});if(!r.ok)throw Error('İlanlar yüklenemedi.');setMarket(await r.json());setMarketError(false)}
useEffect(()=>{const controller=new AbortController();fetch('/api/market',{cache:'no-store',signal:controller.signal}).then(r=>{if(!r.ok)throw Error();return r.json()}).then(setMarket).catch(()=>{if(!controller.signal.aborted)setMarketError(true)});return ()=>controller.abort()},[]);
const items:Listing[]=[...market.listings.filter(l=>!l.closed),...examples.map(e=>({...e,owner:'',closed:false,photo:'/photos/'+e.id+'.jpg',description:''}))];
const [sub,setSub]=useState('');
const selectCategory=(name:string)=>{setCat(name);setSub('')};
const [catalogOpen,setCatalogOpen]=useState(false);
const [browse,setBrowse]=useState(catalog[0]);
const openCatalog=()=>{if(!catalogOpen){setBrowse(catalog.find(c=>c.name===cat)??catalog[0]);setCatalogOpen(true)}};
const choose=(group:string,topic="")=>{setCat(group);setSub(topic);setCatalogOpen(false)};
const dialog=useRef<HTMLDialogElement>(null);
useEffect(()=>{if(modal)dialog.current?.showModal();else dialog.current?.close()},[modal]);
const go=()=>document.getElementById('ilanlar')?.scrollIntoView();
const filtered=items.filter(i=>(cat==='Tümü'||cat===i.cat)&&(!sub||sub===i.sub)&&[i.title,i.city,i.want,i.cat,i.sub].join(' ').toLocaleLowerCase('tr').includes(query.trim().toLocaleLowerCase('tr')));
const search=(hero=false)=><form className={'search '+(hero?'heroSearch':'navSearch')} onSubmit={e=>{e.preventDefault();go()}}><Search size={19}/><input aria-label={hero?'İlanlarda ara':'Sitede ara'} placeholder={hero?'Ne arıyorsun?':'İlanlarda ara…'} value={query} onChange={e=>setQuery(e.target.value)}/>{hero&&<button>Ara <ArrowRight size={16}/></button>}</form>;
return <><header><div className="wrap nav"><Brand/>{search()}<div className="navActions"><button className="post" onClick={()=>setModal('İlan ver')}><Plus size={16}/> İlan Ver</button><button className="login" onClick={()=>setModal('Hesabım')}>{market.user?'Hesabım':'Giriş Yap / Kayıt Ol'}</button><button className="mobile" aria-label="Menü" aria-expanded={menu} onClick={()=>setMenu(!menu)}><Menu/></button></div></div>{menu&&<button className="mobileLogin" onClick={()=>{setMenu(false);setModal('Hesabım')}}>{market.user?'Hesabım':'Giriş Yap / Kayıt Ol'}</button>}</header>
<main className="wrap"><Banner onExplore={name=>{setQuery("");choose(name);go()}}/><div className="marketSearch">{search(true)}</div>
<section id="ilanlar"><div className="sectionHead"><div><p className="eyebrow">TAKAS PAZARI</p><h2>Öne çıkan takas ilanları</h2></div><a href="#nasil">Nasıl çalışır? <ArrowDown size={15}/></a></div><div onPointerLeave={e=>{if(e.pointerType==="mouse"&&!e.currentTarget.contains(document.activeElement))setCatalogOpen(false)}} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget))setCatalogOpen(false)}} onKeyDown={e=>{if(e.key==="Escape"&&catalogOpen){e.currentTarget.querySelector<HTMLButtonElement>(".categoryPicker")?.focus();setCatalogOpen(false)}}}><nav className="filters" aria-label="İlan kategorileri">
<button type="button" className="categoryPicker" aria-expanded={catalogOpen} aria-controls="catalogMenu" onPointerEnter={e=>{if(e.pointerType==="mouse")openCatalog()}} onClick={e=>{if(e.detail>0&&window.matchMedia("(hover: hover)").matches){openCatalog()}else if(catalogOpen){setCatalogOpen(false)}else{openCatalog()}}}><LayoutGrid size={16}/><span>{sub || cat}</span><ArrowDown size={13}/></button>
{categories.map(({name,Icon})=><button key={name} aria-pressed={cat===name && !sub} onClick={()=>choose(name)}><Icon size={16}/>{name}</button>)}</nav>
{catalogOpen&&<section id="catalogMenu" className="catalogMenu" aria-label="Tüm kategoriler"><div className="catalogRail"><button onClick={()=>choose("Tümü")}>Tüm ilanlar</button>{catalog.map(c=><button key={c.name} aria-pressed={browse.name===c.name} onPointerEnter={e=>{if(e.pointerType==="mouse")setBrowse(c)}} onClick={()=>setBrowse(c)}>{c.name}<span aria-hidden="true">›</span></button>)}</div><div className="catalogChoices"><h3>{browse.name}</h3><button onClick={()=>choose(browse.name)}>Tüm {browse.name.toLocaleLowerCase("tr")} ilanları</button>{browse.subs.map(topic=><button key={topic} onClick={()=>choose(browse.name,topic)}>{topic}</button>)}</div></section>}</div>
{marketError&&<p role="alert">Üye ilanları yüklenemedi. <button onClick={()=>refresh().catch(()=>setMarketError(true))}>Tekrar dene</button></p>}<div className="cards">{filtered.map(i=><article key={i.id}><div className="photo">{i.photo?<Image unoptimized={Boolean(i.owner)} src={i.photo} alt={i.title} fill sizes="(max-width:600px) 95vw,(max-width:900px) 45vw, 280px"/>:<div className="noPhoto"><LayoutGrid size={38}/></div>}<span>{i.cat}</span></div><div className="details"><small><MapPin size={14}/>{i.city} · {i.owner?'@'+i.owner:'Örnek ilan'}</small><h3>{i.title}</h3><div className="want"><ArrowLeftRight size={18}/><div><small>Karşılığında ne istiyor?</small><strong>{i.want}</strong></div></div><button className="offer" onClick={()=>{setSelected(i);setModal(i.owner?(market.user===i.owner?'Hesabım':'Teklif'):'Örnek ilan')}}>{i.owner?(market.user===i.owner?'İlanımı yönet':'Takas Teklif Et'):'Örneği incele'} <ArrowRight size={16}/></button></div></article>)}</div>{!filtered.length&&<p className="empty">Bu seçim için henüz ilan bulunmuyor. <button onClick={()=>{setQuery('');selectCategory('Tümü')}}>Tüm ilanları göster</button></p>}</section>
<section id="nasil"><p className="eyebrow">NASIL ÇALIŞIR?</p><h2>Üç adımda takas</h2><div className="steps">{[{Icon:Camera,t:'İlanını oluştur',d:'Ürününü veya hizmetini tanıt, karşılığında ne istediğini yaz.'},{Icon:Users,t:'Teklifini paylaş',d:'İlgini çeken ilanı bul ve sunabileceğin takası anlat.'},{Icon:Handshake,t:'Takasını tamamla',d:'Detaylarda anlaş, güvenli bir yerde buluş ve değiş tokuş et.'}].map(({Icon,t,d},n)=><div key={t}><Icon/><h3>{n+1}. {t}</h3><p>{d}</p></div>)}</div></section></main><footer><div className="wrap foot"><Brand/><div>{['Hakkımızda','Güvenli Takas İpuçları','İletişim'].map(t=><button key={t} onClick={()=>setModal(t)}>{t}</button>)}</div><small>© {new Date().getFullYear()} Takassever</small></div></footer>

<dialog ref={dialog} onClose={()=>setModal('')}><button className="close" aria-label="Kapat" onClick={()=>setModal('')}><X/></button>{['Hesabım','İlan ver','Teklif'].includes(modal)?<MarketPanel key={modal} mode={modal} market={market} listing={selected} refresh={refresh} finish={setModal}/>:modal==='Örnek ilan'&&selected?<div className='marketPanel'><h2>{selected.title}</h2><p>Örnek ilan · {selected.city}</p><p>Karşılığında {selected.want.toLocaleLowerCase('tr')} aranıyor.</p><button className='primary' onClick={()=>setModal('İlan ver')}>Ben de ilan vereyim</button></div>:<><h2>{modal}</h2><p>{modal==='Hakkımızda'?'Takassever, eşya ve hizmetleri para kullanmadan değiştirmek isteyenleri bir araya getirir.':modal==='Güvenli Takas İpuçları'?'Kalabalık bir yerde buluş. Ürünü teslim almadan önce kontrol et ve kapora gönderme.':modal==='İletişim'?'İletişim kanalı henüz açılmadı.':modal==='İlan ver'||modal==='Giriş Yap / Kayıt Ol'?'Bu önizlemede üyelik ve ilan yayınlama henüz açık değil.':'Bu bir örnek ilandır. Teklif gönderimi platform açıldığında kullanılabilecek.'}</p></>}</dialog></>}









