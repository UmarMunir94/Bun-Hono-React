import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { isValidPhoneNumber } from 'react-phone-number-input/input';
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

import { userQueryOptions, updateGeneralInfo, getGeneralInfoQueryOptions } from 'src/lib/api';

import { toast } from 'src/components/snackbar';
import { Form, Field, schemaHelper } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export type UpdateUserSchemaType = zod.infer<typeof UpdateUserSchema>;

export const UpdateUserSchema = zod.object({
  firstName: zod.string().min(1, { message: 'First name is required!' }),
  lastName: zod.string().min(1, { message: 'Last name is required!' }),
  email: zod
    .string()
    .min(1, { message: 'Email is required!' })
    .email({ message: 'Email must be a valid email address!' }),
  photoURL: zod.custom<File | string | null>(),
  phoneNumber: schemaHelper.phoneNumber({ isValid: isValidPhoneNumber }).optional().or(zod.literal('')),
  country: zod.string().nullable().optional().or(zod.literal('')),
  address: zod.string().optional().or(zod.literal('')),
  state: zod.string().optional().or(zod.literal('')),
  city: zod.string().optional().or(zod.literal('')),
  zipCode: zod.string().optional().or(zod.literal('')),
  about: zod.string().optional().or(zod.literal('')),
  linkedinProfile: zod.string().url({ message: 'Must be a valid URL' }).optional().or(zod.literal('')),
  // Not required
  isPublic: zod.boolean(),
});

// ----------------------------------------------------------------------

export function AccountGeneral() {
  const queryClient = useQueryClient();

  // ── Fetch live data from the API ─────────────────────────────────────────
  const { data } = useSuspenseQuery(getGeneralInfoQueryOptions);
  const info = data?.generalInfo;

  const defaultValues: UpdateUserSchemaType = {
    firstName: '',
    lastName: '',
    email: '',
    photoURL: null,
    phoneNumber: '',
    country: null,
    address: '',
    state: '',
    city: '',
    zipCode: '',
    about: '',
    linkedinProfile: '',
    isPublic: false,
  };

  const methods = useForm<UpdateUserSchemaType>({
    mode: 'all',
    resolver: zodResolver(UpdateUserSchema),
    defaultValues,
    // `values` re-syncs the form whenever the query data changes
    values: {
      firstName: info?.firstName ?? '',
      lastName: info?.lastName ?? '',
      email: info?.email ?? '',
      // avatarUrl from DB is a URL string; UploadAvatar accepts string | File | null
      photoURL: info?.avatarUrl ?? null,
      phoneNumber: info?.phone ?? '',
      country: info?.country ?? null,
      address: info?.address ?? '',
      state: info?.state ?? '',
      city: info?.city ?? '',
      zipCode: info?.zipCode ?? '',
      about: info?.about ?? '',
      linkedinProfile: info?.linkedinProfile ?? '',
      isPublic: false,
    },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (formData) => {
    try {
      // Build the payload — avatarUrl only if it's already a string URL
      // (File objects from UploadAvatar are not yet uploaded to a CDN)
      const avatarUrl =
        typeof formData.photoURL === 'string' ? formData.photoURL : info?.avatarUrl ?? undefined;

      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phoneNumber || null,
        country: formData.country ?? null,
        city: formData.city || null,
        address: formData.address || null,
        state: formData.state || null,
        zipCode: formData.zipCode || null,
        about: formData.about || null,
        linkedinProfile: formData.linkedinProfile || null,
        avatarUrl: avatarUrl || null,
      };

      // ── Optimistic UI ─────────────────────────────────────────────────────
      // Immediately reflect the update in the cache so the UI feels instant
      queryClient.setQueryData(getGeneralInfoQueryOptions.queryKey, (old) => {
        if (!old) return old;
        return {
          ...old,
          generalInfo: {
            ...old.generalInfo,
            ...payload,
            phone: payload.phone ?? null,
            country: payload.country ?? null,
            city: payload.city ?? null,
            address: payload.address ?? null,
            state: payload.state ?? null,
            zipCode: payload.zipCode ?? null,
            about: payload.about ?? null,
            linkedinProfile: payload.linkedinProfile ?? null,
            avatarUrl: payload.avatarUrl ?? null,
          },
        };
      });

      await updateGeneralInfo({ value: payload });

      // Refresh the cache with the canonical server response
      await queryClient.invalidateQueries({ queryKey: getGeneralInfoQueryOptions.queryKey });
      await queryClient.invalidateQueries({ queryKey: userQueryOptions.queryKey });

      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error(error);
      // Roll back optimistic update
      await queryClient.invalidateQueries({ queryKey: getGeneralInfoQueryOptions.queryKey });
      toast.error('Failed to update profile. Please try again.');
    }
  });

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        {/* <Grid size={{ xs: 12, md: 4 }}>
          <Card
            sx={{
              pt: 10,
              pb: 5,
              px: 3,
              textAlign: 'center',
            }}
          >
            <Field.UploadAvatar
              name="photoURL"
              maxSize={3145728}
              helperText={
                <Typography
                  variant="caption"
                  sx={{
                    mt: 3,
                    mx: 'auto',
                    display: 'block',
                    textAlign: 'center',
                    color: 'text.disabled',
                  }}
                >
                  Allowed *.jpeg, *.jpg, *.png, *.gif
                  <br /> max size of {fData(3145728)}
                </Typography>
              }
            />
          </Card>
        </Grid> */}

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
              <Field.Text name="firstName" label="First name" />
              <Field.Text name="lastName" label="Last name" />

              {/* Email is read-only — changes require a separate verification flow */}
              <Field.Text
                name="email"
                label="Email address"
                disabled
                helperText="Contact support to change your email"
              />

              <Field.Phone name="phoneNumber" label="Phone number" />
              <Field.Text name="address" label="Address" />

              <Field.CountrySelect name="country" label="Country" placeholder="Choose a country" />

              <Field.Text name="state" label="State/region" />
              <Field.Text name="city" label="City" />
              <Field.Text name="zipCode" label="Zip/code" />

              <Field.Text
                name="linkedinProfile"
                label="LinkedIn Profile URL"
                placeholder="https://linkedin.com/in/username"
              />
            </Box>

            <Stack spacing={3} sx={{ mt: 3, alignItems: 'flex-end' }}>
              <Field.Text name="about" multiline rows={4} label="About" sx={{ width: '100%' }} />

              <Button type="submit" variant="contained" loading={isSubmitting}>
                Save changes
              </Button>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Form>
  );
}
