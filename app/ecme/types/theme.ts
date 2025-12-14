export type Mode = 'light' | 'dark'
export type Direction = 'ltr' | 'rtl'

export type LayoutType =
  | 'modern'
  | 'classic'
  | 'stackedSide'
  | 'simple'
  | 'blank'
  | string

export type ThemeSchema = string

export interface ThemeLayout {
  type: LayoutType
  sideNavCollapse: boolean
}

export interface Theme {
  mode: Mode
  themeSchema: ThemeSchema
  direction: Direction
  panelExpand: boolean
  layout: ThemeLayout
}
