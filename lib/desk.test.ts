import test from "node:test";
import assert from "node:assert/strict";
import { deskState } from "./desk.ts";

test("สถานะโต๊ะได้จาก lock และผู้ครอบครองโดยไม่ล็อกอัตโนมัติ",()=>{assert.equal(deskState({id:"1",label:"1",locked:false,x:0,y:0}),"AVAILABLE");assert.equal(deskState({id:"1",label:"1",locked:false,occupantId:"s",x:0,y:0}),"OCCUPIED");assert.equal(deskState({id:"1",label:"1",locked:true,x:0,y:0}),"LOCKED_EMPTY");assert.equal(deskState({id:"1",label:"1",locked:true,occupantId:"s",x:0,y:0}),"LOCKED_OCCUPIED")});
