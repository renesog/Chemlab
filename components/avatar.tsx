import type { Avatar as AvatarType } from "@/lib/types";

export const avatarColors:Record<"skin"|"hairColor"|"shirt",Record<string,string>>={
  skin:{light:"#f6d1b0",medium:"#c98d60",deep:"#774936"},
  hairColor:{black:"#1e252b",brown:"#74452c",blue:"#274f76"},
  shirt:{cyan:"#11a7b5",navy:"#173d63",yellow:"#e6b72e",coral:"#df6f62"},
};
export function Avatar({value,size=72}:{value:AvatarType;size?:number}){
  return <div className={`avatar gender-${value.gender??"boy"}`} style={{width:size,height:size,"--skin":avatarColors.skin[value.skin]??avatarColors.skin.medium,"--shirt":avatarColors.shirt[value.shirt]??avatarColors.shirt.cyan,"--hair":avatarColors.hairColor[value.hairColor??"black"]??avatarColors.hairColor.black} as React.CSSProperties} aria-label={`ตัวละคร${value.gender==="girl"?"ผู้หญิง":"ผู้ชาย"}`}><span className={`hair ${value.hair}`}/>{value.hat&&value.hat!=="none"&&<span className={`avatar-hat ${value.hat}`}/>}<span className="face"><i/><b/></span><span className="shirt"/></div>;
}
