import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { createEvent, updateEvent } from 'src/lib/api';

import { toast } from 'src/components/snackbar';
import { Form, Field } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export const EventSchema = zod.object({
  name: zod.string().min(2, { message: 'Name must be at least 2 characters!' }),
  location: zod.string().min(2, { message: 'Location must be at least 2 characters!' }),
  slots: zod.number().int().min(1, { message: 'Slots must be at least 1!' }),
  dateAndTime: zod.string().min(1, { message: 'Date and time is required!' }),
  description: zod.string().max(1000).nullable().optional(),
  isPrivate: zod.boolean(),
  autoApprove: zod.boolean(),
});

// Use zod.output to get the resolved (post-transform) type
export type EventSchemaType = zod.output<typeof EventSchema>;

// ----------------------------------------------------------------------

export type EventCurrentData = {
  id: number;
  name: string;
  location: string;
  slots: number;
  dateAndTime: string;
  description?: string | null;
  isPrivate: boolean;
  autoApprove: boolean;
};

type Props = {
  currentData?: EventCurrentData;
};

export function EventCreateEditForm({ currentData }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEdit = !!currentData;

  const defaultValues: EventSchemaType = {
    name: currentData?.name ?? '',
    location: currentData?.location ?? '',
    slots: currentData?.slots ?? 10,
    dateAndTime: currentData?.dateAndTime ?? new Date().toISOString(),
    description: currentData?.description ?? '',
    isPrivate: currentData?.isPrivate ?? false,
    autoApprove: currentData?.autoApprove ?? false,
  };

  const methods = useForm<EventSchemaType>({
    mode: 'onSubmit',
    resolver: zodResolver(EventSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
    watch,
  } = methods;

  const isPrivate = watch('isPrivate');

  const createMutation = useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      reset();
      toast.success('Event created successfully!');
      queryClient.invalidateQueries({ queryKey: ['get-all-events'] });
      router.push(paths.dashboard.events.list);
    },
    onError: (error) => {
      console.error(error);
      toast.error('Failed to create event.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateEvent,
    onSuccess: () => {
      toast.success('Event updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['get-all-events'] });
      queryClient.invalidateQueries({ queryKey: ['get-event', currentData?.id] });
      router.push(paths.dashboard.events.list);
    },
    onError: (error) => {
      console.error(error);
      toast.error('Failed to update event.');
    },
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  const onSubmit = handleSubmit(async (data) => {
    if (isEdit) {
      updateMutation.mutate({ id: currentData.id, value: data });
    } else {
      createMutation.mutate({ value: data });
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
              <Field.Text name="name" label="Event Name" />
              <Field.Text name="location" label="Location" />

              <Field.Text
                name="slots"
                label="Number of Slots"
                type="number"
                onChange={(e) => methods.setValue('slots', parseInt(e.target.value) || 0)}
              />
              
              <Field.DateTimePicker
                name="dateAndTime"
                label="Date and Time"
                slotProps={{
                  textField: {
                    fullWidth: true,
                  },
                }}
              />

              <Field.Text
                name="description"
                label="Description"
                multiline
                rows={4}
                sx={{ gridColumn: '1 / -1' }}
              />

              <Box sx={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="subtitle2">Visibility & Settings</Typography>
                <Field.Checkbox name="isPrivate" label="Make this event private" />
                {!isPrivate && (
                  <Field.Checkbox name="autoApprove" label="Auto-approve join requests" />
                )}
              </Box>
            </Box>

            <Stack sx={{ mt: 3, alignItems: 'flex-end' }}>
              <Button type="submit" variant="contained" loading={isSubmitting || isPending}>
                {isEdit ? 'Save Changes' : 'Create Event'}
              </Button>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Form>
  );
}
