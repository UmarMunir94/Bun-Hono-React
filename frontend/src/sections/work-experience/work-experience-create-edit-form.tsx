import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { createWorkExperience, updateWorkExperience } from 'src/lib/api';

import { toast } from 'src/components/snackbar';
import { Form, Field } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export type WorkExperienceSchemaType = zod.infer<typeof WorkExperienceSchema>;

export const WorkExperienceSchema = zod.object({
  company: zod.string().min(2, { message: 'Company name must be at least 2 characters' }),
  location: zod.string().min(2, { message: 'Location must be at least 2 characters' }),
  position: zod.string().min(2, { message: 'Position must be at least 2 characters' }),
  startDate: zod.string().min(1, { message: 'Start date is required' }),
  endDate: zod.string().optional().nullable(),
  description: zod.string().nullable().optional(),
});

// ----------------------------------------------------------------------

export type WorkExperienceCurrentData = {
  id: number;
  company: string;
  location: string;
  position: string;
  startDate: string;
  endDate?: string | null;
  description?: string | null;
};

type Props = {
  currentData?: WorkExperienceCurrentData;
};

export function WorkExperienceCreateEditForm({ currentData }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEdit = !!currentData;

  const defaultValues: WorkExperienceSchemaType = {
    company: currentData?.company ?? '',
    location: currentData?.location ?? '',
    position: currentData?.position ?? '',
    startDate: currentData?.startDate ?? '',
    endDate: currentData?.endDate ?? '',
    description: currentData?.description ?? '',
  };

  const methods = useForm<WorkExperienceSchemaType>({
    mode: 'onSubmit',
    resolver: zodResolver(WorkExperienceSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const createMutation = useMutation({
    mutationFn: createWorkExperience,
    onMutate: async ({ value }) => {
      await queryClient.cancelQueries({ queryKey: ['get-all-work-experience'] });
      const previous = queryClient.getQueryData(['get-all-work-experience']);

      queryClient.setQueryData(['get-all-work-experience'], (old: any) => {
        if (!old?.workExperience) return old;
        return {
          ...old,
          workExperience: [...old.workExperience, { ...value, id: Math.random() }],
        };
      });

      return { previous };
    },
    onError: (error, variables, context) => {
      console.error(error);
      toast.error('Failed to create work experience record.');
      if (context?.previous) {
        queryClient.setQueryData(['get-all-work-experience'], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['get-all-work-experience'] });
    },
    onSuccess: () => {
      reset();
      toast.success('Create success!');
      router.push(paths.dashboard.workExperience.list);
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateWorkExperience,
    onMutate: async ({ id, value }) => {
      await queryClient.cancelQueries({ queryKey: ['get-all-work-experience'] });
      const previous = queryClient.getQueryData(['get-all-work-experience']);

      queryClient.setQueryData(['get-all-work-experience'], (old: any) => {
        if (!old?.workExperience) return old;
        return {
          ...old,
          workExperience: old.workExperience.map((item: any) =>
            item.id === id ? { ...item, ...value } : item
          ),
        };
      });

      return { previous };
    },
    onError: (error, variables, context) => {
      console.error(error);
      toast.error('Failed to update work experience record.');
      if (context?.previous) {
        queryClient.setQueryData(['get-all-work-experience'], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['get-all-work-experience'] });
    },
    onSuccess: () => {
      toast.success('Update success!');
      router.push(paths.dashboard.workExperience.list);
    },
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  const onSubmit = handleSubmit(async (data) => {
    const payload = {
      ...data,
      endDate: data.endDate && data.endDate.trim() !== '' ? data.endDate : null,
    };
    if (isEdit) {
      updateMutation.mutate({ id: currentData.id, value: payload });
    } else {
      createMutation.mutate({ value: payload });
    }
  });

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <Card sx={{ p: 3 }}>
            <Box
              sx={{
                rowGap: 3,
                columnGap: 2,
                display: 'grid',
                gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
              }}
            >
              <Field.Text name="company" label="Company" />
              <Field.Text name="position" label="Position" />
              <Field.Text name="location" label="Location" />
              <Field.Text name="startDate" label="Start Date (YYYY-MM-DD)" placeholder="e.g. 2022-01-01" />
              <Field.Text name="endDate" label="End Date (Optional, YYYY-MM-DD)" placeholder="e.g. 2023-01-01" />
              <Field.Text
                name="description"
                label="Description"
                multiline
                rows={4}
                sx={{ gridColumn: '1 / -1' }}
              />
            </Box>

            <Stack sx={{ mt: 3, alignItems: 'flex-end' }}>
              <Button type="submit" variant="contained" loading={isSubmitting || isPending}>
                {isEdit ? 'Save Changes' : 'Create Experience'}
              </Button>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Form>
  );
}
