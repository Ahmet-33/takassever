export type Listing = {id:string;title:string;cat:string;sub:string;city:string;want:string;description:string;owner:string;photo:string;closed:boolean};
export type Offer = {id:string;listing:string;sender:string;message:string;status:'Bekliyor'|'Kabul edildi'|'Reddedildi'};
export type Market = {user:string;listings:Listing[];offers:Offer[]};
