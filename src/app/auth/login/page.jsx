import { LoginForm } from "@/components/auth/login-form";
import { Suspense } from "react";
export default function Page() {
  return (
       <Suspense fallback={<div>Loading...</div>}>
    <div className="flex h-[90vh] w-full items-center justify-center p-6 md:p-4">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
    </Suspense>
  );
}
