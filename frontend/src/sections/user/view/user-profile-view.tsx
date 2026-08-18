'use client';

import { useSuspenseQuery } from '@tanstack/react-query';

import Card from '@mui/material/Card';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';
import { getGeneralInfoQueryOptions } from 'src/lib/api';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { useUser } from 'src/auth/hooks';

import { ProfileHome } from '../profile-home';
import { ProfileCover } from '../profile-cover';

// ----------------------------------------------------------------------

export function UserProfileView() {
  const { user } = useUser();
  const { data } = useSuspenseQuery(getGeneralInfoQueryOptions);
  
  const generalInfo = data?.generalInfo;

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Profile"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'User', href: paths.dashboard.user.root },
          { name: user?.displayName || 'Profile' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card sx={{ height: 290 }}>
        <ProfileCover
          role={generalInfo?.about || 'User'}
          name={`${generalInfo?.firstName || ''} ${generalInfo?.lastName || ''}`.trim() || user?.displayName || 'User'}
          avatarUrl={generalInfo?.avatarUrl || user?.photoURL}
          coverUrl={null as any}
        />
      </Card>

      <ProfileHome info={generalInfo} sx={{ mt: 3 }} />
    </DashboardContent>
  );
}
