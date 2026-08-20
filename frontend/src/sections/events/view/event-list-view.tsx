import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Chip from '@mui/material/Chip';
import Link from '@mui/material/Link';
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
    backgroundColor: (theme: any) => theme.vars.palette.pastels?.purple?.light || theme.vars.palette.primary.lighter,
    border: 'none',
  },
  joined: {
    backgroundColor: (theme: any) => theme.vars.palette.pastels?.green?.light || theme.vars.palette.success.lighter,
    border: 'none',
  },
  requested: {
    backgroundColor: (theme: any) => theme.vars.palette.pastels?.yellow?.light || theme.vars.palette.warning.lighter,
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
        <Tab value="joined" label="Joined" />
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

            const now = new Date();
            const start = new Date(event.startTime);
            const end = event.endTime ? new Date(event.endTime) : new Date(event.autoEndTime);
            const cutoff = event.cutoffTime ? new Date(event.cutoffTime) : start;
            const isCompleted = now > end;
            const isOngoing = now >= start && now <= end;
            const canJoinOrLeave = now < cutoff && !isCompleted;

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
                  <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                    {event.name}
                  </Typography>
                  {chip && (
                    <Chip size="small" label={chip.label} color={chip.color} variant="soft" sx={{ flexShrink: 0 }} />
                  )}
                </Box>

                {/* Meta */}
                <Typography variant="caption" color="text.primary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Iconify icon="solar:calendar-date-bold" width={16} /> {isOngoing || isCompleted ? 'Started at:' : 'Starts at:'} {start.toLocaleString()}
                </Typography>
                {(event.endTime || isCompleted) && (
                  <Typography variant="caption" color="text.primary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Iconify icon="solar:calendar-date-bold" width={16} /> {isCompleted ? 'Ended at:' : 'Ends at:'} {end.toLocaleString()}
                  </Typography>
                )}
                {event.cutoffTime && (
                  <Typography variant="caption" color="text.primary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Iconify icon={"solar:clock-circle-bold" as any} width={16} /> Join by: {cutoff.toLocaleString()}
                  </Typography>
                )}
                <Typography variant="caption" color="text.primary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Iconify icon="solar:flag-bold" width={16} /> {event.location}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                  <Link
                    component={RouterLink}
                    href={paths.dashboard.user.public(event.userId)}
                    variant="caption"
                    color="text.secondary"
                    underline="hover"
                  >
                    <Chip size="small" icon={<Iconify icon="solar:user-rounded-bold" width={14} /> } label={event.organizerName || 'Unknown User'} color="primary" variant="soft" sx={{ height: 20 }} />
                  </Link>
                </Box>
                {event.description && (
                  <Typography variant="body2" color="text.primary" sx={{ mt: 0.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {event.description}
                  </Typography>
                )}

                {/* Slots bar */}
                <Box sx={{ mt: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5, alignItems: 'center', gap: 1 }}>
                    <Typography variant="caption" color="text.primary">
                      {event.attendeeCount ?? 0} going
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {event.interestedCount > 0 && (
                        <Typography variant="caption" color="text.primary">
                          {isCompleted ? `${event.interestedCount} total interested` : `${event.interestedCount} interested`}
                        </Typography>
                      )}
                      <Typography variant="caption" color={isFull ? 'error.main' : 'text.primary'} fontWeight="medium">
                        {isFull ? 'Full' : `${slotsLeft} spot${slotsLeft === 1 ? '' : 's'} left`}
                      </Typography>
                    </Box>
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
                  {isCompleted ? (
                    <Chip size="small" variant="soft" color="default" label="Completed" />
                  ) : isOngoing ? (
                    <Chip size="small" variant="soft" color="primary" label="Ongoing" />
                  ) : null}
                  {event.updatedAt && event.createdAt && new Date(event.updatedAt) > new Date(event.createdAt) && (
                    <Chip size="small" variant="outlined" color="default" label="Edited" />
                  )}
                </Box>

                {/* Actions */}
                <Box sx={{ display: 'flex', gap: 1, mt: 'auto', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
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
                      {now < start && (
                        <Button
                          component={RouterLink}
                          href={paths.dashboard.events.edit(event.id.toString())}
                          variant="outlined"
                          // color="primary"
                          size="small"
                        >
                          Edit
                        </Button>
                      )}
                      <Button
                        color="error"
                        variant="soft"
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
                      {event.myStatus === 'none' && (
                        <Button
                          variant="soft"
                          size="small"
                          color="primary"
                          disabled={!canJoinOrLeave}
                          onClick={() => handleJoin(event.id)}
                        >
                          {isFull ? 'Interested' : event.autoApprove ? 'Join' : 'Request to Join'}
                        </Button>
                      )}
                      {event.myStatus === 'requested' && (
                        <Button
                          variant="soft"
                          size="small"
                          color="warning"
                          disabled={!canJoinOrLeave}
                          onClick={() => handleLeave(event.id)}
                        >
                          Cancel Request
                        </Button>
                      )}
                      {/* Removed Full badge because button is now clickable for interest */}
                    </>
                  )}

                  {/* Joined Events actions */}
                  {event.myStatus === 'approved' && event.userId !== user?.id && (
                    <Button
                      variant="soft"
                      size="small"
                      color="error"
                      disabled={!canJoinOrLeave}
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
