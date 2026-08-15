import { z as zod } from 'zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useBoolean } from 'minimal-shared/hooks';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
import { useRouter, useSearchParams } from 'src/routes/hooks';

import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';

import { getErrorMessage } from '../../utils';
import { FormHead } from '../../components/form-head';
import { resetPassword } from '../../context/better-auth';

// ----------------------------------------------------------------------

export type ResetPasswordSchemaType = zod.infer<typeof ResetPasswordSchema>;

export const ResetPasswordSchema = zod
  .object({
    newPassword: zod.string().min(1, { message: 'New password is required!' }).min(6, { message: 'Password must be at least 6 characters!' }),
    confirmNewPassword: zod.string().min(1, { message: 'Confirm password is required!' }),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Passwords do not match!',
    path: ['confirmNewPassword'],
  });

export function BetterAuthResetPasswordView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const showPassword = useBoolean();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const defaultValues: ResetPasswordSchemaType = {
    newPassword: '',
    confirmNewPassword: '',
  };

  const methods = useForm<ResetPasswordSchemaType>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (!token) {
        setErrorMessage('Invalid or missing reset token.');
        return;
      }
      
      setErrorMessage(null);
      await resetPassword(data.newPassword, token);
      
      router.push(paths.auth.betterAuth.signIn);
    } catch (error) {
      console.error(error);
      const feedbackMessage = getErrorMessage(error);
      setErrorMessage(feedbackMessage);
    }
  });

  const renderForm = () => (
    <Box sx={{ gap: 3, display: 'flex', flexDirection: 'column' }}>
      <Field.Text
        name="newPassword"
        label="New password"
        type={showPassword.value ? 'text' : 'password'}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={showPassword.onToggle} edge="end">
                  <Iconify
                    icon={showPassword.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                  />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
        helperText={
          <Box component="span" sx={{ gap: 0.5, display: 'flex', alignItems: 'center' }}>
            <Iconify icon="solar:info-circle-bold" width={16} /> Password must be minimum 6+
          </Box>
        }
      />

      <Field.Text
        name="confirmNewPassword"
        type={showPassword.value ? 'text' : 'password'}
        label="Confirm new password"
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={showPassword.onToggle} edge="end">
                  <Iconify
                    icon={showPassword.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                  />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />

      <Button
        fullWidth
        color="inherit"
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
        loadingIndicator="Updating password..."
      >
        Update password
      </Button>
    </Box>
  );

  return (
    <>
      <FormHead
        icon={<Iconify icon={"solar:password-minimalistic-bold" as any} width={64} sx={{ color: 'primary.main', mb: 1 }} />}
        title="Reset your password"
        description="Please enter your new password below."
        sx={{ textAlign: 'center' }}
      />

      {!!errorMessage && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMessage}
        </Alert>
      )}

      <Form methods={methods} onSubmit={onSubmit}>
        {renderForm()}
      </Form>

      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Link
          component={RouterLink}
          href={paths.auth.betterAuth.signIn}
          color="inherit"
          variant="subtitle2"
          sx={{
            gap: 0.5,
            display: 'inline-flex',
            alignItems: 'center',
          }}
        >
          <Iconify icon="eva:arrow-ios-back-fill" width={16} />
          Return to sign in
        </Link>
      </Box>
    </>
  );
}
