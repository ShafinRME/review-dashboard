"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { PasswordInput } from "@/components/auth/password-input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiClientError, api } from "@/lib/api";
import { homeFor } from "@/lib/roles";
import { type LoginValues, loginSchema } from "@/lib/validation/auth";

// Optional demo accounts for reviewers. Set the NEXT_PUBLIC_DEMO_* variables to show them.
const demoAccounts = [
  {
    label: "student",
    email: process.env.NEXT_PUBLIC_DEMO_STUDENT_EMAIL,
    password: process.env.NEXT_PUBLIC_DEMO_STUDENT_PASSWORD,
  },
  {
    label: "mentor",
    email: process.env.NEXT_PUBLIC_DEMO_MENTOR_EMAIL,
    password: process.env.NEXT_PUBLIC_DEMO_MENTOR_PASSWORD,
  },
].filter((a): a is { label: string; email: string; password: string } =>
  Boolean(a.email && a.password),
);

export function LoginForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginValues) {
    setFormError(null);
    try {
      const { user } = await api.auth.login(values);
      setRedirecting(true);
      router.replace(homeFor(user.role));
      router.refresh();
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.status === 400 && err.fieldErrors.length > 0) {
          for (const fe of err.fieldErrors) {
            if (fe.field === "email" || fe.field === "password") {
              setError(fe.field, { message: fe.message });
            }
          }
          return;
        }
        setFormError(
          err.status === 401
            ? "The email or password is incorrect."
            : err.message,
        );
        return;
      }
      toast.error("Something went wrong. Try again.");
    }
  }

  const busy = isSubmitting || redirecting;

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Log in</h1>
      <p className="mt-2 text-muted-foreground">
        Use the email you signed up with.
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="mt-8 space-y-5"
      >
        {formError && (
          <Alert variant="destructive">
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
            {...register("email")}
          />
          {errors.email && (
            <p id="email-error" className="text-sm text-destructive">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "password-error" : undefined}
            {...register("password")}
          />
          {errors.password && (
            <p id="password-error" className="text-sm text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>

        <Button type="submit" className="h-10 w-full" disabled={busy}>
          {busy && <Loader2 className="size-4 animate-spin" />}
          {busy ? "Logging in" : "Log in"}
        </Button>
      </form>

      {demoAccounts.length > 0 && (
        <div className="mt-6 rounded-lg bg-muted p-4">
          <p className="text-sm font-medium">Reviewing this project?</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Fill in a demo account, then log in.
          </p>
          <div className="mt-3 flex gap-2">
            {demoAccounts.map((account) => (
              <Button
                key={account.label}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setFormError(null);
                  setValue("email", account.email, { shouldValidate: true });
                  setValue("password", account.password, {
                    shouldValidate: true,
                  });
                }}
              >
                Fill demo {account.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      <p className="mt-8 text-sm text-muted-foreground">
        New here?{" "}
        <Link
          href="/signup"
          className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}
