import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { createEducationSchema } from "@server/sharedTypes";
import {
  createEducation,
  deleteEducation,
  getAllEducationQueryOptions,
  loadingCreateEducationQueryOptions,
} from "@/lib/api";

export const Route = createFileRoute("/_authenticated/education")({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(getAllEducationQueryOptions),
  component: EducationPage,
});

function EducationPage() {
  const queryClient = useQueryClient();

  const { data, isPending } = useQuery(getAllEducationQueryOptions);
  const { data: loadingData } = useQuery(loadingCreateEducationQueryOptions);

  const form = useForm({
    validatorAdapter: zodValidator,
    defaultValues: {
      institution: "",
      degree: "",
      fieldOfStudy: "",
      startYear: new Date().getFullYear(),
      endYear: null as number | null,
      description: "",
    },
    onSubmit: async ({ value }) => {
      const existing = await queryClient.ensureQueryData(
        getAllEducationQueryOptions
      );

      // Optimistic UI
      queryClient.setQueryData(loadingCreateEducationQueryOptions.queryKey, {
        education: value,
      });

      try {
        const newEntry = await createEducation({ value });

        queryClient.setQueryData(getAllEducationQueryOptions.queryKey, {
          ...existing,
          education: [newEntry, ...existing.education],
        });

        toast("Education Added", {
          description: `Added ${newEntry.degree} at ${newEntry.institution}`,
        });

        form.reset();
      } catch {
        toast("Error", { description: "Failed to add education entry" });
      } finally {
        queryClient.setQueryData(loadingCreateEducationQueryOptions.queryKey, {});
      }
    },
  });

  async function handleDelete(id: number) {
    const existing = await queryClient.ensureQueryData(
      getAllEducationQueryOptions
    );

    // Optimistic removal
    queryClient.setQueryData(getAllEducationQueryOptions.queryKey, {
      ...existing,
      education: existing.education.filter((e) => e.id !== id),
    });

    try {
      await deleteEducation({ id });
      toast("Removed", { description: "Education entry deleted" });
    } catch {
      // Roll back
      queryClient.setQueryData(getAllEducationQueryOptions.queryKey, existing);
      toast("Error", { description: "Failed to delete entry" });
    }
  }

  const entries = data?.education ?? [];
  const optimisticEntry = loadingData?.education;

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-8">
      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>Add Education</CardTitle>
          <CardDescription>
            Add a new educational qualification or certification.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form.Provider>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                void form.handleSubmit();
              }}
              className="space-y-4"
            >
              {/* Institution */}
              <form.Field
                name="institution"
                validators={{ onChange: createEducationSchema.shape.institution }}
                children={(field) => (
                  <div className="space-y-1">
                    <Label htmlFor={field.name}>Institution *</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      placeholder="e.g. MIT"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    {field.state.meta.touchedErrors ? (
                      <em className="text-sm text-destructive">
                        {field.state.meta.touchedErrors}
                      </em>
                    ) : null}
                  </div>
                )}
              />

              {/* Degree */}
              <form.Field
                name="degree"
                validators={{ onChange: createEducationSchema.shape.degree }}
                children={(field) => (
                  <div className="space-y-1">
                    <Label htmlFor={field.name}>Degree / Certification *</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      placeholder="e.g. Bachelor of Science"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    {field.state.meta.touchedErrors ? (
                      <em className="text-sm text-destructive">
                        {field.state.meta.touchedErrors}
                      </em>
                    ) : null}
                  </div>
                )}
              />

              {/* Field of Study */}
              <form.Field
                name="fieldOfStudy"
                validators={{ onChange: createEducationSchema.shape.fieldOfStudy }}
                children={(field) => (
                  <div className="space-y-1">
                    <Label htmlFor={field.name}>Field of Study *</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      placeholder="e.g. Computer Science"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    {field.state.meta.touchedErrors ? (
                      <em className="text-sm text-destructive">
                        {field.state.meta.touchedErrors}
                      </em>
                    ) : null}
                  </div>
                )}
              />

              {/* Start / End Year */}
              <div className="flex gap-4">
                <form.Field
                  name="startYear"
                  validators={{ onChange: createEducationSchema.shape.startYear }}
                  children={(field) => (
                    <div className="flex-1 space-y-1">
                      <Label htmlFor={field.name}>Start Year *</Label>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="number"
                        min={1900}
                        max={2100}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) =>
                          field.handleChange(Number(e.target.value))
                        }
                      />
                      {field.state.meta.touchedErrors ? (
                        <em className="text-sm text-destructive">
                          {field.state.meta.touchedErrors}
                        </em>
                      ) : null}
                    </div>
                  )}
                />

                <form.Field
                  name="endYear"
                  validators={{ onChange: createEducationSchema.shape.endYear }}
                  children={(field) => (
                    <div className="flex-1 space-y-1">
                      <Label htmlFor={field.name}>
                        End Year{" "}
                        <span className="text-muted-foreground text-xs">
                          (leave blank if ongoing)
                        </span>
                      </Label>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="number"
                        min={1900}
                        max={2100}
                        value={field.state.value ?? ""}
                        onBlur={field.handleBlur}
                        onChange={(e) =>
                          field.handleChange(
                            e.target.value === ""
                              ? null
                              : Number(e.target.value)
                          )
                        }
                      />
                      {field.state.meta.touchedErrors ? (
                        <em className="text-sm text-destructive">
                          {field.state.meta.touchedErrors}
                        </em>
                      ) : null}
                    </div>
                  )}
                />
              </div>

              {/* Description */}
              <form.Field
                name="description"
                children={(field) => (
                  <div className="space-y-1">
                    <Label htmlFor={field.name}>
                      Description{" "}
                      <span className="text-muted-foreground text-xs">
                        (optional)
                      </span>
                    </Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      placeholder="Brief description…"
                      value={field.state.value ?? ""}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </div>
                )}
              />

              <form.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
                children={([canSubmit, isSubmitting]) => (
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={!canSubmit || isSubmitting}
                  >
                    {isSubmitting ? "Adding…" : "Add Education"}
                  </Button>
                )}
              />
            </form>
          </form.Provider>
        </CardContent>
      </Card>

      {/* Entries List */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Your Education</h3>

        {isPending && <p className="text-muted-foreground text-sm">Loading…</p>}

        {/* Optimistic pending entry */}
        {optimisticEntry && (
          <EducationCard
            institution={optimisticEntry.institution}
            degree={optimisticEntry.degree}
            fieldOfStudy={optimisticEntry.fieldOfStudy}
            startYear={optimisticEntry.startYear}
            endYear={optimisticEntry.endYear ?? null}
            description={optimisticEntry.description ?? null}
            isPending
          />
        )}

        {entries.length === 0 && !isPending && !optimisticEntry && (
          <p className="text-muted-foreground text-sm">
            No education entries yet. Add one above!
          </p>
        )}

        {entries.map((entry) => (
          <EducationCard
            key={entry.id}
            institution={entry.institution}
            degree={entry.degree}
            fieldOfStudy={entry.fieldOfStudy}
            startYear={entry.startYear}
            endYear={entry.endYear ?? null}
            description={entry.description ?? null}
            onDelete={() => handleDelete(entry.id)}
          />
        ))}
      </div>
    </div>
  );
}

function EducationCard({
  institution,
  degree,
  fieldOfStudy,
  startYear,
  endYear,
  description,
  onDelete,
  isPending,
}: {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startYear: number;
  endYear: number | null;
  description: string | null;
  onDelete?: () => void;
  isPending?: boolean;
}) {
  return (
    <Card className={isPending ? "opacity-50" : ""}>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-0.5">
            <p className="font-semibold">{degree}</p>
            <p className="text-sm text-muted-foreground">
              {institution} · {fieldOfStudy}
            </p>
            <p className="text-xs text-muted-foreground">
              {startYear} – {endYear ?? "Present"}
            </p>
            {description && (
              <p className="text-sm mt-1">{description}</p>
            )}
          </div>
          {onDelete && (
            <Button
              size="icon"
              variant="ghost"
              onClick={onDelete}
              className="shrink-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
