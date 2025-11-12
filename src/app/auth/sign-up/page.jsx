import { SignUpForm } from "@/components/auth/sign-up-form";
import { Suspense } from "react";
export default function Page() {
  return (
       <Suspense fallback={<div>Loading...</div>}>
    <div className="flex h-[90vh] w-full items-center justify-center p-6 md:p-4">
      <div className="w-full max-w-sm">
        <SignUpForm />
      </div>
    </div>
    </Suspense>
  );
}
