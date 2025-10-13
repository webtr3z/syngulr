import type { ReactNode } from "react";

import { MainLayout } from "@/app/layouts/MainLayout";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <MainLayout>{children}</MainLayout>;
}
