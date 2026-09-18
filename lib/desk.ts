import type { Classroom, Desk } from "./types";

export function deskState(desk: Desk) {
  return desk.locked
    ? (desk.occupantId ? "LOCKED_OCCUPIED" : "LOCKED_EMPTY")
    : (desk.occupantId ? "OCCUPIED" : "AVAILABLE");
}

export function generateDesks(count = 12, layout: Classroom["layout"] = "ROWS"): Desk[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `desk-${i + 1}`,
    label: `${i + 1}`,
    locked: false,
    x: i % 4,
    y: Math.floor(i / 4),
  }));
}
