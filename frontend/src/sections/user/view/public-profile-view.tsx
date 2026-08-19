import { useQuery } from '@tanstack/react-query';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';
import { getPublicProfileQueryOptions } from 'src/lib/api';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

// ----------------------------------------------------------------------

type Props = {
  id: string;
};

export function PublicProfileView({ id }: Props) {
  const { data, isLoading } = useQuery(getPublicProfileQueryOptions(id));

  if (isLoading) {
    return (
      <DashboardContent>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      </DashboardContent>
    );
  }

  if (!data?.profile) {
    return (
      <DashboardContent>
        <Typography variant="h6">Profile not found</Typography>
      </DashboardContent>
    );
  }

  const { profile } = data;

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Public Profile"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Users', href: paths.dashboard.user.list },
          { name: profile.name },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card sx={{ p: 5, mb: 3, display: 'flex', alignItems: 'center', gap: 3 }}>
        <Avatar src={profile.image ?? undefined} alt={profile.name} sx={{ width: 100, height: 100 }} />
        <Box>
          <Typography variant="h4">{profile.name}</Typography>
          {profile.generalInfo?.about && (
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              {profile.generalInfo.about}
            </Typography>
          )}
          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            {profile.generalInfo?.city && (
              <Typography variant="body2" color="text.secondary">
                📍 {profile.generalInfo.city}{profile.generalInfo.country ? `, ${profile.generalInfo.country}` : ''}
              </Typography>
            )}
            {profile.generalInfo?.linkedinProfile && (
              <Typography
                component="a"
                href={profile.generalInfo.linkedinProfile}
                target="_blank"
                rel="noopener noreferrer"
                variant="body2"
                color="primary"
              >
                🔗 LinkedIn
              </Typography>
            )}
          </Stack>
        </Box>
      </Card>

      <Typography variant="h6" sx={{ mb: 3 }}>Events & Activities</Typography>

      <Box
        sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: {
            xs: 'repeat(1, 1fr)',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
          },
        }}
      >
        {profile.joinedEvents.map((event: any) => (
          <Box
            key={event.id}
            sx={{
              p: 3,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
            }}
          >
            <Typography variant="subtitle1" fontWeight="bold">{event.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {new Date(event.dateAndTime).toLocaleString()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Location:</strong> {event.location}
            </Typography>
            {event.description && (
              <Typography variant="body2" color="text.secondary" noWrap>
                {event.description}
              </Typography>
            )}
          </Box>
        ))}
        {profile.joinedEvents.length === 0 && (
          <Box sx={{ gridColumn: '1 / -1', p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No activities yet.
            </Typography>
          </Box>
        )}
      </Box>
    </DashboardContent>
  );
}
