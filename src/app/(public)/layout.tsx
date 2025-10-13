import type { ReactNode } from "react";

import { PublicLayout } from "@/app/layouts/PublicLayout";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return <PublicLayout>{children}</PublicLayout>;
}
