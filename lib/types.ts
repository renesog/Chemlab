export type RoomStatus = "OPEN" | "RUNNING" | "PAUSED" | "ENDED";
export type Avatar = { skin: string; hair: string; hairColor: string; shirt: string };
export type Student = { id: string; nickname: string; avatar: Avatar; deskId?: string; handRaised: boolean; currentLevel: number; totalScore: number; wrongAttempts: number; completed: number[] };
export type Desk = { id: string; label: string; locked: boolean; occupantId?: string; x: number; y: number };
export type Classroom = { id: string; code: string; name: string; subject: string; layout: "ROWS" | "U_SHAPE" | "GROUPS"; status: RoomStatus; desks: Desk[]; students: Student[]; createdAt: string };
