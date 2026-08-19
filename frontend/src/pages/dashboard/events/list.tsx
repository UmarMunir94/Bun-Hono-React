import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/global-config';

import { EventListView } from 'src/sections/events/view/event-list-view';

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`Events - ${CONFIG.appName}`}</title>
      </Helmet>

      <EventListView />
    </>
  );
}
