import type { Desk } from "./types.ts";
export function deskState(desk:Desk){return desk.locked?(desk.occupantId?"LOCKED_OCCUPIED":"LOCKED_EMPTY"):(desk.occupantId?"OCCUPIED":"AVAILABLE")}
