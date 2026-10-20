import type { Metadata } from "next";
import { MentorDashboard } from "@/components/mentor/mentor-dashboard";

export const metadata: Metadata = { title: "Mentor" };

export default function MentorPage() {
  return <MentorDashboard />;
}
