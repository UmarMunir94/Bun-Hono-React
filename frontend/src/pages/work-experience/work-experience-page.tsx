import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { Trash2, PlusCircle, LoaderCircleIcon, BriefcaseIcon } from 'lucide-react';
import { toast } from 'sonner';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Textarea } from '@/components/ui/textarea';

import {
  createWorkExperienceSchema,
  type CreateWorkExperience,
} from '@server/sharedTypes';
import {
  createWorkExperience,
  deleteWorkExperience,
  getAllWorkExperienceQueryOptions,
  loadingCreateWorkExperienceQueryOptions,
} from '@/lib/api';

export function WorkExperiencePage() {
  const queryClient = useQueryClient();

  const { data, isPending } = useQuery(getAllWorkExperienceQueryOptions);
  const { data: loadingData } = useQuery(loadingCreateWorkExperienceQueryOptions);

  const [isCurrent, setIsCurrent] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const form = useForm<CreateWorkExperience>({
    resolver: zodResolver(createWorkExperienceSchema),
    defaultValues: {
      company: '',
      location: '',
      position: '',
      startDate: '',
      endDate: null,
      description: '',
    },
  });

  async function onSubmit(values: CreateWorkExperience) {
    setIsProcessing(true);
    const existing = await queryClient.ensureQueryData(
      getAllWorkExperienceQueryOptions
    );

    // Optimistic UI
    queryClient.setQueryData(loadingCreateWorkExperienceQueryOptions.queryKey, {
      workExperience: values,
    });

    try {
      const newEntry = await createWorkExperience({ value: values });

      queryClient.setQueryData(getAllWorkExperienceQueryOptions.queryKey, {
        ...existing,
        workExperience: [newEntry, ...(existing.workExperience ?? [])],
      });

      toast('Work Experience Added', {
        description: `Added ${newEntry.position} at ${newEntry.company}`,
      });

      form.reset();
      setIsCurrent(false);
    } catch {
      toast('Error', { description: 'Failed to add work experience entry' });
    } finally {
      queryClient.setQueryData(
        loadingCreateWorkExperienceQueryOptions.queryKey,
        {}
      );
      setIsProcessing(false);
    }
  }

  async function handleDelete(id: number) {
    const existing = await queryClient.ensureQueryData(
      getAllWorkExperienceQueryOptions
    );

    // Optimistic removal
    queryClient.setQueryData(getAllWorkExperienceQueryOptions.queryKey, {
      ...existing,
      workExperience: (existing.workExperience ?? []).filter(
        (e: any) => e.id !== id
      ),
    });

    try {
      await deleteWorkExperience({ id });
      toast('Removed', { description: 'Work experience entry deleted' });
    } catch {
      // Roll back
      queryClient.setQueryData(
        getAllWorkExperienceQueryOptions.queryKey,
        existing
      );
      toast('Error', { description: 'Failed to delete entry' });
    }
  }

  const entries = data?.workExperience ?? [];
  const optimisticEntry = loadingData?.workExperience;

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-8">
      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>Add Work Experience</CardTitle>
          <CardDescription>
            Add a new position or role to your work history.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Acme Inc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Position / Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Senior Software Engineer" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. San Francisco, CA (or Remote)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Start Date *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>
                        End Date{' '}
                        <span className="text-muted-foreground text-xs">
                          (leave blank if current)
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          disabled={isCurrent}
                          value={field.value ?? ''}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === '' ? null : e.target.value
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

              {/* "I currently work here" checkbox */}
              <div className="flex items-center gap-2">
                <Checkbox
                  id="is-current"
                  checked={isCurrent}
                  onCheckedChange={(checked) => {
                    const val = checked === true;
                    setIsCurrent(val);
                    if (val) {
                      form.setValue('endDate', null);
                    }
                  }}
                />
                <label
                  htmlFor="is-current"
                  className="text-sm cursor-pointer select-none"
                >
                  I currently work here
                </label>
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
                      <Textarea
                        placeholder="Brief summary of responsibilities and achievements…"
                        className="resize-none"
                        rows={3}
                        value={field.value ?? ''}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isProcessing}>
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <LoaderCircleIcon className="h-4 w-4 animate-spin" /> Adding...
                  </span>
                ) : (
                  <>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Work Experience
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Entries List */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Your Work History</h3>

        {isPending && (
          <p className="text-muted-foreground text-sm">Loading…</p>
        )}

        {optimisticEntry && (
          <WorkExperienceCard
            company={optimisticEntry.company}
            location={optimisticEntry.location}
            position={optimisticEntry.position}
            startDate={optimisticEntry.startDate}
            endDate={optimisticEntry.endDate ?? null}
            description={optimisticEntry.description ?? null}
            isPending
          />
        )}

        {entries.length === 0 && !isPending && !optimisticEntry && (
          <p className="text-muted-foreground text-sm">
            No work experience entries yet. Add one above!
          </p>
        )}

        {entries.map((entry: any) => (
          <WorkExperienceCard
            key={entry.id}
            company={entry.company}
            location={entry.location}
            position={entry.position}
            startDate={entry.startDate}
            endDate={entry.endDate}
            description={entry.description}
            onDelete={() => handleDelete(entry.id)}
          />
        ))}
      </div>
    </div>
  );
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'Present';
  const [year, month] = dateStr.split('-');
  const date = new Date(Number(year), Number(month) - 1);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
}

function WorkExperienceCard({
  company,
  location,
  position,
  startDate,
  endDate,
  description,
  onDelete,
  isPending,
}: {
  company: string;
  location: string;
  position: string;
  startDate: string;
  endDate: string | null;
  description: string | null;
  onDelete?: () => void;
  isPending?: boolean;
}) {
  return (
    <Card className={isPending ? 'opacity-50' : ''}>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex gap-3">
            <div className="mt-0.5 text-muted-foreground shrink-0">
              <BriefcaseIcon className="h-4 w-4" />
            </div>
            <div className="space-y-0.5">
              <p className="font-semibold">{position}</p>
              <p className="text-sm text-muted-foreground">
                {company} · {location}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDate(startDate)} – {formatDate(endDate)}
              </p>
              {description && (
                <p className="text-sm mt-1 whitespace-pre-line">{description}</p>
              )}
            </div>
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
