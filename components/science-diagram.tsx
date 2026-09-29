export function ScienceDiagram() {
  return <svg className="science-diagram" viewBox="0 0 520 260" aria-hidden="true" focusable="false">
    <defs><pattern id="science-grid" width="26" height="26" patternUnits="userSpaceOnUse"><path d="M26 0H0V26" fill="none" stroke="currentColor" strokeOpacity=".14"/></pattern></defs>
    <rect width="520" height="260" fill="url(#science-grid)"/>
    <g fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M30 44h118v166H30zM210 118h74M274 110l10 8-10 8M340 44h144v68H340zM340 144h144v68H340z"/><path d="M296 118v-40h28M296 118v60h28" strokeDasharray="4 5"/></g>
    <g fill="var(--yellow)"><circle cx="56" cy="83" r="8"/><circle cx="118" cy="125" r="8"/><circle cx="76" cy="181" r="8"/><circle cx="367" cy="78" r="8"/><circle cx="411" cy="78" r="8"/><circle cx="455" cy="78" r="8"/></g>
    <g fill="currentColor"><path d="m105 67 9 16-18 0ZM49 135l9 16H40ZM116 174l9 16h-18ZM367 168l9 16h-18ZM411 168l9 16h-18ZM455 168l9 16h-18Z"/></g>
    <g fill="currentColor" fontFamily="monospace" fontSize="11"><text x="30" y="30">01 / MIXTURE</text><text x="340" y="30">02 / SEPARATION</text><text x="30" y="239">OBSERVE → PLAN → EXPERIMENT</text></g>
  </svg>;
}
