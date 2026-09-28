export function teacherCanDeleteRoom(input: {
  userId?: string;
  ownerUserId?: string | null;
  suppliedTeacherToken?: string | null;
  roomTeacherToken?: string;
}) {
  if (input.ownerUserId) return input.userId === input.ownerUserId;
  return Boolean(
    input.roomTeacherToken &&
    input.suppliedTeacherToken === input.roomTeacherToken,
  );
}
