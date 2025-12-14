import type { Theme } from '../@types/theme'
import { MODE_LIGHT } from '../constants/theme.constant'

// Minimal theme config for ECME
export const themeConfig = {
  themeSchema: 'default',
  mode: MODE_LIGHT,
  direction: 'ltr',
  panelExpand: false,
  layout: {
    type: 'modern',
    sideNavCollapse: false,
  },
} as unknown as Theme
