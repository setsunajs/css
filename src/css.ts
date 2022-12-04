import * as CSS from "csstype"
import { SCSSObject } from "./scss"

export interface CSSProperties
  extends CSS.Properties<string | number>,
    CSS.PropertiesHyphen<string | number> {
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