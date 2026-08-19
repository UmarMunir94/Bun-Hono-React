import type {
  TypeAction,
  PaletteColor,
  ColorSystemOptions,
  PaletteColorChannel,
} from '@mui/material/styles';
import type { SchemesRecord } from '../types';

import { varAlpha, createPaletteChannel } from 'minimal-shared/utils';

import { opacity } from './opacity';
import { themeConfig } from '../theme-config';

// ----------------------------------------------------------------------

/**
 * TypeScript extension for MUI theme augmentation.
 * @to {@link file://./../extend-theme-types.d.ts}
 */

// Keys for core palette colors
export type PaletteColorKey = 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error';
export type CommonColorsKeys = 'black' | 'white';

// Palette color without channels
export type PaletteColorNoChannels = Omit<PaletteColor, 'lighterChannel' | 'darkerChannel'>;

// Palette color with channels
export type PaletteColorWithChannels = PaletteColor & PaletteColorChannel;

// Extended palette color shades
export type PaletteColorExtend = {
  lighter: string;
  darker: string;
  lighterChannel: string;
  darkerChannel: string;
};

// Extended common colors
export type CommonColorsExtend = {
  whiteChannel: string;
  blackChannel: string;
};

// Extended text colors
export type TypeTextExtend = {
  disabledChannel: string;
};

// Extended background colors
export type TypeBackgroundExtend = {
  neutral: string;
  neutralChannel: string;
  nav: string;
  navChannel: string;
};

// Extended grey colors
export type GreyExtend = {
  '50Channel': string;
  '100Channel': string;
  '200Channel': string;
  '300Channel': string;
  '400Channel': string;
  '500Channel': string;
  '600Channel': string;
  '700Channel': string;
  '800Channel': string;
  '900Channel': string;
};

// Extended palette
export type PaletteExtend = {
  pastels: {
    purple: PaletteColorWithChannels;
    yellow: PaletteColorWithChannels;
    red: PaletteColorWithChannels;
    green: PaletteColorWithChannels;
    dark: PaletteColorWithChannels;
  };
  shared: {
    inputOutlined: string;
    inputUnderline: string;
    paperOutlined: string;
    buttonOutlined: string;
  };
};

/**
 * ➤
 * ➤ ➤ Core palette (primary, secondary, info, success, warning, error, common, grey)
 * ➤
 */
export const primary = createPaletteChannel(themeConfig.palette.primary);
export const secondary = createPaletteChannel(themeConfig.palette.secondary);
export const info = createPaletteChannel(themeConfig.palette.info);
export const success = createPaletteChannel(themeConfig.palette.success);
export const warning = createPaletteChannel(themeConfig.palette.warning);
export const error = createPaletteChannel(themeConfig.palette.error);
export const common = createPaletteChannel(themeConfig.palette.common);
export const grey = createPaletteChannel(themeConfig.palette.grey);

/**
 * ➤
 * ➤ ➤ Text, background, action
 * ➤
 */
export const text = {
  light: createPaletteChannel({ primary: grey[800], secondary: grey[600], disabled: grey[500] }),
  dark: createPaletteChannel({ primary: grey[300], secondary: grey[500], disabled: grey[600] }),
};

export const background = {
  light: createPaletteChannel({
    paper: '#FAFAFA',
    default: '#F1F1F1',
    neutral: grey[200],
    nav: grey[200],
  }),
  dark: createPaletteChannel({
    paper: '#303d43',
    default: '#273238',
    neutral: '#28323D',
    nav: '#303d43',
  }),
};

export const action = (mode: 'light' | 'dark'): Partial<TypeAction> => ({
  active: mode === 'light' ? grey[600] : grey[500],
  hover: varAlpha(grey['500Channel'], 0.08),
  selected: varAlpha(grey['500Channel'], 0.16),
  focus: varAlpha(grey['500Channel'], 0.24),
  disabled: varAlpha(grey['500Channel'], 0.8),
  disabledBackground: varAlpha(grey['500Channel'], 0.24),
  hoverOpacity: 0.08,
  selectedOpacity: 0.08,
  focusOpacity: 0.12,
  activatedOpacity: 0.12,
  disabledOpacity: 0.48,
});

/**
 * ➤
 * ➤ ➤ Extended palette
 * ➤
 */
const pastelsBase = {
  purple: {
    lighter: '#F3EFFF',
    light: '#d4ccff',
    // light: '#B5A8FF',
    main: '#B5A8FF',
    dark: '#9B8EF1',
    darker: '#2E244C',
    contrastText: '#FFFFFF',
  },
  yellow: {
    lighter: '#FFF8E1',
    light: '#ffe591',
    // light: '#FFDE70',
    main: '#FFDE70',
    dark: '#E8C550',
    darker: '#423719',
    contrastText: '#1C252E',
  },
  red: {
    lighter: '#FFE5EC',
    light: '#ffbacd',
    // light: '#FF99A8',
    main: '#FF99A8',
    dark: '#EE8092',
    darker: '#4C242C',
    contrastText: '#FFFFFF',
  },
  green: {
    lighter: '#E8F5E9',
    light: '#a0f3b3',
    // light: '#8CE09F',
    main: '#8CE09F',
    dark: '#74D28A',
    darker: '#1B3B26',
    contrastText: '#1C252E',
  },
  dark: {
    lighter: '#F0F0F0',
    light: '#D9D9D9',
    main: '#1E1E1E',
    dark: '#141414',
    darker: '#0A0A0A',
    contrastText: '#FFFFFF',
  },
};

export const pastels = {
  light: {
    purple: createPaletteChannel(pastelsBase.purple),
    yellow: createPaletteChannel(pastelsBase.yellow),
    red: createPaletteChannel(pastelsBase.red),
    green: createPaletteChannel(pastelsBase.green),
    dark: createPaletteChannel(pastelsBase.dark),
  },
  dark: {
    purple: createPaletteChannel({
      lighter: pastelsBase.purple.main,
      light: pastelsBase.purple.darker,
      main: pastelsBase.purple.darker,
      dark: pastelsBase.purple.darker,
      darker: pastelsBase.purple.darker,
      contrastText: pastelsBase.purple.contrastText,
    }),
    yellow: createPaletteChannel({
      lighter: pastelsBase.yellow.main,
      light: pastelsBase.yellow.darker,
      main: pastelsBase.yellow.darker,
      dark: pastelsBase.yellow.darker,
      darker: pastelsBase.yellow.darker,
      contrastText: pastelsBase.yellow.contrastText,
    }),
    red: createPaletteChannel({
      lighter: pastelsBase.red.main,
      light: pastelsBase.red.darker,
      main: pastelsBase.red.darker,
      dark: pastelsBase.red.darker,
      darker: pastelsBase.red.darker,
      contrastText: pastelsBase.red.contrastText,
    }),
    green: createPaletteChannel({
      lighter: pastelsBase.green.main,
      light: pastelsBase.green.darker,
      main: pastelsBase.green.darker,
      dark: pastelsBase.green.darker,
      darker: pastelsBase.green.darker,
      contrastText: pastelsBase.green.contrastText,
    }),
    dark: createPaletteChannel({
      lighter: pastelsBase.dark.main,
      light: pastelsBase.dark.dark,
      main: pastelsBase.dark.darker,
      dark: pastelsBase.dark.darker,
      darker: pastelsBase.dark.darker,
      contrastText: pastelsBase.dark.contrastText,
    }),
  },
};

export const extendPalette: PaletteExtend = {
  pastels: pastels.light,
  shared: {
    inputUnderline: varAlpha(grey['500Channel'], opacity.inputUnderline),
    inputOutlined: varAlpha(grey['500Channel'], 0.2),
    paperOutlined: varAlpha(grey['500Channel'], 0.16),
    buttonOutlined: varAlpha(grey['500Channel'], 0.32),
  },
};

/**
 * ➤
 * ➤ ➤ Base configuration
 * ➤
 */
const basePalette: ColorSystemOptions['palette'] = {
  primary,
  secondary,
  info,
  success,
  warning,
  error,
  common,
  grey,
  divider: varAlpha(grey['500Channel'], 0.2),
  TableCell: { border: varAlpha(grey['500Channel'], 0.2) },
  ...extendPalette,
};

/* **********************************************************************
 * 📦 Final
 * **********************************************************************/
export const palette: SchemesRecord<ColorSystemOptions['palette']> = {
  light: {
    ...basePalette,
    text: text.light,
    background: background.light,
    action: action('light'),
    pastels: pastels.light,
  },
  dark: {
    ...basePalette,
    text: text.dark,
    background: background.dark,
    action: action('dark'),
    pastels: pastels.dark,
  },
};

export const colorKeys: {
  palette: PaletteColorKey[];
  common: CommonColorsKeys[];
} = {
  palette: ['primary', 'secondary', 'info', 'success', 'warning', 'error'],
  common: ['black', 'white'],
};
