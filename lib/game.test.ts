import test from "node:test";
import assert from "node:assert/strict";
import { scoreForAttempts, validateSequence } from "./game.ts";

test("คะแนนเริ่มที่ 5 และไม่ต่ำกว่า 1",()=>{assert.equal(scoreForAttempts(0),5);assert.equal(scoreForAttempts(2),3);assert.equal(scoreForAttempts(99),1)});
test("ด่านหลายขั้นตอนต้องเรียงลำดับถูก",()=>{assert.equal(validateSequence(3,["paper","receiver","pour"]),true);assert.equal(validateSequence(3,["receiver","paper","pour"]),false)});
test("ตรวจครบทั้ง 8 ด่าน",()=>{assert.equal(validateSequence(1,["magnet"]),true);assert.equal(validateSequence(2,["sieve"]),true);assert.equal(validateSequence(4,["dish","heat","collect-salt"]),true);assert.equal(validateSequence(5,["sublime","gentle-heat","collect-camphor"]),true);assert.equal(validateSequence(6,["sep-funnel","settle","drain"]),true);assert.equal(validateSequence(7,["add-water","stir","remove-wax","evaporate"]),true);assert.equal(validateSequence(8,["magnet","dissolve","filter-sand","evaporate"]),true)});
