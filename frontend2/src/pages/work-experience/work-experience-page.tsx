import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { Trash2, PlusCircle, LoaderCircleIcon, BriefcaseIcon, Pencil } from 'lucide-react';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';
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
  updateWorkExperience,
  deleteWorkExperience,
  getAllWorkExperienceQueryOptions,
  loadingCreateWorkExperienceQueryOptions,
} from '@/lib/api';

export function WorkExperiencePage() {
  const queryClient = useQueryClient();

  const { data, isPending } = useQuery(getAllWorkExperienceQueryOptions);
  const { data: loadingData } = useQuery(loadingCreateWorkExperienceQueryOptions);

  const [editingId, setEditingId] = useState<number | null>(null);
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

    try {
      if (editingId !== null) {
        // Update logic
        const { workExperience: updatedEntry } = await updateWorkExperience({
          id: editingId,
          value: values,
        });

        queryClient.setQueryData(getAllWorkExperienceQueryOptions.queryKey, {
          ...existing,
          workExperience: (existing.workExperience ?? []).map((e: any) =>
            e.id === editingId ? updatedEntry : e
          ),
        });

        toast('Work Experience Updated', {
          description: `Updated ${updatedEntry.position} at ${updatedEntry.company}`,
        });
        setEditingId(null);
      } else {
        // Create logic
        // Optimistic UI
        queryClient.setQueryData(loadingCreateWorkExperienceQueryOptions.queryKey, {
          workExperience: values,
        });

        const newEntry = await createWorkExperience({ value: values });

        queryClient.setQueryData(getAllWorkExperienceQueryOptions.queryKey, {
          ...existing,
          workExperience: [newEntry, ...(existing.workExperience ?? [])],
        });

        toast('Work Experience Added', {
          description: `Added ${newEntry.position} at ${newEntry.company}`,
        });
      }

      form.reset();
      setIsCurrent(false);
    } catch {
      toast('Error', {
        description: `Failed to ${editingId !== null ? 'update' : 'add'} work experience entry`,
      });
    } finally {
      queryClient.setQueryData(
        loadingCreateWorkExperienceQueryOptions.queryKey,
        {}
      );
      setIsProcessing(false);
    }
  }

  function handleEdit(entry: any) {
    setEditingId(entry.id);
    const isNowCurrent = entry.endDate === null;
    setIsCurrent(isNowCurrent);
    form.reset({
      company: entry.company,
      location: entry.location,
      position: entry.position,
      startDate: entry.startDate,
      endDate: entry.endDate,
      description: entry.description,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleCancelEdit() {
    setEditingId(null);
    setIsCurrent(false);
    form.reset({
      company: '',
      location: '',
      position: '',
      startDate: '',
      endDate: null,
      description: '',
    });
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
      if (editingId === id) handleCancelEdit();
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
      <Card className={editingId !== null ? 'border-primary ring-1 ring-primary' : ''}>
        <CardHeader>
          <CardTitle>{editingId !== null ? 'Edit Work Experience' : 'Add Work Experience'}</CardTitle>
          <CardDescription>
            {editingId !== null
              ? 'Modify your position or role in your work history.'
              : 'Add a new position or role to your work history.'}
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
                          <Pencil className="mr-2 h-4 w-4" /> Update Work Experience
                        </>
                      ) : (
                        <>
                          <PlusCircle className="mr-2 h-4 w-4" /> Add Work Experience
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
            isEditing={editingId === entry.id}
            onEdit={() => handleEdit(entry)}
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
  onEdit,
  onDelete,
  isPending,
  isEditing,
}: {
  company: string;
  location: string;
  position: string;
  startDate: string;
  endDate: string | null;
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

