import { z as zod } from 'zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';

import { getErrorMessage } from '../../utils';
import { FormHead } from '../../components/form-head';
import { forgotPassword } from '../../context/better-auth';

// ----------------------------------------------------------------------

export type ForgotPasswordSchemaType = zod.infer<typeof ForgotPasswordSchema>;

export const ForgotPasswordSchema = zod.object({
  email: zod
    .string()
    .min(1, { message: 'Email is required!' })
    .email({ message: 'Email must be a valid email address!' }),
});

export function BetterAuthForgotPasswordView() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const defaultValues: ForgotPasswordSchemaType = {
    email: '',
  };

  const methods = useForm<ForgotPasswordSchemaType>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      setErrorMessage(null);
      setSuccessMessage(null);
      
      const resetUrl = window.location.origin + paths.auth.betterAuth.resetPassword;
      await forgotPassword(data.email, resetUrl);
      
      setSuccessMessage('Password reset link sent! Please check your email.');
    } catch (error) {
      console.error(error);
      const feedbackMessage = getErrorMessage(error);
      setErrorMessage(feedbackMessage);
    }
  });

  const renderForm = () => (
    <Box sx={{ gap: 3, display: 'flex', flexDirection: 'column' }}>
      <Field.Text
        name="email"
        label="Email address"
        placeholder="john.doe@email.com"
        slotProps={{ inputLabel: { shrink: true } }}
      />

      <Button
        fullWidth
        color="inherit"
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
        loadingIndicator="Sending reset link..."
      >
        Send request
      </Button>
    </Box>
  );

  return (
    <>
      <FormHead
        icon={<Iconify icon={"solar:lock-password-bold" as any} width={64} sx={{ color: 'primary.main', mb: 1 }} />}
        title="Forgot your password?"
        description="Please enter the email address associated with your account and we will email you a link to reset your password."
        sx={{ textAlign: 'center' }}
      />

      {!!errorMessage && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMessage}
        </Alert>
      )}

      {!!successMessage && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {successMessage}
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
