import { useQuery, useMutation } from '@tanstack/react-query';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Link from '@mui/material/Link';
// import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { DashboardContent } from 'src/layouts/dashboard';
import { joinEvent, leaveEvent, updateEventAttendee, getEventByIdQueryOptions } from 'src/lib/api';

import { toast } from 'src/components/snackbar';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

type Props = {
  id: string;
};

export function EventDetailsView({ id }: Props) {
  const { user } = useAuthContext();

  const { data, isLoading, refetch } = useQuery(getEventByIdQueryOptions(Number(id)));

  const updateStatusMutation = useMutation({
    mutationFn: updateEventAttendee,
    onSuccess: () => {
      toast.success('Attendee status updated!');
      refetch();
    },
    onError: (error) => {
      toast.error('Failed to update status.');
      console.error(error);
    },
  });

  const joinMutation = useMutation({
    mutationFn: joinEvent,
    onSuccess: (response) => {
      if (response.attendee.status === 'approved') {
        toast.success('Successfully joined event!');
      } else {
        toast.success('Join request sent!');
      }
      refetch();
    },
    onError: (error) => {
      toast.error('Failed to join event. You might have already joined or requested.');
      console.error(error);
    },
  });

  const leaveMutation = useMutation({
    mutationFn: leaveEvent,
    onSuccess: () => {
      toast.success('Request cancelled successfully.');
      refetch();
    },
    onError: (error) => {
      toast.error('Failed to cancel request.');
      console.error(error);
    },
  });

  if (isLoading) {
    return (
      <DashboardContent>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      </DashboardContent>
    );
  }

  if (!data?.event) {
    return (
      <DashboardContent>
        <Typography variant="h6">Event not found</Typography>
      </DashboardContent>
    );
  }

  const { event } = data;
  const isCreator = event.userId === user?.id;

  const requestedAttendees = event.attendees.filter((a: any) => a.status === 'requested');
  const approvedAttendees = event.attendees.filter((a: any) => a.status === 'approved');
  
  const organizerAttendee = approvedAttendees.find((a: any) => a.userId === event.userId);
  const activeAttendees = approvedAttendees.filter((a: any) => a.userId !== event.userId);

  const isFull = approvedAttendees.length >= event.slots;

  const hasJoinedOrRequested = event.attendees.some((a: any) => a.userId === user?.id);

  const handleUpdateStatus = (attendeeId: number, status: 'approved' | 'rejected') => {
    updateStatusMutation.mutate({ eventId: event.id, attendeeId, status });
  };

  const handleJoin = () => {
    joinMutation.mutate({ id: event.id });
  };

  const handleLeave = () => {
    leaveMutation.mutate({ id: event.id });
  };

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Event Details"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Events', href: paths.dashboard.events.list },
          { name: event.name },
        ]}
        action={
          isCreator ? (
            <Button
              component={RouterLink}
              href={paths.dashboard.events.edit(event.id.toString())}
              variant="contained"
            >
              Edit Event
            </Button>
          ) : !hasJoinedOrRequested ? (
            <Button variant="contained" onClick={handleJoin}>
              Join Event
            </Button>
          ) : event.attendees.find((a: any) => a.userId === user?.id)?.status === 'approved' ? (
            <Button variant="outlined" disabled>
              Joined
            </Button>
          ) : (
            <Button variant="contained" color="warning" onClick={handleLeave}>
              Cancel Request
            </Button>
          )
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>{event.name}</Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          {event.description || 'No description provided.'}
        </Typography>

        <Stack direction="row" spacing={3} sx={{ mt: 3 }}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">Location</Typography>
            <Typography variant="body1">{event.location}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">Date & Time</Typography>
            <Typography variant="body1">{new Date(event.dateAndTime).toLocaleString()}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">Slots</Typography>
            <Typography variant="body1">{approvedAttendees.length} / {event.slots}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">Type</Typography>
            <Typography variant="body1">
              {event.isPrivate ? 'Private' : 'Public'}
              {!event.isPrivate && event.autoApprove ? ' (Auto-Approve)' : ''}
            </Typography>
          </Box>
        </Stack>
      </Card>

      <Typography variant="h6" sx={{ mb: 2 }}>Attendees</Typography>

      <Card sx={{ p: 3 }}>
        {organizerAttendee && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" gutterBottom color="primary">
              Organizer(s)
            </Typography>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar src={organizerAttendee.user?.image ?? undefined} alt={organizerAttendee.user?.name} />
              <Box sx={{ flexGrow: 1 }}>
                <Link
                  component={RouterLink}
                  href={paths.dashboard.user.public(organizerAttendee.userId)}
                  variant="subtitle2"
                  color="text.primary"
                  underline="hover"
                >
                  {organizerAttendee.user?.name}
                </Link>
                <Typography variant="caption" color="text.secondary" display="block">
                  Host
                </Typography>
              </Box>
            </Stack>
            <Divider sx={{ mt: 3 }} />
          </Box>
        )}

        <Typography variant="subtitle1" gutterBottom color="success.main">
          Active Participants ({activeAttendees.length})
        </Typography>
        {activeAttendees.length === 0 ? (
          <Typography variant="body2" color="text.secondary">No active participants yet.</Typography>
        ) : (
          <Stack spacing={2}>
            {activeAttendees.map((attendee: any) => (
              <Stack key={attendee.id} direction="row" alignItems="center" spacing={2}>
                <Avatar src={attendee.user?.image ?? undefined} alt={attendee.user?.name} />
                <Box sx={{ flexGrow: 1 }}>
                  <Link
                    component={RouterLink}
                    href={paths.dashboard.user.public(attendee.userId)}
                    variant="subtitle2"
                    color="text.primary"
                    underline="hover"
                  >
                    {attendee.user?.name}
                  </Link>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Joined {new Date(attendee.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
                {isCreator && (
                  <Button size="small" variant="outlined" color="error" onClick={() => handleUpdateStatus(attendee.id, 'rejected')}>
                    Remove
                  </Button>
                )}
              </Stack>
            ))}
          </Stack>
        )}

        {requestedAttendees.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Divider sx={{ mb: 3 }} />
            <Typography variant="subtitle1" gutterBottom color="warning.main">
              {event.autoApprove ? `Interested (${requestedAttendees.length})` : `Join Requests (${requestedAttendees.length})`}
            </Typography>
            <Stack spacing={2}>
              {requestedAttendees.map((attendee: any) => (
                <Stack key={attendee.id} direction="row" alignItems="center" spacing={2}>
                  <Avatar src={attendee.user?.image ?? undefined} alt={attendee.user?.name} />
                  <Box sx={{ flexGrow: 1 }}>
                    <Link
                      component={RouterLink}
                      href={paths.dashboard.user.public(attendee.userId)}
                      variant="subtitle2"
                      color="text.primary"
                      underline="hover"
                    >
                      {attendee.user?.name}
                    </Link>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Requested {new Date(attendee.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                  {isCreator && (
                    <>
                      <Button size="small" variant="outlined" color="success" onClick={() => handleUpdateStatus(attendee.id, 'approved')} disabled={isFull}>
                        {isFull ? 'Full' : 'Approve'}
                      </Button>
                      <Button size="small" variant="outlined" color="error" onClick={() => handleUpdateStatus(attendee.id, 'rejected')}>
                        Decline
                      </Button>
                    </>
                  )}
                  {!isCreator && attendee.userId === user?.id && (
                    <Button size="small" variant="outlined" color="warning" onClick={handleLeave}>
                      Cancel
                    </Button>
                  )}
                </Stack>
              ))}
            </Stack>
          </Box>
        )}
      </Card>
    </DashboardContent>
  );
}
