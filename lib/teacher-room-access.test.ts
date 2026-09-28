import assert from "node:assert/strict";
import test from "node:test";
import { teacherCanDeleteRoom } from "./teacher-room-access.ts";

test("เจ้าของห้องลบห้องที่ผูกกับบัญชีของตนได้", () => {
  assert.equal(teacherCanDeleteRoom({ userId: "teacher-a", ownerUserId: "teacher-a" }), true);
  assert.equal(teacherCanDeleteRoom({ userId: "teacher-b", ownerUserId: "teacher-a" }), false);
});

test("ห้องเก่าลบได้ด้วย teacher token แม้ไม่มีบัญชีผู้ใช้ใน request", () => {
  assert.equal(teacherCanDeleteRoom({ suppliedTeacherToken: "valid-token", roomTeacherToken: "valid-token" }), true);
  assert.equal(teacherCanDeleteRoom({ suppliedTeacherToken: "wrong-token", roomTeacherToken: "valid-token" }), false);
});

test("teacher token ใช้ข้ามเจ้าของห้องใหม่ไม่ได้", () => {
  assert.equal(teacherCanDeleteRoom({
    userId: "teacher-b",
    ownerUserId: "teacher-a",
    suppliedTeacherToken: "valid-token",
    roomTeacherToken: "valid-token",
  }), false);
});
