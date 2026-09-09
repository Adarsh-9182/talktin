import { Shell } from "@/components/Shell";
import { HOSTED_CONFIGURED } from "@/lib/hosted";

/** Everything under this group is the signed-in product, and gets the sidebar. */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  // Read here, on the server, and handed to the sidebar as a plain boolean.
  return <Shell hostedConfigured={HOSTED_CONFIGURED}>{children}</Shell>;
}
