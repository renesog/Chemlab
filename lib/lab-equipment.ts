export type LabToolKind = "magnet" | "sieve" | "funnel" | "burner" | "water" | "dish" | "stir" | "beaker";

export function labToolKind(id: string, label = ""): LabToolKind {
  const value = `${id} ${label}`.toLowerCase();
  if (/magnet|แม่เหล็ก/.test(value)) return "magnet";
  if (/sieve|ตะแกรง|ร่อน/.test(value)) return "sieve";
  if (/funnel|filter|paper|กรวย|กรอง/.test(value)) return "funnel";
  if (/stir|คนให้|กวน/.test(value)) return "stir";
  if (/heat|sublim|evaporat|ความร้อน|ระเหิด|ระเหย/.test(value)) return "burner";
  if (/dish|จาน/.test(value)) return "dish";
  if (/water|dissolve|เติมน้ำ|ละลาย/.test(value)) return "water";
  return "beaker";
}
