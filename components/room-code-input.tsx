"use client";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { normalizeRoomCode } from "@/lib/room-entry";

export function RoomCodeInput({ value, onChange, disabled, invalid }: {
  value: string; onChange: (value:string)=>void; disabled?: boolean; invalid?: boolean;
}) {
  return <InputOTP id="room-code" name="code" maxLength={6} value={value} onChange={text=>onChange(normalizeRoomCode(text))}
    pasteTransformer={normalizeRoomCode} pattern="^[a-zA-Z0-9]*$" inputMode="text" autoCapitalize="characters" autoComplete="off" spellCheck={false}
    disabled={disabled} aria-invalid={invalid||undefined} aria-describedby="room-code-help room-lookup-state" containerClassName="room-code-control">
    <InputOTPGroup className="room-code-cells" aria-hidden="true">{Array.from({length:6},(_,index)=><InputOTPSlot key={index} index={index}/>)}</InputOTPGroup>
  </InputOTP>;
}
