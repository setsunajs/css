import { humpToTransverse, isPlainObject, isString } from "@setsunajs/shared"
import { InsertOptions, resolveCache } from "./createCssCache"
import { CSSProperties } from "./css"

export type PseudoElementTypes =
  | ":active"
  | ":any-link"
  | ":blank"
  | ":checked"
  | ":current"
  | ":default"
  | ":dir"
  | ":disabled"
  | ":empty"
  | ":enabled"
  | ":first"
  | ":first-child"
  | ":first-of-type"
  | ":focus"
  | ":focus-visible"
  | ":focus-within"
  | ":future"
  | ":hover"
  | ":indeterminate"
  | ":in-range"
  | ":invalid"
  | ":lang"
  | ":last-child"
  | ":last-of-type"
  | ":left"
  | ":link"
  | ":local-link"
  | ":not"
  | ":nth-child"
  | ":nth-of-type"
  | ":nth-last-child"
  | ":nth-last-of-type"
  | ":only-child"
  | ":only-of-type"
  | ":optional"
  | ":out-of-range"
  | ":past"
  | ":placeholder-shown"
  | ":playing"
  | ":paused"
  | ":read-only"
  | ":read-write"
  | ":required"
  | ":right"
  | ":root"
  | ":scope"
  | ":valid"
  | ":target"
  | ":visited"
  | "::after"
  | "::before"
  | "::first-letter"
  | "::first-line"
  | "::grammar-error"
  | "::selection"
  | "::spelling-error"

export type ACSSObject = CSSProperties & {
  [K in PseudoElementTypes]?: CSSProperties
}

type Children = Array<InsertOptions & { className: string }>
export function acss(...props: ACSSObject[]) {
  const children: Children = []
  props.forEach((styles: any) => {
    if (!isPlainObject(styles)) {
      return
    }

    Object.keys(styles).forEach(key => {
      const value: string = styles[key]

      if (key.startsWith(":") && isPlainObject(value)) {
        const _symbol = key.match(/:+(.*)/)![1]
        Object.keys(value).forEach(cKey => {
          const cValue = value[cKey]
          if (!isString(cValue)) {
            return
          }

          const _key = humpToTransverse(cKey.trim())
          const className = _key + "-" + value + "-" + _symbol
          children.push({
            className,
            value: `.${className}:${_symbol}{${_key}:${value};}`
          })
        })
        return
      }

      if (!isString(value)) {
        return
      }

      const _key = humpToTransverse(key.trim())
      const className = _key + "-" + value
      children.push({ className, value: `.${className}{${_key}:${value};}` })
    })
  })

  return {
    get classNames() {
      return children.map(child => child.className)
    },
    toStyleString: () => {
      return children.map(child => child.value)
    },
    insert: () => {
      return children.forEach(child => resolveCache().insert(1, child))
    }
  }
}

function parseStyle(
  style: Record<string, string>,
  cb: (key: string, value: string) => any
) {
  Object.keys(style).forEach(key => {
    const value = style[key]
  })
}
