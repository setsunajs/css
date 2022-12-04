import { humpToTransverse, isPlainObject, isString } from "@setsunajs/shared"
import { InsertOptions, resolveCache } from "./createCssCache"
import { CSSObject } from "./css"

type Children = Array<InsertOptions & { className: string }>
export function acss(...props: CSSObject[]) {
  const children: Children = []
  props.forEach((styles: any) => {
    if (!isPlainObject(styles)) {
      return
    }
    Object.keys(styles).forEach(key => {
      const value: string = styles[key]
      if (!isString(value)) return

      const sKey = humpToTransverse(key.trim()) + "-" + value
      children.push({
        className: sKey,
        sKey,
        key,
        value
      })
    })
  })
  return {
    className: () => children.map(v => v.className),
    toString: () => children,
    insert: () =>
      children.forEach(({ sKey, key, value }) => {
        const cache = resolveCache()
        cache.insert(1, { sKey, key, value })
      })
  }
}
