import { redirect } from "next/navigation";

// Keep existing bookmarks working after removing student character setup.
export default function FormerAvatarPage() {
  redirect("/student/classroom");
}
