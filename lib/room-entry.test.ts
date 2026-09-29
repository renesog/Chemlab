import test from "node:test";
import assert from "node:assert/strict";
import { normalizeRoomCode, classifyRoomLookup } from "./room-entry.ts";

test("entry code keeps the existing six-character alphanumeric contract",()=>{
  assert.equal(normalizeRoomCode("lx7326"),"LX7326");
  assert.equal(normalizeRoomCode(" LX 73-26\n"),"LX7326");
  assert.equal(normalizeRoomCode("ABCDEF12"),"ABCDEF");
  assert.equal(normalizeRoomCode("ห้อง🙂"),"");
  assert.equal(normalizeRoomCode("ab"),"AB");
});

test("entry lookup distinguishes not found, ended and unavailable server",()=>{
  assert.deepEqual(classifyRoomLookup(404,{error:"missing"}),{kind:"missing"});
  assert.deepEqual(classifyRoomLookup(500,{error:"Firebase unavailable"}),{kind:"connection"});
  assert.deepEqual(classifyRoomLookup(200,{room:{code:"ABCDEF",name:"Chemistry",status:"ENDED"}}),{kind:"closed"});
  for(const value of [null,{}, {room:{}}, {room:{name:12,code:"ABCDEF",status:"OPEN"}}]) {
    assert.deepEqual(classifyRoomLookup(200,value),{kind:"connection"});
  }
});

test("existing open/running/paused room data is previewed without rewriting it",()=>{
  for(const status of ["OPEN","RUNNING","PAUSED"]) {
    const room={code:"ABCDEF",name:"วิทยาศาสตร์",status};
    const body={room};
    assert.deepEqual(classifyRoomLookup(200,body),{kind:"found",room});
    assert.equal(body.room,room);
  }
});
