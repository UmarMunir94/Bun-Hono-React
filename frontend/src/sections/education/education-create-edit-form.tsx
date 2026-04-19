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

import { createEducation } from 'src/lib/api';

import { toast } from 'src/components/snackbar';
import { Form, Field } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export type EducationCreateSchemaType = zod.infer<typeof EducationCreateSchema>;

export const EducationCreateSchema = zod.object({
  institution: zod.string().min(2, { message: 'Institution must be at least 2 characters!' }),
  degree: zod.string().min(2, { message: 'Degree must be at least 2 characters!' }),
  fieldOfStudy: zod.string().min(2, { message: 'Field of study must be at least 2 characters!' }),
  startYear: zod.number().int().min(1900).max(2100),
  endYear: zod.number().int().min(1900).max(2100).nullable().optional(),
  description: zod.string().nullable().optional(),
});

// ----------------------------------------------------------------------

export function EducationCreateEditForm() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const defaultValues: EducationCreateSchemaType = {
    institution: '',
    degree: '',
    fieldOfStudy: '',
    startYear: new Date().getFullYear(),
    endYear: null,
    description: '',
  };

  const methods = useForm<EducationCreateSchemaType>({
    mode: 'onSubmit',
    resolver: zodResolver(EducationCreateSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const createMutation = useMutation({
    mutationFn: createEducation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get-all-education"] });
      reset();
      toast.success('Create success!');
      router.push(paths.dashboard.education.list);
    },
    onError: (error) => {
      console.error(error);
      toast.error('Failed to create education records.');
    }
  });

  const onSubmit = handleSubmit(async (data) => {
    createMutation.mutate({ value: data });
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
              <Field.Text name="institution" label="Institution" />
              <Field.Text name="degree" label="Degree" />
              <Field.Text name="fieldOfStudy" label="Field of Study" />
              
              <Field.Text 
                name="startYear" 
                label="Start Year" 
                type="number"
                onChange={(e) => methods.setValue('startYear', parseInt(e.target.value) || 0)}
              />
              <Field.Text 
                name="endYear" 
                label="End Year (Optional)" 
                type="number"
                onChange={(e) => methods.setValue('endYear', e.target.value ? parseInt(e.target.value) : null)}
              />
              <Field.Text name="description" label="Description" multiline rows={4} sx={{ gridColumn: '1 / -1' }} />
            </Box>

            <Stack sx={{ mt: 3, alignItems: 'flex-end' }}>
              <Button type="submit" variant="contained" loading={isSubmitting || createMutation.isPending}>
                Create Education
              </Button>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Form>
  );
}
