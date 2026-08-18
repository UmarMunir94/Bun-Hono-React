import type { GridProps } from '@mui/material/Grid';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import CardHeader from '@mui/material/CardHeader';

import { fDate } from 'src/utils/format-time';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = GridProps & {
  info: any;
};

export function ProfileHome({ info, sx, ...other }: Props) {
  const renderAbout = () => (
    <Card>
      <CardHeader title="About" />

      <Box
        sx={{
          p: 3,
          gap: 2,
          display: 'flex',
          typography: 'body2',
          flexDirection: 'column',
        }}
      >
        <div>{info?.about || 'No details provided.'}</div>

        <Box sx={{ gap: 2, display: 'flex', lineHeight: '24px' }}>
          <Iconify width={24} icon="mingcute:location-fill" />
          <span>
            Live at
            <Link variant="subtitle2" color="inherit">
              &nbsp;{info?.city ? `${info.city}, ` : ''}{info?.country || 'Unknown'}
            </Link>
          </span>
        </Box>

        <Box sx={{ gap: 2, display: 'flex', lineHeight: '24px' }}>
          <Iconify width={24} icon="solar:letter-bold" />
          {info?.email || 'N/A'}
        </Box>

        {info?.phone && (
          <Box sx={{ gap: 2, display: 'flex', lineHeight: '24px' }}>
            <Iconify width={24} icon="solar:phone-bold" />
            {info.phone}
          </Box>
        )}

        {info?.createdAt && (
          <Box sx={{ gap: 2, display: 'flex', lineHeight: '24px' }}>
            <Iconify width={24} icon="solar:calendar-date-bold" />
            Joined {fDate(info.createdAt)}
          </Box>
        )}
      </Box>
    </Card>
  );

  const renderSocials = () => (
    <Card>
      <CardHeader title="Social" />

      <Box sx={{ p: 3, gap: 2, display: 'flex', flexDirection: 'column', typography: 'body2' }}>
        {info?.linkedinProfile && (
          <Box
            sx={{
              gap: 2,
              display: 'flex',
              lineHeight: '20px',
              wordBreak: 'break-all',
              alignItems: 'flex-start',
            }}
          >
            <Iconify icon="socials:linkedin" />
            <Link color="inherit" href={info.linkedinProfile} target="_blank" rel="noopener">
              {info.linkedinProfile}
            </Link>
          </Box>
        )}
      </Box>
    </Card>
  );

  return (
    <Grid container spacing={3} sx={sx} {...other}>
      <Grid size={{ xs: 12, md: 4 }} sx={{ gap: 3, display: 'flex', flexDirection: 'column' }}>
        {renderAbout()}
        {info?.linkedinProfile && renderSocials()}
      </Grid>
      <Grid size={{ xs: 12, md: 8 }} sx={{ gap: 3, display: 'flex', flexDirection: 'column' }}>
        <Card sx={{ p: 3 }}>
          <Box sx={{ typography: 'h6', mb: 2 }}>Welcome to your new profile!</Box>
          <Box sx={{ typography: 'body2', color: 'text.secondary' }}>
            This page represents your modern, personalized space. Additional activity logs and interactive features will be displayed here in the future.
          </Box>
        </Card>
      </Grid>
    </Grid>
  );
}
