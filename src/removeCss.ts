import { resolveCache } from "./createCssCache"

export function removeCss(type: number, classNames: string[] | string) {
  if (!Array.isArray(classNames)) classNames = [classNames]
  const cache = resolveCache()
  classNames.forEach(className => cache.remove(type, { className }))
}