import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Chip from '@mui/material/Chip';
import Tabs from '@mui/material/Tabs';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { DashboardContent } from 'src/layouts/dashboard';
import { joinEvent, leaveEvent, deleteEvent, getAllEventsQueryOptions } from 'src/lib/api';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

type EventCardHighlight = 'mine' | 'joined' | 'requested' | 'none';

function getHighlight(event: any, userId: string | undefined): EventCardHighlight {
  if (event.userId === userId) return 'mine';
  if (event.myStatus === 'approved') return 'joined';
  if (event.myStatus === 'requested') return 'requested';
  return 'none';
}

const highlightStyles: Record<EventCardHighlight, object> = {
  mine: {
    backgroundColor: (theme: any) => theme.vars.palette.pastels?.purple?.main || theme.vars.palette.primary.main,
    border: 'none',
  },
  joined: {
    backgroundColor: (theme: any) => theme.vars.palette.pastels?.green?.main || theme.vars.palette.success.main,
    border: 'none',
  },
  requested: {
    backgroundColor: (theme: any) => theme.vars.palette.pastels?.yellow?.main || theme.vars.palette.warning.main,
    border: 'none',
  },
  none: {
    border: '1px solid',
    borderColor: 'divider',
    backgroundColor: 'background.paper',
  },
};

const highlightChip: Record<EventCardHighlight, { label: string; color: 'primary' | 'success' | 'warning' } | null> = {
  mine: { label: 'Managed', color: 'primary' },
  joined: { label: 'Joined', color: 'success' },
  requested: { label: 'Requested', color: 'warning' },
  none: null,
};

export function EventListView() {
  const [currentTab, setCurrentTab] = useState<'all' | 'managed' | 'joined'>('all');
  const { user } = useAuthContext();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(getAllEventsQueryOptions(currentTab));

  const deleteMutation = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      toast.success('Event deleted');
      queryClient.invalidateQueries({ queryKey: ['get-all-events'] });
    },
    onError: (error) => {
      toast.error('Failed to delete event');
      console.error(error);
    },
  });

  const joinMutation = useMutation({
    mutationFn: joinEvent,
    onSuccess: (response) => {
      if (response.attendee.status === 'approved') {
        toast.success('Successfully joined event!');
      } else {
        toast.success('Join request sent! Waiting for approval.');
      }
      queryClient.invalidateQueries({ queryKey: ['get-all-events'] });
    },
    onError: (error) => {
      toast.error('Failed to join event. You might have already joined or requested.');
      console.error(error);
    },
  });

  const leaveMutation = useMutation({
    mutationFn: leaveEvent,
    onSuccess: () => {
      toast.success('You have left the event.');
      queryClient.invalidateQueries({ queryKey: ['get-all-events'] });
    },
    onError: (error) => {
      toast.error('Failed to leave event.');
      console.error(error);
    },
  });

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      deleteMutation.mutate({ id });
    }
  };

  const handleJoin = (id: number) => {
    joinMutation.mutate({ id });
  };

  const handleLeave = (id: number) => {
    leaveMutation.mutate({ id });
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: 'all' | 'managed' | 'joined') => {
    setCurrentTab(newValue);
  };

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Events"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Events' },
        ]}
        action={
          <Button
            component={RouterLink}
            href={paths.dashboard.events.new}
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            New Event
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {currentTab === 'all' && (
        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <Chip size="small" label="Managed" color="primary" variant="soft" />
          <Chip size="small" label="Joined" color="success" variant="soft" />
          <Chip size="small" label="Pending Approval" color="warning" variant="soft" />
        </Box>
      )}

      <Tabs
        value={currentTab}
        onChange={handleTabChange}
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab value="all" label="All Events" />
        <Tab value="managed" label="Managed" />
        <Tab value="joined" label="Joined Events" />
      </Tabs>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
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
          {data?.events.map((event: any) => {
            const highlight = getHighlight(event, user?.id);
            const chip = highlightChip[highlight];
            const slotsLeft = event.slotsLeft ?? (event.slots - (event.attendeeCount ?? 0));
            const isFull = slotsLeft <= 0;
            const fillPct = Math.min(100, ((event.attendeeCount ?? 0) / event.slots) * 100);

            return (
              <Box
                key={event.id}
                sx={{
                  p: 3,
                  borderRadius: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                  transition: 'box-shadow 0.2s',
                  '&:hover': { boxShadow: 4 },
                  ...highlightStyles[highlight],
                }}
              >
                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ flexGrow: 1 }}>
                    {event.name}
                  </Typography>
                  {chip && (
                    <Chip size="small" label={chip.label} color={chip.color} variant="soft" sx={{ flexShrink: 0 }} />
                  )}
                </Box>

                {/* Meta */}
                <Typography variant="caption" color="text.primary">
                  📅 {new Date(event.dateAndTime).toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.primary">
                  📍 {event.location}
                </Typography>
                {event.description && (
                  <Typography variant="body2" color="text.primary" sx={{ mt: 0.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {event.description}
                  </Typography>
                )}

                {/* Slots bar */}
                <Box sx={{ mt: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" color="text.primary">
                      {event.attendeeCount ?? 0} going
                    </Typography>
                    <Typography variant="caption" color={isFull ? 'error.main' : 'text.primary'}>
                      {isFull ? 'Full' : `${slotsLeft} spot${slotsLeft === 1 ? '' : 's'} left`}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={fillPct}
                    color={isFull ? 'error' : fillPct > 75 ? 'warning' : 'success'}
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </Box>

                {/* Badge row */}
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                  <Chip
                    size="small"
                    variant="soft"
                    color={event.isPrivate ? 'default' : 'info'}
                    label={event.isPrivate ? 'Private' : 'Public'}
                  />
                  {!event.isPrivate && event.autoApprove && (
                    <Chip size="small" variant="soft" color="success" label="Auto-approve" />
                  )}
                </Box>

                {/* Actions */}
                <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                  <Button
                    component={RouterLink}
                    href={paths.dashboard.events.details(event.id.toString())}
                    variant="outlined"
                    size="small"
                  >
                    View
                  </Button>

                  {/* Managed Events tab actions */}
                  {currentTab === 'managed' && (
                    <>
                      <Button
                        component={RouterLink}
                        href={paths.dashboard.events.edit(event.id.toString())}
                        variant="outlined"
                        color="secondary"
                        size="small"
                      >
                        Edit
                      </Button>
                      <Button
                        color="error"
                        variant="outlined"
                        size="small"
                        onClick={() => handleDelete(event.id)}
                      >
                        Delete
                      </Button>
                    </>
                  )}

                  {/* All Events tab actions */}
                  {currentTab === 'all' && event.userId !== user?.id && (
                    <>
                      {event.myStatus === 'none' && !isFull && (
                        <Button
                          variant="contained"
                          size="small"
                          color="primary"
                          onClick={() => handleJoin(event.id)}
                        >
                          {event.autoApprove ? 'Join' : 'Request to Join'}
                        </Button>
                      )}
                      {event.myStatus === 'requested' && (
                        <Button
                          variant="soft"
                          size="small"
                          color="warning"
                          onClick={() => handleLeave(event.id)}
                        >
                          Cancel Request
                        </Button>
                      )}
                      {isFull && event.myStatus === 'none' && (
                        <Chip size="small" label="Full" color="error" variant="soft" />
                      )}
                    </>
                  )}

                  {/* Joined Events tab actions */}
                  {currentTab === 'joined' && (
                    <Button
                      variant="contained"
                      size="small"
                      color="error"
                      onClick={() => handleLeave(event.id)}
                    >
                      Leave Event
                    </Button>
                  )}
                </Box>
              </Box>
            );
          })}

          {data?.events.length === 0 && (
            <Box sx={{ gridColumn: '1 / -1', textAlign: 'center', p: 5 }}>
              <Typography variant="body1" color="text.secondary">
                No events found.
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </DashboardContent>
  );
}
