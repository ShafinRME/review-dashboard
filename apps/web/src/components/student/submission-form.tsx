"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateSubmission } from "@/hooks/use-submissions";
import { ApiClientError } from "@/lib/api";
import {
  type SubmissionValues,
  createSubmissionSchema,
} from "@/lib/validation/submission";

const FIELDS = ["projectName", "repoUrl", "liveUrl", "description"] as const;
const isField = (name: string): name is (typeof FIELDS)[number] =>
  (FIELDS as readonly string[]).includes(name);

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && (
        <p id={`${id}-error`} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

export function SubmissionForm() {
  const create = useCreateSubmission();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SubmissionValues>({
    resolver: zodResolver(createSubmissionSchema),
    defaultValues: {
      projectName: "",
      repoUrl: "",
      liveUrl: "",
      description: "",
    },
  });

  const descriptionLength = (watch("description") ?? "").length;

  async function onSubmit(values: SubmissionValues) {
    setFormError(null);
    try {
      await create.mutateAsync(values);
      toast.success("Project submitted. A mentor will review it soon.");
      reset();
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.status === 401) return; // session expiry is handled globally
        if (err.status === 409) {
          setError("repoUrl", { message: err.message });
          return;
        }
        if (err.status === 400 && err.fieldErrors.length > 0) {
          for (const fe of err.fieldErrors) {
            if (isField(fe.field)) setError(fe.field, { message: fe.message });
          }
          return;
        }
        if (err.status === 429) {
          setFormError(
            "You have reached the submission limit. Wait a few minutes and try again.",
          );
          return;
        }
        setFormError(err.message);
        return;
      }
      toast.error("Something went wrong. Try again.");
    }
  }

  const invalid = (name: (typeof FIELDS)[number]) => ({
    "aria-invalid": !!errors[name],
    "aria-describedby": errors[name] ? `${name}-error` : undefined,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Submit a project</CardTitle>
        <CardDescription>
          Share the repository and the live link. A mentor reviews every
          submission.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="space-y-5"
        >
          {formError && (
            <Alert variant="destructive">
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}

          <Field
            id="projectName"
            label="Project name"
            error={errors.projectName?.message}
          >
            <Input
              id="projectName"
              autoComplete="off"
              placeholder="Portfolio website"
              {...invalid("projectName")}
              {...register("projectName")}
            />
          </Field>

          <Field
            id="repoUrl"
            label="GitHub repository"
            error={errors.repoUrl?.message}
          >
            <Input
              id="repoUrl"
              inputMode="url"
              autoComplete="off"
              spellCheck={false}
              placeholder="https://github.com/owner/repo"
              {...invalid("repoUrl")}
              {...register("repoUrl")}
            />
          </Field>

          <Field id="liveUrl" label="Live link" error={errors.liveUrl?.message}>
            <Input
              id="liveUrl"
              inputMode="url"
              autoComplete="off"
              spellCheck={false}
              placeholder="https://your-project.vercel.app"
              {...invalid("liveUrl")}
              {...register("liveUrl")}
            />
          </Field>

          <Field
            id="description"
            label="Description"
            error={errors.description?.message}
          >
            <Textarea
              id="description"
              rows={5}
              placeholder="What does it do, and what did you build it with?"
              {...invalid("description")}
              {...register("description")}
            />
            <p
              className="text-right text-xs text-muted-foreground"
              aria-live="polite"
            >
              {descriptionLength}/1000
            </p>
          </Field>

          <Button type="submit" className="h-10 w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            {isSubmitting ? "Submitting" : "Submit project"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
