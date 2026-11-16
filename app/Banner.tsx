'use client';
import Image from 'next/image';
import {useState,useEffect} from 'react';
import {ArrowLeftRight,ChevronLeft,ChevronRight,Pause,Play} from 'lucide-react';
const scenes=[['camera','plant','Fotoğraf ve bitki takası'],['headphones','guitar','Müzikle takas'],['books','book-cover','Kitap değişimi']];
export default function Banner(){
 const [index,setIndex]=useState(0),[paused,setPaused]=useState(false),[reduce,setReduce]=useState(true);
 useEffect(()=>{const m=matchMedia('(prefers-reduced-motion: reduce)');const sync=()=>setReduce(m.matches);sync();m.addEventListener('change',sync);return()=>m.removeEventListener('change',sync)},[]);
 useEffect(()=>{if(paused||reduce)return;const t=setTimeout(()=>setIndex((index+1)%scenes.length),6000);return()=>clearTimeout(t)},[index,paused,reduce]);
 const change=(i:number)=>{setPaused(true);setIndex((i+scenes.length)%scenes.length)};
 const [a,b,title]=scenes[index];
 return <section className="art" aria-label="Takas fikirleri"><div className="orbit"/><div key={a} className="scene"><figure className="snap first"><Image src={'/photos/'+a+'.jpg'} alt="" fill sizes="200px" priority={index===0}/></figure><figure className="snap second"><Image src={'/photos/'+b+'.jpg'} alt="" fill sizes="180px" priority={index===0}/></figure></div><div className="swap"><ArrowLeftRight size={32}/></div><b className="star" aria-hidden="true">✦</b><div className="slideNav"><button aria-label="Önceki görsel" onClick={()=>change(index-1)}><ChevronLeft size={18}/></button><span>{title}</span><button aria-label="Sonraki görsel" onClick={()=>change(index+1)}><ChevronRight size={18}/></button>{!reduce&&<button aria-label={paused?'Oynat':'Duraklat'} onClick={()=>setPaused(!paused)}>{paused?<Play size={15}/>:<Pause size={15}/>}</button>}</div></section>
}
