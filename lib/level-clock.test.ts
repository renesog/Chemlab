import test from "node:test";
import assert from "node:assert/strict";
import type { Classroom } from "./types.ts";
import { beginLevel, elapsedLevelMs, transitionActivity } from "./level-clock.ts";
import { evaluateAttempt, skipChallenge } from "./attempt-engine.ts";
import { levelResults, resultsCsv, durationLabel } from "./result-summary.ts";
import { progressiveHint, reasoningFeedback } from "./game.ts";

function room(): Classroom {
  return { id:"r",name:"test",code:"ABCDEF",subject:"",layout:"ROWS",status:"RUNNING",catalogVersion:2,createdAt:"",desks:[],
    students:[{id:"s",nickname:"=SUM(1,2)",deskId:"desk",handRaised:false,currentLevel:1,totalScore:0,wrongAttempts:0,completed:[]}],
    activity:{mode:"PRESET",title:"test",levelIds:[1,4],pointsByLevel:{1:5,4:5}} };
}

test("level time survives refresh and excludes teacher pause and restart countdown",()=>{
  let current=beginLevel(room(),"s",1,1000);
  current=JSON.parse(JSON.stringify(current));
  current=beginLevel(current,"s",1,2000);
  assert.equal(elapsedLevelMs(current.students[0],1,3000),2000);
  current=transitionActivity(current,"PAUSED",3000);
  assert.equal(elapsedLevelMs(current.students[0],1,9000),2000);
  current=transitionActivity(current,"RUNNING",10000);
  assert.equal(elapsedLevelMs(current.students[0],1,15000),2000);
  const result=evaluateAttempt(current,"s",1,["magnet"],{},17000);
  assert.equal(result.room.students[0].resultsByLevel?.[1].elapsedMs,3000);
  assert.equal(result.room.students[0].resultsByLevel?.[1].score,5);
  assert.equal(elapsedLevelMs(result.room.students[0],1,20000),3000);
  assert.equal(result.room.students[0].currentLevel,4);
});

test("skip stores zero points and attempt count, old records do not invent elapsed time",()=>{
  const wrong=evaluateAttempt(room(),"s",1,["sieve"],{},100);
  const skipped=skipChallenge(wrong.room,"s",1,200);
  const record=skipped.students[0].resultsByLevel?.[1];
  assert.deepEqual(record,{status:"skipped",score:0,attempts:1,wrongAttempts:1,elapsedMs:null,finishedAt:200});
  assert.equal(levelResults(skipped,skipped.students[0])[0].score,0);
  assert.equal(durationLabel(null),"—");
  assert.equal(durationLabel(65000),"1:05");
  assert.match(resultsCsv(skipped),/"'=SUM\(1,2\)"/);
});

test("feedback distinguishes ordering and hints match legacy level numbering",()=>{
  assert.match(reasoningFeedback(5,["pour","receiver","paper"],2,1),/ลำดับ/);
  assert.equal(progressiveHint(2,1,0),progressiveHint(4,2,0));
  assert.notEqual(progressiveHint(5,2,0),progressiveHint(5,2,2));
  assert.doesNotMatch(reasoningFeedback(8,["wrong"],2,1),/filter-sand|evaporate/);
});
