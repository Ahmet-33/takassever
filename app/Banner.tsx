'use client';
import Image from 'next/image';
import {useEffect,useState} from 'react';
import {ArrowRight,ChevronLeft,ChevronRight} from 'lucide-react';

const slides = [
 {image:'headphones',category:'Elektronik',title:'Sesini değiştir.',body:'Kulaklıktan hoparlöre, yeni bir dinleme deneyimi için takas yap.',action:'Elektroniği keşfet',color:'#ffda79'},
 {image:'guitar',category:'Müzik',title:'Sıradaki şarkı senin.',body:'Bir köşede bekleyen enstrümanını yeni bir ezgiyle değiştir.',action:'Müzik ilanlarına bak',color:'#ffc4a2'},
 {image:'books',category:'Kitap & Medya',title:'Bir sayfa da sen çevir.',body:'Rafındaki kitapları paylaş, okumak istediğin hikâyeyi bul.',action:'Kitapları keşfet',color:'#bdedce'}
];

export default function Banner({onExplore}:{onExplore:(category:string)=>void}){
 const [index,setIndex]=useState(0);
 const [focused,setFocused]=useState(false);
 useEffect(()=>{
  const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
  let timer:ReturnType<typeof setTimeout>;
  function schedule(){
   clearTimeout(timer);
   if(!focused&&!motion.matches&&!document.hidden)timer=setTimeout(()=>setIndex(i=>(i+1)%slides.length),6000);
  }
  schedule();
  motion.addEventListener('change',schedule);
  document.addEventListener('visibilitychange',schedule);
  return ()=>{clearTimeout(timer);motion.removeEventListener('change',schedule);document.removeEventListener('visibilitychange',schedule)};
 },[index,focused]);
 const slide=slides[index];
 const move=(n:number)=>setIndex((n+slides.length)%slides.length);
 return <section className="campaign" aria-label="Öne çıkan takas kategorileri" onFocusCapture={e=>setFocused(e.target.matches(':focus-visible'))} onBlurCapture={e=>{if(!e.currentTarget.contains(e.relatedTarget))setFocused(false)}}>
  <div className="campaignScene" key={slide.image}>
   <Image src={'/photos/'+slide.image+'.jpg'} alt="" fill priority={index===0} sizes="(max-width: 1280px) 92vw, 1280px"/>
   <div className="campaignCopy"><p className="campaignCategory">{slide.category}</p><h1>{slide.title}</h1><p>{slide.body}</p><button style={{background:slide.color}} onClick={()=>onExplore(slide.category)}>{slide.action}<ArrowRight size={17}/></button></div>
  </div>
  <button className="campaignArrow prev" aria-label="Önceki banner" onClick={()=>move(index-1)}><ChevronLeft/></button>
  <button className="campaignArrow next" aria-label="Sonraki banner" onClick={()=>move(index+1)}><ChevronRight/></button>
  <nav className="campaignDots" aria-label="Banner seçimi">{slides.map((s,i)=><button key={s.image} aria-label={s.category+' bannerı'} aria-current={i===index?'true':undefined} onClick={()=>move(i)}><span/></button>)}</nav>
 </section>;
}
