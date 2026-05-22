import { SignIn } from "@clerk/nextjs";

import { getCDNDomain } from "@/lib/utils";

export default function SignInPage() {
  return (
    <div className="w-full max-w-md mx-auto p-4 flex flex-col justify-center items-center select-none">
      <div className="mb-6 flex flex-col gap-2 text-center">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-accent to-[#8b5cf6] flex items-center justify-center text-white font-bold text-xl mx-auto shadow-lg">
          S
        </div>
        <h1 className="text-xl font-bold text-text-primary mt-3">
          CDN Admin Authentication
        </h1>
        <p className="text-xs text-text-secondary">
          Sign in via Clerk to manage {getCDNDomain()}
        </p>
      </div>

      <SignIn
        path="/admin/sign-in"
        routing="path"
        appearance={{
          elements: {
            rootBox: "w-full shadow-2xl border border-border rounded-xl overflow-hidden",
            card: "bg-bg-surface border-0",
            headerTitle: "text-text-primary",
            headerSubtitle: "text-text-secondary",
            socialButtonsBlockButton: "bg-bg-base border border-border text-text-primary hover:bg-bg-hover",
            formButtonPrimary: "bg-accent hover:bg-accent-hover text-white font-semibold border-0 transition-all shadow",
            footerAction: "hidden", // Hide standard signup actions to prevent user self-registration
            dividerLine: "bg-border",
            dividerText: "text-text-tertiary",
            formFieldLabel: "text-text-secondary text-xs",
            formFieldInput: "bg-bg-base border-border text-text-primary focus:border-border-strong",
            identityPreviewText: "text-text-primary",
          },
        }}
      />
    </div>
  );
}
