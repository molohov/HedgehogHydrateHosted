import Image from "next/image";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-parchment px-4">
      <div className="w-full max-w-md rounded-3xl bg-soft-cream/95 p-8 shadow-lg">
        <div className="mb-6 text-center">
          <Image
            src="/icons/hedgehog.jpg"
            alt=""
            width={72}
            height={72}
            className="mx-auto rounded-2xl"
            priority
          />
          <h1 className="mt-3 text-3xl font-bold text-moss">Hedgehog Hydrate</h1>
          <p className="mt-2 text-sm text-woodland-muted">
            Sign in with your admin-provided account.
          </p>
        </div>
        <LoginForm />
        <p className="mt-6 text-center text-xs text-woodland-muted">
          Need access? Ask your admin to create an account for you.
        </p>
      </div>
    </div>
  );
}
