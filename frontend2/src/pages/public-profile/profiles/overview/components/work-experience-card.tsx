import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllWorkExperienceQueryOptions,
  createWorkExperience,
  updateWorkExperience,
  deleteWorkExperience,
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
import { Plus, SquarePen, Trash2, Briefcase } from 'lucide-react';
import { toast } from 'sonner';

const formSchema = z.object({
  company: z.string().min(2, 'Company is required'),
  location: z.string().min(2, 'Location is required'),
  position: z.string().min(2, 'Position is required'),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD').optional().nullable().or(z.literal('')),
  description: z.string().max(1000, 'Max 1000 characters').optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

export function WorkExperienceCard() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery(getAllWorkExperienceQueryOptions);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      company: '',
      location: '',
      position: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      description: '',
    },
  });

  const createMutation = useMutation({
    mutationFn: createWorkExperience,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get-all-work-experience'] });
      setIsDialogOpen(false);
      toast.success('Work experience added successfully');
    },
    onError: () => toast.error('Failed to add work experience'),
  });

  const updateMutation = useMutation({
    mutationFn: updateWorkExperience,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get-all-work-experience'] });
      setIsDialogOpen(false);
      toast.success('Work experience updated successfully');
    },
    onError: () => toast.error('Failed to update work experience'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteWorkExperience,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get-all-work-experience'] });
      toast.success('Work experience deleted successfully');
    },
    onError: () => toast.error('Failed to delete work experience'),
  });

  function handleOpenAdd() {
    setEditingId(null);
    form.reset({
      company: '',
      location: '',
      position: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      description: '',
    });
    setIsDialogOpen(true);
  }

  function handleOpenEdit(experience: any) {
    setEditingId(experience.id);
    form.reset({
      company: experience.company,
      location: experience.location,
      position: experience.position,
      startDate: experience.startDate,
      endDate: experience.endDate || '',
      description: experience.description || '',
    });
    setIsDialogOpen(true);
  }

  function onSubmit(values: FormValues) {
    // Convert empty string endDate to null for backend
    const payload = {
      ...values,
      endDate: values.endDate === '' ? null : values.endDate
    };
    if (editingId) {
      updateMutation.mutate({ id: editingId, value: payload });
    } else {
      createMutation.mutate({ value: payload });
    }
  }

  function handleDelete(id: number) {
    if (confirm('Are you sure you want to delete this entry?')) {
      deleteMutation.mutate({ id });
    }
  }

  const entries = (data as any)?.workExperience || [];
  const isPending = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="size-5 text-primary" />
            Work Experience
          </CardTitle>
          <Button variant="ghost" mode="icon" onClick={handleOpenAdd}>
            <Plus className="size-5" />
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Loading...</div>
          ) : entries.length === 0 ? (
            <div className="text-sm text-muted-foreground italic">No work experience added yet.</div>
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
                    {entry.position}
                  </div>
                  <div className="text-sm text-foreground">
                    {entry.company} • {entry.location}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {entry.startDate} to {entry.endDate || 'Present'}
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
            <DialogTitle>{editingId ? 'Edit Work Experience' : 'Add Work Experience'}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Position / Title <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Software Engineer" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Acme Corp" {...field} />
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
                      <FormLabel>Location <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="San Francisco, CA" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date <span className="text-destructive">*</span></FormLabel>
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
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input type="date" value={field.value || ''} onChange={field.onChange} />
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
                        placeholder="Describe your responsibilities and achievements..." 
                        className="resize-none h-24" 
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
