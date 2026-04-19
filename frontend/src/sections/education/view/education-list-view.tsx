import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import DialogContentText from '@mui/material/DialogContentText';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { DashboardContent } from 'src/layouts/dashboard';
import { deleteEducation, getAllEducationQueryOptions } from 'src/lib/api';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

// ----------------------------------------------------------------------

export function EducationListView() {
  const queryClient = useQueryClient();
  const { data: educationData, isLoading } = useQuery(getAllEducationQueryOptions);

  const [confirmId, setConfirmId] = useState<number | null>(null);

  const deleteMutation = useMutation({
    mutationFn: deleteEducation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get-all-education'] });
      toast.success('Education record deleted.');
      setConfirmId(null);
    },
    onError: (error) => {
      console.error(error);
      toast.error('Failed to delete education record.');
      setConfirmId(null);
    },
  });

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Education List"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Education', href: paths.dashboard.education.root },
          { name: 'List' },
        ]}
        action={
          <Button
            component={RouterLink}
            href={paths.dashboard.education.new}
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            New Education
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card sx={{ p: 3 }}>
        {isLoading ? (
          <Typography>Loading...</Typography>
        ) : (
          <Stack spacing={3}>
            {educationData?.education?.map((item) => (
              <Card
                key={item.id}
                sx={{ p: 3, border: (theme) => `solid 1px ${theme.vars.palette.divider}` }}
              >
                {/* Header row: info + actions */}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6">{item.institution}</Typography>
                    <Typography variant="subtitle2" color="text.secondary">
                      {item.degree} • {item.fieldOfStudy}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                      {item.startYear} – {item.endYear ?? 'Present'}
                    </Typography>
                    {item.description && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {item.description}
                      </Typography>
                    )}
                  </Box>

                  <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                    <Tooltip title="Edit">
                      <IconButton
                        component={RouterLink}
                        href={paths.dashboard.education.edit(item.id)}
                        size="small"
                      >
                        <Iconify icon="solar:pen-bold" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => setConfirmId(item.id)}
                      >
                        <Iconify icon="solar:trash-bin-trash-bold" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </Card>
            ))}

            {(!educationData?.education || educationData.education.length === 0) && (
              <Typography variant="body2" color="text.secondary">
                No education records found.
              </Typography>
            )}
          </Stack>
        )}
      </Card>

      {/* Delete confirmation dialog */}
      <Dialog open={confirmId !== null} onClose={() => setConfirmId(null)}>
        <DialogTitle>Delete Education Record</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this education record? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmId(null)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            disabled={deleteMutation.isPending}
            onClick={() => {
              if (confirmId !== null) deleteMutation.mutate({ id: confirmId });
            }}
          >
            {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}
