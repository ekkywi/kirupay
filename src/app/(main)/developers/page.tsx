import { redirect } from "next/navigation";

export default function DevelopersPageRedirect() {
  redirect("/business?tab=integrations");
}
