export function normalizeRoomCode(value: string) {
  return value.replace(/[^a-z0-9]/gi, "").toUpperCase().slice(0, 6);
}

export type RoomPreview = { code: string; name: string; status: string };
export type RoomLookup = { kind: "found"; room: RoomPreview } | { kind: "missing" | "closed" | "connection" };

// Presentation mapping only: the existing room API remains authoritative.
export function classifyRoomLookup(status: number, value: unknown): RoomLookup {
  if (status === 404) return { kind: "missing" };
  if (status < 200 || status >= 300 || !value || typeof value !== "object") return { kind: "connection" };
  const room = (value as { room?: Partial<RoomPreview> }).room;
  if (!room || typeof room.name !== "string" || typeof room.code !== "string" || typeof room.status !== "string") return { kind: "connection" };
  if (room.status === "ENDED") return { kind: "closed" };
  return { kind: "found", room: { name: room.name, code: room.code, status: room.status } };
}
