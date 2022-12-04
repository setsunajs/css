import * as CSS from "csstype"

export interface CSSProperties
  extends CSS.Properties<string | number>,
    CSS.PropertiesHyphen<string | number> {
  [v: `--${string}`]: string | number | undefined
}
export type CSSObject = CSSProperties | {
  [key: string]: CSSObject
}


const style: CSSObject = {
  color: "red",
  ".title": {
    color: "red",
    ".a": {
      color: "red"
    }
  }
}