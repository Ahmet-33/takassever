import type {Metadata} from 'next';
import './globals.css';
export const metadata: Metadata = {title: 'Takassever | Takasla keşfet',description:'Ürünlerini ve yeteneklerini paylaş, karşılığında aradığını bul.',icons:{icon:'/mark.svg'}};
export default function Layout({children}:{children:React.ReactNode}) {return <html lang="tr"><body>{children}</body></html>}
