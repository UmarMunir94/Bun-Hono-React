import { useQuery } from '@tanstack/react-query';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { DashboardContent } from 'src/layouts/dashboard';
import { getAllWorkExperienceQueryOptions } from 'src/lib/api';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';



// ----------------------------------------------------------------------

export function WorkExperienceListView() {
  const { data: workExperienceData, isLoading } = useQuery(getAllWorkExperienceQueryOptions);

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Work Experience List"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Work Experience', href: paths.dashboard.workExperience.root },
          { name: 'List' },
        ]}
        action={
          <Button
            component={RouterLink}
            href={paths.dashboard.workExperience.new}
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            New Experience
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card sx={{ p: 3 }}>
        {isLoading ? (
          <Typography>Loading...</Typography>
        ) : (
          <Stack spacing={3}>
            {workExperienceData?.workExperience?.map((item: any) => (
              <Card key={item.id} sx={{ p: 3, border: (theme) => `solid 1px ${theme.vars.palette.divider}` }}>
                <Typography variant="h6">{item.position} at {item.company}</Typography>
                <Typography variant="subtitle2" color="text.secondary">
                  {item.location}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                  {item.startDate} to {item.endDate || 'Present'}
                </Typography>
                {item.description && (
                  <Typography variant="body2" sx={{ mt: 1 }}>{item.description}</Typography>
                )}
              </Card>
            ))}
            {(!workExperienceData?.workExperience || workExperienceData.workExperience.length === 0) && (
              <Typography variant="body2" color="text.secondary">No work experience records found.</Typography>
            )}
          </Stack>
        )}
      </Card>
    </DashboardContent>
  );
}
