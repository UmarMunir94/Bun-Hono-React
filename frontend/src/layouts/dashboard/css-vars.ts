import type { Theme, CSSObject } from '@mui/material/styles';
import type { SettingsState } from 'src/components/settings';

import { varAlpha } from 'minimal-shared/utils';

import { bulletColor } from 'src/components/nav-section';

// ----------------------------------------------------------------------

export function dashboardLayoutVars(theme: Theme) {
  return {
    '--layout-transition-easing': 'linear',
    '--layout-transition-duration': '120ms',
    '--layout-nav-mini-width': '88px',
    '--layout-nav-vertical-width': '300px',
    '--layout-nav-horizontal-height': '64px',
    '--layout-dashboard-content-pt': theme.spacing(1),
    '--layout-dashboard-content-pb': theme.spacing(8),
    '--layout-dashboard-content-px': theme.spacing(5),
  };
}

// ----------------------------------------------------------------------

export function dashboardNavColorVars(
  theme: Theme,
  navColor: SettingsState['navColor'] = 'integrate',
  navLayout: SettingsState['navLayout'] = 'vertical'
): Record<'layout' | 'section', CSSObject | undefined> {
  const {
    vars: { palette },
  } = theme;

  switch (navColor) {
    case 'integrate':
      return {
        layout: {
          // '--layout-nav-bg': palette.background.paper, // neutral, paper, default, nav
          '--layout-nav-bg': palette.background.nav,
          '--layout-nav-horizontal-bg': varAlpha(palette.background.defaultChannel, 0.8),
          '--layout-nav-border-color': varAlpha(palette.grey['500Channel'], 0.12),
          '--layout-nav-text-primary-color': palette.text.primary,
          '--layout-nav-text-secondary-color': palette.text.secondary,
          // '--layout-nav-text-disabled-color': palette.text.disabled,
          // '--layout-nav-text-disabled-color': palette.grey[300],
          // bullet
          // '--nav-bullet-light-color': bulletColor.light,
          // '--nav-bullet-dark-color': bulletColor.light,
          ...theme.applyStyles('dark', {
            '--layout-nav-border-color': varAlpha(palette.grey['500Channel'], 0.08),
            '--layout-nav-horizontal-bg': varAlpha(palette.background.defaultChannel, 0.96),
            // '--layout-nav-text-disabled-color': palette.grey[600],
          }),
        },
        section: {
          // bullet
          '--nav-bullet-light-color': palette.grey[300],
          '--nav-bullet-dark-color': palette.grey[700],
        },
      };
    case 'apparent':
      return {
        layout: {
          '--layout-nav-bg': palette.grey[800],
          // '--layout-nav-horizontal-bg': varAlpha(palette.grey['900Channel'], 0.96),
          // '--layout-nav-border-color': 'transparent',
          
          '--layout-nav-horizontal-bg': varAlpha(palette.background.defaultChannel, 0.8),
          '--layout-nav-border-color': varAlpha(palette.grey['500Channel'], 0.12),
          // '--layout-nav-text-primary-color': palette.text.primary,
          // '--layout-nav-text-secondary-color': palette.text.secondary,
          '--layout-nav-text-primary-color': palette.common.white,
          '--layout-nav-text-secondary-color': palette.grey[500],
          '--layout-nav-text-disabled-color': palette.grey[300],
          // bullet
          '--nav-bullet-light-color': bulletColor.light,
          ...theme.applyStyles('dark', {
            '--layout-nav-border-color': varAlpha(palette.grey['500Channel'], 0.08),
            '--layout-nav-horizontal-bg': varAlpha(palette.background.defaultChannel, 0.96),
            
            '--layout-nav-bg': palette.grey[200],
            '--layout-nav-text-primary-color': palette.common.black,
            '--layout-nav-text-secondary-color': palette.grey[800],
            '--layout-nav-text-disabled-color': palette.grey[700],
          }),
        },
        section: {
          // caption
          '--nav-item-caption-color': palette.grey[400],
          // subheader
          '--nav-subheader-hover-color': palette.common.white,
          '--nav-subheader-color': palette.grey[500],
          // item
          '--nav-item-color': palette.grey[400],
          '--nav-item-root-active-color': palette.primary.main,
          '--nav-item-root-open-color': palette.common.white,
          // bullet
          '--nav-bullet-light-color': bulletColor.dark,
          '--nav-bullet-dark-color': bulletColor.light,
          // sub
          '--nav-item-sub-active-color': palette.common.white,
          '--nav-item-sub-open-color': palette.common.white,
          ...theme.applyStyles('dark', {
            '--nav-item-sub-active-color': palette.common.black,
            '--nav-item-sub-open-color': palette.common.black,
            '--nav-subheader-hover-color': palette.common.black,
            // item
            '--nav-item-color': palette.grey[600],
            '--nav-item-root-active-color-on-dark': palette.primary.main,
            '--nav-item-root-open-color': palette.common.black,
          }),
        },
      };
    default:
      throw new Error(`Invalid color: ${navColor}`);
  }
}
