import { humpToTransverse, isPlainObject, isString } from "@setsunajs/shared"
import { resolveCache, resolvePrefix } from "./createCssCache"
import { CSSObject } from "./css"
import hash from "@emotion/hash"
import { COMMENT, compile, DECLARATION, RULESET } from "stylis"

export type SCSSObject = {
  __setsuna_css_: true
  className: string
  classNames: string[]
  toSelfString: () => string
  toStyleString: () => string[]
  insert: () => void
}

export function scss(...props: Array<CSSObject | SCSSObject>): SCSSObject {
  let styleStr = ""
  props.forEach(style => (styleStr += flatStyle(style)))

  const className =
    resolvePrefix() + hash(styleStr || performance.now().toString())
  const children: string[] = serialize(
    compile(`.${className}{${styleStr}}`),
    stringify
  )

  return {
    __setsuna_css_: true,
    get className() {
      return className
    },
    get classNames() {
      return children.map(className => {
        return className.slice(1, className.indexOf("{"))
      })
    },
    toSelfString: () => styleStr,
    toStyleString: () => children,
    insert: () => {
      const cache = resolveCache()
      children.forEach(value => {
        cache.insert(2, {
          className: value.slice(1, value.indexOf("{")),
          value
        })
      })
    }
  }
}

function flatStyle(style: CSSObject | SCSSObject) {
  if (!isPlainObject(style)) return [""]

  if ("__setsuna_css_" in style) {
    return (style as SCSSObject).toSelfString()
  }

  let styleStr = ""
  Object.keys(style).forEach(_key => {
    const key = humpToTransverse(_key.trim())
    const value = (style as any)[_key]
    if (!key.startsWith("@") && isString(value)) {
      styleStr += `${key}:${value};`
    } else if (isPlainObject(value)) {
      styleStr += `${key.startsWith(".") ? key : "." + key}{${flatStyle(
        value
      )}}`
    }
  })

  return styleStr
}

function serialize(children: any, callback: any) {
  var output = []

  for (var i = 0; i < children.length; i++) {
    const res = callback(children[i], i, children, callback)
    if (res) output.push(res.startsWith("..") ? res.slice(1) : res)
  }
  return output
}

function stringify(element: any, index: any, children: any, callback: any) {
  if (element.type === COMMENT) {
    return ""
  } else if (element.type === DECLARATION) {
    return (element.return = element.return || element.value)
  } else if (element.type === RULESET) {
    element.value = element.props.join(",")
  }
  return (children = serialize(element.children, callback)).length
    ? (element.return = element.value + "{" + children.join("") + "}")
    : ""
}
