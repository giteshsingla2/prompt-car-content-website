import { notFound } from "next/navigation";

// Old /admin URL is now disabled.
// The admin panel is accessed via a private URL.
export default function AdminPage() {
  notFound();
}
