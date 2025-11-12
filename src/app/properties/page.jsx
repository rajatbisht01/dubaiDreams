"use client";

import { Suspense } from "react";
import PropertiesPage from "@/components/PropertiesPage";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading properties...</div>}>
      <PropertiesPage />
    </Suspense>
  );
}
