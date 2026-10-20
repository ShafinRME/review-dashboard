"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Circle, Loader2 } from "lucide-react";
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
import { cn } from "@/lib/utils";
import {
  type SignupValues,
  passwordRules,
  signupSchema,
} from "@/lib/validation/auth";

function PasswordChecklist({ value }: { value: string }) {
  return (
    <ul className="space-y-1.5 text-sm" aria-label="Password requirements">
      {passwordRules.map((rule) => {
        const met = rule.test(value);
        return (
          <li
            key={rule.id}
            className={cn(
              "flex items-center gap-2 transition-colors",
              met ? "text-[#0f6b45]" : "text-muted-foreground",
            )}
          >
            {met ? <Check className="size-4" /> : <Circle className="size-4" />}
            {rule.label}
            <span className="sr-only">{met ? "(met)" : "(not met)"}</span>
          </li>
        );
      })}
    </ul>
  );
}

export function SignupForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const password = watch("password");

  async function onSubmit(values: SignupValues) {
    setFormError(null);
    try {
      const { user } = await api.auth.signup(values);
      setRedirecting(true);
      toast.success("Account created. Welcome aboard.");
      router.replace(homeFor(user.role));
      router.refresh();
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.status === 409) {
          setError("email", {
            message: "An account with this email already exists.",
          });
          return;
        }
        if (err.status === 400 && err.fieldErrors.length > 0) {
          for (const fe of err.fieldErrors) {
            if (
              fe.field === "name" ||
              fe.field === "email" ||
              fe.field === "password"
            ) {
              setError(fe.field, { message: fe.message });
            }
          }
          return;
        }
        setFormError(err.message);
        return;
      }
      toast.error("Something went wrong. Try again.");
    }
  }

  const busy = isSubmitting || redirecting;

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">
        Create your account
      </h1>
      <p className="mt-2 text-muted-foreground">
        Student accounts can submit projects. Mentor accounts are created by the
        team.
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
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            autoComplete="name"
            placeholder="Your full name"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "name-error" : undefined}
            {...register("name")}
          />
          {errors.name && (
            <p id="name-error" className="text-sm text-destructive">
              {errors.name.message}
            </p>
          )}
        </div>

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
            autoComplete="new-password"
            aria-invalid={!!errors.password}
            aria-describedby="password-rules"
            {...register("password")}
          />
          <div id="password-rules" className="pt-1">
            <PasswordChecklist value={password ?? ""} />
          </div>
          {errors.password && (
            <p className="text-sm text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>

        <Button type="submit" className="h-10 w-full" disabled={busy}>
          {busy && <Loader2 className="size-4 animate-spin" />}
          {busy ? "Creating account" : "Create account"}
        </Button>
      </form>

      <p className="mt-8 text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}
