import { Directive, isReactive, isRef, unref, watch } from "vue"
import { CSSObject } from "../css"
import { acss } from "../acss"
import { scss, SCSSObject } from "../scss"
import { removeCss } from "../removeCss"

export * from "../acss"
export * from "../scss"
export * from "../css"

type Options = {
  factory: any
  preClassNames: string[]
  el: HTMLElement
  value: CSSObject | SCSSObject | Array<CSSObject>
}

function setStyle({ factory, el, preClassNames, value }: Options) {
  if (!Array.isArray(value)) {
    value = [value as any]
  }

  const css = factory(...value)
  const classNames: string[] = css.toString()

  css.insert()

  classNames.forEach(css => {
    if (!el.classList.contains(css)) {
      el.classList.add(css.slice(1))
    }

    const index = preClassNames.indexOf(css)
    if (index > -1) preClassNames[index] = ""
  })

  preClassNames.forEach(css => {console.log( css, "r" )
    if (css) {
      el.classList.remove(css.slice(1))
      removeCss(2, css)
    }
  })

  return classNames
}

export const vAtom: Directive<HTMLElement, CSSObject | Array<CSSObject>> = {
  mounted(el, { value }) {
    let preClassNames: string[] = []

    preClassNames = setStyle({ factory: acss, el, preClassNames, value: unref(value) })

    watchChange(value, value => {
      preClassNames = setStyle({ factory: acss, el, preClassNames, value })
    })
  }
}

export const vCss: Directive<
  HTMLElement,
  CSSObject | SCSSObject | Array<CSSObject>
> = {
  mounted(el, { value }) {
    let preClassNames: string[] = []

    preClassNames = setStyle({ factory: scss, el, preClassNames, value })

    watchChange(value, value => {
      preClassNames = setStyle({ factory: scss, el, preClassNames, value })
    })
  }
}

function watchChange(value: any, callback: (value: any) => any) {
  if (isRef(value) || isReactive(value)) {
    watch(value, callback)
  }
}