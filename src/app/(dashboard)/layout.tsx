import type { ReactNode } from "react";

import { MainLayout } from "@/app/layouts/MainLayout";
import { TokenGate } from "@/components/auth/TokenGate";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <TokenGate>
      <MainLayout>{children}</MainLayout>
    </TokenGate>
  );
}
