import test from "node:test";
import assert from "node:assert/strict";
import { scoreForAttempts, validateSequence } from "./game.ts";

test("คะแนนเริ่มที่ 5 และไม่ต่ำกว่า 1",()=>{assert.equal(scoreForAttempts(0),5);assert.equal(scoreForAttempts(2),3);assert.equal(scoreForAttempts(99),1)});
test("ครูกำหนดคะแนนเต็มของด่านเองได้",()=>{assert.equal(scoreForAttempts(0,10),10);assert.equal(scoreForAttempts(3,10),7);assert.equal(scoreForAttempts(99,10),1)});
test("ด่านหลายขั้นตอนต้องเรียงลำดับถูก",()=>{assert.equal(validateSequence(3,["add-water","stir","cool-wax","remove-wax","evaporate"]),true);assert.equal(validateSequence(3,["stir","add-water","cool-wax","remove-wax","evaporate"]),false)});
test("การบูรกับเกลือแยกได้สองวิธี แต่ห้ามปนขั้นตอน",()=>{assert.equal(validateSequence(2,["sublime","gentle-heat","collect-camphor"]),true);assert.equal(validateSequence(2,["add-water","stir","filter-camphor"]),true);assert.equal(validateSequence(2,["add-water","gentle-heat","collect-camphor"]),false)});
test("ห้องเดิมยังใช้เฉลยและหมายเลขด่านเดิม",()=>{assert.equal(validateSequence(2,["sieve"],1),true);assert.equal(validateSequence(5,["sublime","gentle-heat","collect-camphor"],1),true);assert.equal(validateSequence(2,["sieve"],2),false)});
test("ตรวจครบทั้ง 8 ด่าน",()=>{assert.equal(validateSequence(1,["magnet"]),true);assert.equal(validateSequence(4,["sieve"]),true);assert.equal(validateSequence(5,["paper","receiver","pour"]),true);assert.equal(validateSequence(6,["dish","heat","collect-salt"]),true);assert.equal(validateSequence(7,["sep-funnel","settle","drain"]),true);assert.equal(validateSequence(8,["magnet","dissolve","filter-sand","evaporate"]),true)});
