import test from "node:test";
import assert from "node:assert/strict";
import type { Classroom, Student } from "./types.ts";
import { labPhase, readDraft, draftKey } from "./lab-session.ts";
import { evaluateAttempt, skipChallenge } from "./attempt-engine.ts";
import { replayAttempt } from "./attempt-receipt.ts";

function fixture(): Classroom {
  return { id: "room", code: "ABCDEF", name: "test", subject: "chem", layout: "ROWS", status: "RUNNING", catalogVersion: 2,
    desks: [{ id: "desk", label: "1", locked: false, occupantId: "student", x: 0, y: 0 }],
    students: [{ id: "student", nickname: "test", deskId: "desk", handRaised: false, currentLevel: 1, totalScore: 0, wrongAttempts: 0, completed: [] }],
    activity: { mode: "PRESET", title: "test", levelIds: [1,2,3,4,5,6,7,8], pointsByLevel: {} }, createdAt: "" };
}

test("a student can finish all eight levels after a wrong answer and reload", () => {
  let room = fixture();
  const answers = [["magnet"],["sublime","gentle-heat","collect-camphor"],["add-water","stir","cool-wax","remove-wax","evaporate"],["sieve"],["paper","receiver","pour"],["dish","heat","collect-salt"],["sep-funnel","settle","drain"],["magnet","dissolve","filter-sand","evaporate"]];
  room = evaluateAttempt(room, "student", 1, ["sieve"]).room;
  assert.equal(room.students[0].wrongAttempts, 1);
  for (let i = 0; i < answers.length; i++) {
    const result = evaluateAttempt(room, "student", i + 1, answers[i]);
    assert.equal(result.outcome.correct, true);
    room = JSON.parse(JSON.stringify(result.room));
    assert.equal(room.students[0].currentLevel, Math.min(i + 2, 8));
  }
  assert.equal(room.students[0].totalScore, 39);
  assert.equal(labPhase(room, room.students[0], Date.now()), "finished");
  assert.throws(() => evaluateAttempt(room, "student", 8, answers[7]), /activity_unavailable/);
});

test("paused, ended, countdown, waiting and missing seats gate attempts", () => {
  for (const [status, phase] of [["OPEN","waiting"],["PAUSED","paused"],["ENDED","ended"]] as const) {
    const room = { ...fixture(), status };
    assert.equal(labPhase(room, room.students[0], 10), phase);
    assert.throws(() => evaluateAttempt(room, "student", 1, ["magnet"]), /activity_unavailable/);
  }
  const room = fixture(); room.gameStartsAt = 100;
  assert.equal(labPhase(room, room.students[0], 99), "countdown");
  assert.throws(() => evaluateAttempt(room,"student",1,["magnet"],{},99));
  assert.equal(evaluateAttempt(room,"student",1,["magnet"],{},100).outcome.correct,true);
  delete room.students[0].deskId;
  assert.equal(labPhase(room,room.students[0],100),"seat");
  assert.throws(() => evaluateAttempt(room,"student",1,["magnet"]));
  assert.throws(() => evaluateAttempt(fixture(),"another-student",1,["magnet"]));
});

test("retry replays exactly the same outcome and rejects changed payload", () => {
  const result = evaluateAttempt(fixture(), "student", 1, ["sieve"]);
  const receipt = { fingerprint: JSON.stringify([1,["sieve"]]), outcome: result.outcome };
  for (let i=0;i<5;i++) assert.deepEqual(replayAttempt(receipt,receipt.fingerprint),result.outcome);
  assert.equal(result.room.students[0].wrongAttempts,1);
  assert.throws(()=>replayAttempt(receipt,JSON.stringify([1,["magnet"]])),/request_conflict/);
  assert.equal(replayAttempt(undefined,"new"),null);
});

test("draft restores order, rejects corrupt entries and isolates students and levels", () => {
  assert.deepEqual(readDraft('["paper","receiver","paper","unknown",5,"pour"]',["paper","receiver","pour"]),["paper","receiver","pour"]);
  for(const raw of [null,"broken","{}","null"])assert.deepEqual(readDraft(raw,["paper"]),[]);
  assert.notEqual(draftKey("r","a",1),draftKey("r","b",1));
  assert.notEqual(draftKey("r","a",1),draftKey("r","a",2));
});

test("finished state includes skipped levels even when the teacher ends the room",()=>{
  const room=fixture();room.status="ENDED";
  const student={...room.students[0],completed:[1,2,3,4],skipped:[5,6,7,8]} as Student;
  assert.equal(labPhase(room,student,0),"finished");
});

test("a student can skip after trying, resume after a pause, and finish the final question",()=>{
  let room=fixture();
  assert.throws(()=>skipChallenge(room,"student",1),/skip_requires_attempt/);
  for(let level=1;level<=8;level++){
    room=evaluateAttempt(room,"student",level,["wrong"]).room;
    room={...room,status:"PAUSED"};
    assert.throws(()=>skipChallenge(room,"student",level),/activity_unavailable/);
    room={...room,status:"RUNNING"};
    room=skipChallenge(room,"student",level);
    assert.equal(room.students[0].totalScore,0);
  }
  assert.equal(room.students[0].skipped?.length,8);
  assert.equal(labPhase(room,room.students[0],Date.now()),"finished");
  assert.throws(()=>skipChallenge(room,"student",8),/activity_unavailable/);
});
