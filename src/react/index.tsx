import React, {
  createElement,
  forwardRef,
  ReactElement,
  ReactNode,
  useLayoutEffect,
  useRef,
  Ref
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

  preClassNames.forEach(className => {
    if (classNameOnlyReg.test(className) && !classNames.includes(className)) {
      removeCss(type, className)
      el.classList.remove(className)
    }
  })

  classNames.forEach(className => {
    if (classNameOnlyReg.test(className)) {
      el.classList.add(className)
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

const _Styled = function (
  this: { tag: ElementNames },
  { is, css, atom, children, ...props }: Props<ElementNames>,
  ref: Ref<unknown>
) {
  is = is ?? this?.tag ?? "div"
  const preStyleClassNames = useRef<string[]>([])
  const preAtomClassNames = useRef<string[]>([])
  const domRef: any = ref ?? useRef(null)

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

  useLayoutEffect(() => {
    if (atom && domRef.current) {
      preAtomClassNames.current = setStyle({
        type: 1,
        factory: acss,
        preClassNames: preAtomClassNames.current,
        el: domRef.current,
        value: atom
      })
    }
  }, [atom])

  return createElement(is, { ...props, ref: domRef } as any, children)
}

export const Styled: StyledComponent = forwardRef(_Styled) as any

export const C = Styled

{
  for (const htmlTag of Object.keys(htmlTags)) {
    ;(Styled as any)[htmlTag] = forwardRef(
      _Styled.bind({ tag: htmlTag } as any)
    )
  }
  for (const svgTag of Object.keys(svgTags)) {
    ;(Styled as any)[svgTag] = forwardRef(_Styled.bind({ tag: svgTag } as any))
  }
}
