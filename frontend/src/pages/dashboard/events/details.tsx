import { Helmet } from 'react-helmet-async';

import { useParams } from 'src/routes/hooks';

import { CONFIG } from 'src/global-config';

import { EventDetailsView } from 'src/sections/events/view/event-details-view';

export default function Page() {
  const { id = '' } = useParams();

  return (
    <>
      <Helmet>
        <title> {`Event Details - ${CONFIG.appName}`}</title>
      </Helmet>

      <EventDetailsView id={id} />
    </>
  );
}
