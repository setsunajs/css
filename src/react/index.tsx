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
import { acss, ACSSObject } from "../acss"
import { htmlTags, svgTags } from "@setsunajs/shared"

export * from "../acss"
export * from "../scss"
export * from "../css"

type Options = {
  type: number
  factory: any
  preClassNames: string[]
  el: HTMLElement | SVGElement
  value: ACSSObject | SCSSObject | Array<ACSSObject | SCSSObject>
}

const classNameOnlyReg = /^(\S+)$/

function setStyle({ type, factory, preClassNames, el, value }: Options) {
  if (!Array.isArray(value)) value = [value as any]

  const css = factory(...value)
  css.insert()

  const classNames: string[] = css.classNames
  classNames.forEach(className => {
    if (classNameOnlyReg.test(className)) {
      el.classList.add(className)
    }
  })

  preClassNames.forEach(className => {
    if (classNameOnlyReg.test(className) && !classNames.includes(className)) {
      removeCss(type, className)
    }
  })

  return classNames
}

type CSSType =
  | CSSObject
  | SCSSObject
  | Record<string, string>
  | Array<CSSObject | SCSSObject | Record<string, string>>
type ATOMType =
  | ACSSObject
  | Record<string, string>
  | Array<ACSSObject | Record<string, string>>
type ElementNames = keyof JSX.IntrinsicElements
type Props<T extends ElementNames> = {
  is?: T
  css?: CSSType
  atom?: ATOMType
  children?: ReactNode
} & JSX.IntrinsicElements[T]
export type StyledComponent = {
  <T extends ElementNames>(props: Props<T>): ReactElement
  [k: string]: any
} & {
  [T in ElementNames]: (
    props: {
      css?: CSSType
      atom?: ATOMType
      children?: ReactNode
    } & JSX.IntrinsicElements[T]
  ) => ReactElement
}

export const Styled: StyledComponent = function (
  this: { tag: ElementNames },
  { is, css, atom, children, ...props }: Props<ElementNames>
) {
  is = is ?? this?.tag ?? "div"
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

  return createElement(is, { ...props, ref: domRef } as any, children)
} as any

export const C = Styled

{
  for (const htmlTag of Object.keys(htmlTags)) {
    const _Styled = Styled.bind({ tag: htmlTag })
    ;(Styled as any)[htmlTag] = _Styled
  }
  for (const svgTag of Object.keys(svgTags)) {
    const _Styled = Styled.bind({ tag: svgTag })
    ;(Styled as any)[svgTag] = _Styled
  }
}
