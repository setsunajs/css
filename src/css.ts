import * as CSS from "csstype"

export interface CSSProperties
  extends CSS.Properties<string | number>,
    CSS.PropertiesHyphen<string | number> {}

export type CSSObject =
  | CSSProperties
  | {
      [key: string]: CSSObject
    }
