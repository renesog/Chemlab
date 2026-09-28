import { test } from "node:test";
import assert from "node:assert/strict";
import { canPlaceLabTool } from "./lab-placement.ts";

test("tools fit on the bench with clearance from its edges", () => {
  assert.equal(canPlaceLabTool(0, .5), true);
  assert.equal(canPlaceLabTool(3.65, 1.85), true);
  for (const [x, z] of [[3.66, 0], [-3.66, 0], [0, -.66], [0, 1.86], [0, -2.7]]) {
    assert.equal(canPlaceLabTool(x, z), false);
  }
});

test("drops cannot overlap the mixture or use invalid ray coordinates", () => {
  for (const [x, z] of [[-3, .5], [-2.5, .5], [NaN, 0], [0, Infinity]]) {
    assert.equal(canPlaceLabTool(x, z), false);
  }
  assert.equal(canPlaceLabTool(-2, .5), true);
});
