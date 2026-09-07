import { Shell } from "@/components/Shell";

/** Everything under this group is the signed-in product, and gets the sidebar. */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <Shell>{children}</Shell>;
}
