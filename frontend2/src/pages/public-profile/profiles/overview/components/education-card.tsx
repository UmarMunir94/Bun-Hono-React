import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllEducationQueryOptions,
  createEducation,
  updateEducation,
  deleteEducation,
} from '@/lib/api';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Plus, SquarePen, Trash2, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';

const formSchema = z.object({
  institution: z.string().min(2, 'Institution is required'),
  degree: z.string().min(2, 'Degree is required'),
  fieldOfStudy: z.string().min(2, 'Field of study is required'),
  startYear: z.coerce.number().min(1900, 'Invalid year').max(2100, 'Invalid year'),
  endYear: z.coerce.number().min(1900, 'Invalid year').max(2100, 'Invalid year').optional().nullable(),
  description: z.string().max(500, 'Max 500 characters').optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

export function EducationCard() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery(getAllEducationQueryOptions);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      institution: '',
      degree: '',
      fieldOfStudy: '',
      startYear: new Date().getFullYear(),
      endYear: null,
      description: '',
    },
  });

  const createMutation = useMutation({
    mutationFn: createEducation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get-all-education'] });
      setIsDialogOpen(false);
      toast.success('Education added successfully');
    },
    onError: () => toast.error('Failed to add education'),
  });

  const updateMutation = useMutation({
    mutationFn: updateEducation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get-all-education'] });
      setIsDialogOpen(false);
      toast.success('Education updated successfully');
    },
    onError: () => toast.error('Failed to update education'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteEducation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get-all-education'] });
      setIsDialogOpen(false);
      toast.success('Education deleted successfully');
    },
    onError: () => toast.error('Failed to delete education'),
  });

  function handleOpenAdd() {
    setEditingId(null);
    form.reset({
      institution: '',
      degree: '',
      fieldOfStudy: '',
      startYear: new Date().getFullYear(),
      endYear: null,
      description: '',
    });
    setIsDialogOpen(true);
  }

  function handleOpenEdit(education: any) {
    setEditingId(education.id);
    form.reset({
      institution: education.institution,
      degree: education.degree,
      fieldOfStudy: education.fieldOfStudy,
      startYear: education.startYear,
      endYear: education.endYear,
      description: education.description,
    });
    setIsDialogOpen(true);
  }

  function onSubmit(values: FormValues) {
    if (editingId) {
      updateMutation.mutate({ id: editingId, value: values });
    } else {
      createMutation.mutate({ value: values });
    }
  }

  function handleDelete(id: number) {
    if (confirm('Are you sure you want to delete this entry?')) {
      deleteMutation.mutate({ id });
    }
  }

  const entries = (data as any)?.education || [];
  const isPending = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="size-5 text-primary" />
            Education
          </CardTitle>
          <Button variant="ghost" mode="icon" onClick={handleOpenAdd}>
            <Plus className="size-5" />
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Loading...</div>
          ) : entries.length === 0 ? (
            <div className="text-sm text-muted-foreground italic">No education added yet.</div>
          ) : (
            <div className="space-y-6">
              {entries.map((entry: any) => (
                <div key={entry.id} className="group relative flex flex-col gap-1">
                  <div className="absolute right-0 top-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" mode="icon" onClick={() => handleOpenEdit(entry)} className="size-8">
                      <SquarePen className="size-4" />
                    </Button>
                    <Button variant="ghost" mode="icon" onClick={() => handleDelete(entry.id)} className="size-8 text-destructive hover:text-destructive">
                      <Trash2 className="size-4" />
                    </Button>
                  </div>

                  
                  <div className="font-semibold text-foreground pr-8">
                    {entry.institution}
                  </div>
                  <div className="text-sm text-foreground">
                    {entry.degree} in {entry.fieldOfStudy}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {entry.startYear} - {entry.endYear || 'Present'}
                  </div>
                  {entry.description && (
                    <div className="text-sm text-muted-foreground mt-1 whitespace-pre-line">
                      {entry.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Education' : 'Add Education'}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
              <FormField
                control={form.control}
                name="institution"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Institution <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Harvard University" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="degree"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Degree <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Bachelor of Science" {...field} />
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
                      <FormLabel>Field of Study <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Computer Science" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Year <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="2018" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Year</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="2022" value={field.value || ''} onChange={field.onChange} />
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
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your studies, awards, or activities..." 
                        className="resize-none" 
                        {...field} 
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="pt-4 flex justify-end">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    disabled={isPending}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isPending}>
                    {isPending ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
