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

      const _key = humpToTransverse(key.trim())
      const className = _key + "-" + value
      children.push({ className, value: `.${className}{${_key}:${value};}` })
    })
  })

  return {
    get className() {
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
