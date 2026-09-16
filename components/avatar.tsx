import type { Avatar as AvatarType } from "@/lib/types";

const skinColors:Record<string,string>={light:"#f6d1b0",medium:"#c98d60",deep:"#774936"};
const shirtColors:Record<string,string>={cyan:"#11a7b5",navy:"#173d63",yellow:"#e6b72e",coral:"#df6f62"};
export function Avatar({value,size=72}:{value:AvatarType;size?:number}){
  return <div className={`avatar gender-${value.gender??"boy"}`} style={{width:size,height:size,"--skin":skinColors[value.skin]??skinColors.medium,"--shirt":shirtColors[value.shirt]??shirtColors.cyan,"--hair":value.hairColor==="brown"?"#74452c":value.hairColor==="blue"?"#274f76":"#1e252b"} as React.CSSProperties} aria-label={`ตัวละคร${value.gender==="girl"?"ผู้หญิง":"ผู้ชาย"}`}><span className={`hair ${value.hair}`}/>{value.hat&&value.hat!=="none"&&<span className={`avatar-hat ${value.hat}`}/>}<span className="face"><i/><b/></span><span className="shirt"/></div>;
}
