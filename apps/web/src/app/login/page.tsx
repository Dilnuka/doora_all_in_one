import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-doora-orange-soft via-white to-doora-surface px-4">
      <LoginForm callbackUrl={params.callbackUrl} />
    </div>
  );
}
