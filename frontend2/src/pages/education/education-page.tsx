import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { Trash2, PlusCircle, LoaderCircleIcon, Pencil } from 'lucide-react';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import {
  createEducationSchema,
  type CreateEducation,
} from '@server/sharedTypes';
import {
  createEducation,
  deleteEducation,
  updateEducation,
  getAllEducationQueryOptions,
  loadingCreateEducationQueryOptions,
} from '@/lib/api';

export function EducationPage() {
  const queryClient = useQueryClient();

  const { data, isPending } = useQuery(getAllEducationQueryOptions);
  const { data: loadingData } = useQuery(loadingCreateEducationQueryOptions);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const form = useForm<CreateEducation>({
    resolver: zodResolver(createEducationSchema),
    defaultValues: {
      institution: '',
      degree: '',
      fieldOfStudy: '',
      startYear: new Date().getFullYear(),
      endYear: null,
      description: '',
    },
  });

  async function onSubmit(values: CreateEducation) {
    setIsProcessing(true);
    const existing = await queryClient.ensureQueryData(
      getAllEducationQueryOptions
    );

    try {
      if (editingId !== null) {
        // Update logic
        const { education: updatedEntry } = await updateEducation({ id: editingId, value: values });

        queryClient.setQueryData(getAllEducationQueryOptions.queryKey, {
          ...existing,
          education: (existing.education ?? []).map((e: any) =>
            e.id === editingId ? updatedEntry : e
          ),
        });

        toast('Education Updated', {
          description: `Updated ${updatedEntry.degree} at ${updatedEntry.institution}`,
        });
        setEditingId(null);
      } else {
        // Create logic
        // Optimistic UI
        queryClient.setQueryData(loadingCreateEducationQueryOptions.queryKey, {
          education: values,
        });

        const newEntry = await createEducation({ value: values });

        queryClient.setQueryData(getAllEducationQueryOptions.queryKey, {
          ...existing,
          education: [newEntry, ...(existing.education ?? [])],
        });

        toast('Education Added', {
          description: `Added ${newEntry.degree} at ${newEntry.institution}`,
        });
      }

      form.reset();
    } catch {
      toast('Error', {
        description: `Failed to ${editingId !== null ? 'update' : 'add'} education entry`,
      });
    } finally {
      queryClient.setQueryData(loadingCreateEducationQueryOptions.queryKey, {});
      setIsProcessing(false);
    }
  }

  function handleEdit(entry: any) {
    setEditingId(entry.id);
    form.reset({
      institution: entry.institution,
      degree: entry.degree,
      fieldOfStudy: entry.fieldOfStudy,
      startYear: entry.startYear,
      endYear: entry.endYear,
      description: entry.description,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleCancelEdit() {
    setEditingId(null);
    form.reset({
      institution: '',
      degree: '',
      fieldOfStudy: '',
      startYear: new Date().getFullYear(),
      endYear: null,
      description: '',
    });
  }

  async function handleDelete(id: number) {
    const existing = await queryClient.ensureQueryData(
      getAllEducationQueryOptions
    );

    // Optimistic removal
    queryClient.setQueryData(getAllEducationQueryOptions.queryKey, {
      ...existing,
      education: (existing.education ?? []).filter((e: any) => e.id !== id),
    });

    try {
      await deleteEducation({ id });
      toast('Removed', { description: 'Education entry deleted' });
      if (editingId === id) handleCancelEdit();
    } catch {
      // Roll back
      queryClient.setQueryData(getAllEducationQueryOptions.queryKey, existing);
      toast('Error', { description: 'Failed to delete entry' });
    }
  }

  const entries = data?.education ?? [];
  const optimisticEntry = loadingData?.education;

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-8">
      {/* Form Card */}
      <Card className={editingId !== null ? 'border-primary ring-1 ring-primary' : ''}>
        <CardHeader>
          <CardTitle>{editingId !== null ? 'Edit Education' : 'Add Education'}</CardTitle>
          <CardDescription>
            {editingId !== null
              ? 'Modify your educational qualification or certification.'
              : 'Add a new educational qualification or certification.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="institution"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Institution *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. MIT" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="degree"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Degree / Certification *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Bachelor of Science" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fieldOfStudy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Field of Study *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Computer Science" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4">
                <FormField
                  control={form.control}
                  name="startYear"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Start Year *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1900}
                          max={2100}
                          value={field.value}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          onBlur={field.onBlur}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endYear"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>
                        End Year{' '}
                        <span className="text-muted-foreground text-xs">
                          (leave blank if ongoing)
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1900}
                          max={2100}
                          value={field.value ?? ''}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === '' ? null : Number(e.target.value)
                            )
                          }
                          onBlur={field.onBlur}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Description{' '}
                      <span className="text-muted-foreground text-xs">
                        (optional)
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Brief description…"
                        value={field.value ?? ''}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-2">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <span className="flex items-center gap-2">
                      <LoaderCircleIcon className="h-4 w-4 animate-spin" /> {editingId !== null ? 'Updating...' : 'Adding...'}
                    </span>
                  ) : (
                    <>
                      {editingId !== null ? (
                        <>
                          <Pencil className="mr-2 h-4 w-4" /> Update Education
                        </>
                      ) : (
                        <>
                          <PlusCircle className="mr-2 h-4 w-4" /> Add Education
                        </>
                      )}
                    </>
                  )}
                </Button>
                {editingId !== null && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancelEdit}
                    disabled={isProcessing}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Entries List */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Your Education</h3>

        {isPending && <p className="text-muted-foreground text-sm">Loading…</p>}

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

        {entries.map((entry: any) => (
          <EducationCard
            key={entry.id}
            institution={entry.institution}
            degree={entry.degree}
            fieldOfStudy={entry.fieldOfStudy}
            startYear={entry.startYear}
            endYear={entry.endYear}
            description={entry.description}
            isEditing={editingId === entry.id}
            onEdit={() => handleEdit(entry)}
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
  onEdit,
  onDelete,
  isPending,
  isEditing,
}: {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startYear: number;
  endYear: number | null;
  description: string | null;
  onEdit?: () => void;
  onDelete?: () => void;
  isPending?: boolean;
  isEditing?: boolean;
}) {
  return (
    <Card className={cn(isPending && 'opacity-50', isEditing && 'border-primary ring-1 ring-primary')}>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-0.5">
            <p className="font-semibold">{degree}</p>
            <p className="text-sm text-muted-foreground">
              {institution} · {fieldOfStudy}
            </p>
            <p className="text-xs text-muted-foreground">
              {startYear} – {endYear ?? 'Present'}
            </p>
            {description && <p className="text-sm mt-1">{description}</p>}
          </div>
          <div className="flex gap-1 shrink-0">
            {onEdit && (
              <Button
                size="icon"
                variant="ghost"
                onClick={onEdit}
                className="h-8 w-8 text-muted-foreground hover:text-primary"
                disabled={isEditing}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                size="icon"
                variant="ghost"
                onClick={onDelete}
                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

