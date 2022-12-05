import React, {
  createElement,
  ReactElement,
  ReactNode,
  useLayoutEffect,
  useRef
} from "react"
import { CSSObject } from "../css"
import { scss, SCSSObject } from "../scss"
import { removeCss } from "../removeCss"
import { acss } from "../acss"

export * from "../acss"
export * from "../scss"
export * from "../css"

type Options = {
  type: number
  factory: any
  preClassNames: string[]
  el: HTMLElement | SVGElement
  value: CSSObject | SCSSObject | Array<CSSObject>
}

function setStyle({ type, factory, preClassNames, el, value }: Options) {
  if (!Array.isArray(value)) value = [value as any]

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

  preClassNames.forEach(css => {
    if (css) {
      el.classList.remove(css.slice(1))
      removeCss(type, css)
    }
  })

  return classNames
}

type ElementNames = keyof JSX.IntrinsicElements
export type StyledComponent = {
  <T extends ElementNames>(
    props: {
      is?: T
      css?: CSSObject | SCSSObject | Array<CSSObject>
      atom?: CSSObject | Array<CSSObject>
      children?: ReactNode
    } & JSX.IntrinsicElements[T]
  ): ReactElement
}

export const Styled: StyledComponent = ({
  is = "div",
  css,
  atom,
  children,
  ...props
}) => {
  const preStyleClassNames = useRef<string[]>([])
  const domRef = useRef<HTMLElement | SVGAElement | null>(null)

  useLayoutEffect(() => {
    if (atom && domRef.current) {
      setStyle({
        type: 1,
        factory: acss,
        preClassNames: [],
        el: domRef.current,
        value: atom
      })
    }
  }, [atom])

  useLayoutEffect(() => {
    if (css && domRef.current) {
      preStyleClassNames.current = setStyle({
        type: 2,
        factory: scss,
        preClassNames: preStyleClassNames.current,
        el: domRef.current,
        value: css
      })
    }

    return () => preStyleClassNames.current.forEach(css => removeCss(2, css))
  }, [css])

  return createElement(is, {...props, ref: domRef}, children)
}
