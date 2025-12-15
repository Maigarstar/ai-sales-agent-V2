export const MODE_LIGHT = 'light' as const
export const MODE_DARK = 'dark' as const

export const THEME_ENUM = {
    LIGHT: MODE_LIGHT,
    DARK: MODE_DARK,
    MODE_LIGHT: MODE_LIGHT,
    MODE_DARK: MODE_DARK,
} as const


export type ThemeMode = (typeof THEME_ENUM)[keyof typeof THEME_ENUM]

export const DIR_LTR = 'ltr' as const
export const DIR_RTL = 'rtl' as const

export const DIRECTION_ENUM = {
    LTR: DIR_LTR,
    RTL: DIR_RTL,
} as const

export type Direction = (typeof DIRECTION_ENUM)[keyof typeof DIRECTION_ENUM]

// Layout types used across PostLoginLayout components
export const LAYOUT_BLANK = 'blank' as const
export const LAYOUT_MODERN = 'modern' as const
export const LAYOUT_CLASSIC = 'classic' as const
export const LAYOUT_STACKED_SIDE = 'stackedSide' as const
export const LAYOUT_TOP_BAR_CLASSIC = 'topBarClassic' as const
export const LAYOUT_FRAMED_SIDE = 'framedSide' as const
export const LAYOUT_COLLAPSIBLE_SIDE = 'collapsibleSide' as const
export const LAYOUT_CONTENT_OVERLAY = 'contentOverlay' as const

// Theme package sometimes references frameless, map it to framed so imports compile
export const LAYOUT_FRAMELESS_SIDE = LAYOUT_FRAMED_SIDE
