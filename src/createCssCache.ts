import { query } from "@setsunajs/shared"

let prefix = "css-"
let version = "1"
let cache: CSSCache | null = (() => {
  const atomStyle = query(`#${prefix}setsuna-${version}`)
  return atomStyle ? (atomStyle as any).cache : null
})()

export type CSSCache = {
  id: string
  insert: (type: number, options: InsertOptions) => any
  remove: (type: number, options: RemoveOptions) => any
}

export type AtomMap = Map<
  string,
  {
    value: string
  }
>

export type StyleMap = Map<
  string,
  {
    el: HTMLElement
    ref: number
  }
>

export type InsertOptions = {
  className: string
  value: string
}

export type RemoveOptions = {
  className: string
}

export type CreateCacheOptions = {
  prefix?: string
}

export function createCache(): CSSCache {
  if (cache) {
    return cache
  }

  const id = `${prefix}setsuna-${version}`
  const atomStyle = createStyle("")

  const atomMap: AtomMap = new Map()
  const styleMap: StyleMap = new Map()

  let insertPending = true
  let insertPendingList: Array<InsertOptions & { type: number }> = []
  const insert = (type: number, options: InsertOptions) => {
    insertPendingList.push({ ...options, type })

    if (!insertPending) return

    insertPending = false
    Promise.resolve().then(() => {
      let atomStyleContent = atomStyle.textContent
      const atomStyleSize = atomStyleContent!.length

      insertPendingList.forEach(({ type, className, value }) => {
        if (type === 1) {
          if (atomMap.has(className)) return

          atomStyleContent += value
          atomMap.set(className, { value })
          return
        }

        if (type === 2) {
          const style = styleMap.get(className)
          style
            ? (style.ref += 1)
            : styleMap.set(className, { el: createStyle(value), ref: 1 })
          return
        }
      })

      if (atomStyleSize !== atomStyleContent!.length) {
        atomStyle.textContent = atomStyleContent
      }

      insertPending = true
      insertPendingList = []
    })
  }

  let removePending = false
  let removePendingList: Array<RemoveOptions & { type: number }> = []
  const remove = (type: number, options: RemoveOptions) => {
    removePendingList.push({ type, ...options })

    if (removePending) return

    removePending = true
    Promise.resolve().then(() => {
      removePendingList.forEach(({ type, className }) => {
        if (type === 2) {
          const style = styleMap.get(className)
          if (!style) return

          style.ref -= 1
          if (style.ref === 0) {
            document.head.removeChild(style.el)
            styleMap.delete(className)
          }
          return
        }
      })

      removePending = false
      removePendingList = []
    })
  }

  return (cache = (atomStyle as any).cache = { id, insert, remove })
}

function createStyle(content: string) {
  const style = document.createElement("style")
  style.type = "text/css"
  style.textContent = content
  style.setAttribute(`${prefix}setsuna-${version}`, "")
  document.head.appendChild(style)
  return style
}

export function resolveCache() {
  if (!cache) createCache()
  return cache!
}

export function resolvePrefix() {
  return prefix
}
