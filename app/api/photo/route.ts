import {get} from '@vercel/blob';
export async function GET(req:Request){const id=new URL(req.url).searchParams.get('id')??'';
 if(!/^[a-f0-9-]{36}$/.test(id))return new Response(null,{status:404});
 const file=await get('photos/'+id,{access:'private'});if(!file||file.statusCode!==200)return new Response(null,{status:404});
 return new Response(file.stream,{headers:{'Content-Type':file.blob.contentType,'X-Content-Type-Options':'nosniff','Cache-Control':'public, max-age=86400'}});
}
