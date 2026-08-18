import { useState } from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';

import { paths } from 'src/routes/paths';
import { useSearchParams } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { sendVerificationEmail } from 'src/lib/auth-client';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

import { FormHead } from '../../components/form-head';

// ----------------------------------------------------------------------

export function BetterAuthVerifyEmailView() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || 'your email';
  const [isSending, setIsSending] = useState(false);

  const handleResend = async () => {
    setIsSending(true);
    try {
      const { error } = await sendVerificationEmail({ email: searchParams.get('email') as string, callbackURL: window.location.origin + paths.dashboard.root });
      if (error) {
        toast.error(error.message || 'Failed to resend verification email.');
      } else {
        toast.success('Verification email sent!');
      }
    } catch (error) {
      console.error(error);
      toast.error('An unexpected error occurred.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <FormHead
        icon={<Iconify icon="solar:letter-bold" width={64} sx={{ color: 'primary.main', mb: 1 }} />}
        title="Please check your email"
        description={
          <>
            {searchParams.get('existing') === 'true' ? (
              <>
                You are already registered, please look for the verification email we sent to <strong>{email}</strong> earlier.
                <br />
                If you cannot find it, you can request a new one below.
              </>
            ) : (
              <>
                We have sent a confirmation link to <strong>{email}</strong>.
                <br />
                Please click on the link to verify your account.
              </>
            )}
          </>
        }
        sx={{ textAlign: 'center' }}
      />

      <Box sx={{ mt: 1, display: 'flex', gap: 2, flexDirection: 'column', alignItems: 'center' }}>
        <Button
          size="large"
          color="inherit"
          variant="contained"
          onClick={handleResend}
          loading={isSending}
        >
          Resend verification email
        </Button>

        <Link
          component={RouterLink}
          href={paths.auth.betterAuth.signIn}
          color="inherit"
          variant="subtitle2"
          sx={{
            gap: 0.5,
            display: 'flex',
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
