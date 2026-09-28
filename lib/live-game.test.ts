import assert from "node:assert/strict";
import test from "node:test";
import { countdownSeconds, finishedLevels, gameIsLive, rankedStudents } from "./live-game.ts";
import type { Student } from "./types.ts";

test("completion includes skipped questions but cannot count unrelated questions",()=>{
  const student={completed:[1],skipped:[3]} as Student;
  assert.equal(finishedLevels(student,[1,3]),true);
  assert.equal(finishedLevels(student,[1,2,3]),false);
  assert.equal(finishedLevels({completed:[1,3]} as Student,[1,3]),true);
});

test("countdown gates the game until the server start time",()=>{
  const room={status:"RUNNING" as const,gameStartsAt:10_000};
  assert.equal(countdownSeconds(room,6_000),3);
  assert.equal(countdownSeconds(room,7_001),3);
  assert.equal(countdownSeconds(room,9_001),1);
  assert.equal(countdownSeconds(room,10_000),0);
  assert.equal(gameIsLive(room,9_999),false);
  assert.equal(gameIsLive(room,10_000),true);
});
test("rankings prefer score, then completed levels, then fewer mistakes",()=>{
  const student=(nickname:string,totalScore:number,completed:number[],wrongAttempts:number)=>({id:nickname,nickname,totalScore,completed,wrongAttempts} as Student);
  assert.deepEqual(rankedStudents([student("ก",5,[1],2),student("ข",7,[],0),student("ค",5,[1],1)]).map(s=>s.nickname),["ข","ค","ก"]);
});
