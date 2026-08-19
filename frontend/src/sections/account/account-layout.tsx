import type { DashboardContentProps } from 'src/layouts/dashboard';

import { paths } from 'src/routes/paths';
import { usePathname } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

// ----------------------------------------------------------------------

const NAV_ITEMS = [
  {
    label: 'General',
    icon: <Iconify width={24} icon="solar:user-id-bold" />,
    href: paths.dashboard.user.account,
  },
  {
    label: 'Billing',
    icon: <Iconify width={24} icon="solar:bill-list-bold" />,
    href: `${paths.dashboard.user.account}/billing`,
  },
  {
    label: 'Notifications',
    icon: <Iconify width={24} icon="solar:bell-bing-bold" />,
    href: `${paths.dashboard.user.account}/notifications`,
  },
  {
    label: 'Social links',
    icon: <Iconify width={24} icon="solar:share-bold" />,
    href: `${paths.dashboard.user.account}/socials`,
  },
  {
    label: 'Security',
    icon: <Iconify width={24} icon="ic:round-vpn-key" />,
    href: `${paths.dashboard.user.account}/change-password`,
  },
];

// ----------------------------------------------------------------------

export function AccountLayout({ children, ...other }: DashboardContentProps) {
  const pathname = usePathname();

  return (
    <DashboardContent {...other}>
      <CustomBreadcrumbs
        heading="Account"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'User', href: paths.dashboard.user.root },
          { name: 'Account' },
        ]}
        sx={{ mb: 3 }}
      />

      {children}
    </DashboardContent>
  );
}
