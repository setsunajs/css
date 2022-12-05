import { humpToTransverse, isPlainObject, isString } from "@setsunajs/shared"
import { InsertOptions, resolveCache, resolvePrefix } from "./createCssCache"
import { CSSObject } from "./css"
import hash from "@emotion/hash"
import { COMMENT, compile, DECLARATION, RULESET } from "stylis"

export type SCSSObject = {
  __setsuna_css_: true
  toString: () => string[]
  toStyleString: () => string[]
  toSelfString: () => string
  insert: () => void
}

export function scss(...props: Array<CSSObject | SCSSObject>): SCSSObject {
  let styleStr = ""
  let selfStr = ""

  props.forEach(style => {
    const [_styleStr, _selfStr] = flatStyle(style)
    styleStr += _styleStr
    selfStr += _selfStr
  })

  const prefix = resolvePrefix()
  const className = prefix + hash(selfStr)
  const children: string[] = serialize(
    compile((styleStr = `${className}{${styleStr}}`)),
    stringify
  ).map(css => "." + css)
  return {
    __setsuna_css_: true,
    toString: () => children.map(item => item.slice(0, item.indexOf("{"))),
    toStyleString: () => children,
    toSelfString: () => `.${className}{${selfStr}}`,
    insert: () => {
      const cache = resolveCache()
      children.forEach(value => cache.insert(2, { sKey: `.${prefix}${className}`, value }))
    }
  }
}

function flatStyle(style: CSSObject | SCSSObject) {
  if (typeof style !== "object") {
    return ["", ""]
  }

  if ("__setsuna_css_" in style) {
    return [(style as SCSSObject).toSelfString(), ""]
  }

  let str = ""
  let selfStr = ""
  Object.keys(style).forEach(_key => {
    const key = _key.trim()
    const value = (style as any)[key]
    if (isString(value) && !key.startsWith("@")) {
      const _str = `${humpToTransverse(key)}:${value};`
      str += _str
      selfStr += _str
    } else if (isPlainObject(value)) {
      str += `${humpToTransverse(key)}{${flatStyle(value)[0]}}`
    }
  })
  return [str, selfStr]
}

function serialize(children: any, callback: any) {
  var output = []

  for (var i = 0; i < children.length; i++) {
    const res = callback(children[i], i, children, callback)
    if (res) output.push(res)
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
