import { isPlainObject } from "@setsunajs/shared"

let cache: CSSCache | null = null
let prefix = "css-"
let version = "1"

export type CSSCache = {
  id: string
  insert: (type: number, params: InsertOptions) => any
}

export type AtomMap = Map<
  string,
  {
    key: string
    value: string
  }
>

export type StyleMap = Map<
  string,
  {
    el: HTMLElement
  }
>

export type InsertOptions = {
  sKey?: string
  key?: string
  value?: string
}

export function createCache(): CSSCache {
  if (cache) {
    return cache
  }

  const id = `${prefix}setsuna-${version}`
  const atomStyle = createStyle(id, "")

  const atomMap: AtomMap = new Map()
  const styleMap: StyleMap = new Map()

  let pending = true
  const pendingMap = new Set<InsertOptions & { type: number }>()
  const insert = (type: number, options: InsertOptions) => {
    pendingMap.add({ ...options, type })

    if (!pending) {
      return
    }

    pending = false
    Promise.resolve().then(() => {
      let atomStyleContent = atomStyle.textContent
      const atomStyleSize = atomStyleContent!.length
      pendingMap.forEach(({ type, sKey, key, value }) => {
        if (type === 1) {
          if (atomMap.has(sKey!)) return

          atomStyleContent += `.${sKey}{${key!}:${value};}`
          atomMap.set(sKey!, { key: key!, value: value! })
          return
        }

        if (type === 2) {
          const style = styleMap.get(sKey!)
          if (style) {
            style.el.textContent = value!
          } else {
            const el = createStyle(id, value!)
            styleMap.set(sKey!, { el })
          }
          return
        }
      })

      if (atomStyleSize !== atomStyleContent!.length) {
        atomStyle.textContent = atomStyleContent
      }

      pendingMap.clear()
      pending = true
    })
  }

  return { id, insert }
}

function createStyle(id: string, content: string) {
  const style = document.createElement("style")
  style.id = id
  style.type = "text/css"
  style.textContent = content
  document.head.appendChild(style)
  return style
}

export function resolveCache() {
  return cache!
}

