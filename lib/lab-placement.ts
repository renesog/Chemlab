/** Keep equipment bases inside the bench and leave the mixture vessel clear. */
export function canPlaceLabTool(x: number, z: number): boolean {
  return Number.isFinite(x) && Number.isFinite(z)
    && Math.abs(x) <= 3.65 && z >= -.65 && z <= 1.85
    && Math.hypot(x + 3, z - .5) > .8;
}
