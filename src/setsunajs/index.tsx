import { jsx, useRef, useMount, HookState } from "setsunajs"
import { CSSObject } from "../css"
import { scss, SCSSObject } from "../scss"
import { removeCss } from "../removeCss"
import { acss, ACSSObject } from "../acss"
import { htmlTags, svgTags, resolveObservableState } from "@setsunajs/shared"
import { Observable, UnObservableSubscribe } from "@setsunajs/observable"

export * from "../acss"
export * from "../scss"
export * from "../css"

type Options = {
  type: number
  factory: any
  preClassNames: string[]
  el: HTMLElement | SVGElement
  value: Array<ACSSObject | SCSSObject>
}

const classNameOnlyReg = /^(\S+)$/

function setStyle({ type, factory, preClassNames, el, value }: Options) {
  const css = factory(...value)
  css.insert()

  const classNames: string[] = css.classNames

  preClassNames.forEach(className => {
    if (classNameOnlyReg.test(className) && !classNames.includes(className)) {
      el.classList.remove(className)
      removeCss(type, className)
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
  | HookState<
      | CSSObject
      | SCSSObject
      | Record<string, string>
      | Array<CSSObject | SCSSObject>
      | Record<string, string>
    >
  | Observable<
      | CSSObject
      | SCSSObject
      | Record<string, string>
      | Array<CSSObject | SCSSObject | Record<string, string>>
    >
type ATOMType =
  | ACSSObject
  | Record<string, string>
  | Array<ACSSObject | Record<string, string>>
  | HookState<
      | ACSSObject
      | Record<string, string>
      | Array<ACSSObject | Record<string, string>>
    >
  | Observable<
      | ACSSObject
      | Record<string, string>
      | Array<ACSSObject | Record<string, string>>
    >
type ElementNames = keyof JSX.IntrinsicElements
type Props<T extends ElementNames> = {
  is?: T
  css?: CSSType
  atom?: ATOMType
} & JSX.IntrinsicElements[T]

export type StyledComponent = {
  <T extends ElementNames>(props: Props<T>): any
  [k: string]: any
} & {
  [T in ElementNames]: (
    props: {
      css?: CSSType
      atom?: ATOMType
    } & JSX.IntrinsicElements[T]
  ) => any
}

export const Styled: StyledComponent = function (
  this: { tag: ElementNames },
  { is, css, atom, ...props }: Props<ElementNames>
) {
  let domRef: any = useRef(null)[0]
  is = is ?? this?.tag ?? "div"

  useMount(() => {
    domRef = domRef()
  })

  useMount(() => {
    if (domRef && atom) {
      let preClassNames: string[] = []
      const unSubs: Array<{ ob: Observable; unSub: UnObservableSubscribe }> = []
      const value = walkValue(atom, ob => {
        const unSub = ob.subscribe(() => {
          preClassNames = setStyle({
            type: 1,
            factory: acss,
            el: domRef,
            value: walkValue(atom),
            preClassNames
          })
        })
        unSubs.push({ unSub, ob })
      })

      preClassNames = setStyle({
        type: 1,
        factory: acss,
        preClassNames: [],
        el: domRef,
        value
      })

      return () => unSubs.forEach(({ ob, unSub }) => !ob.closed && unSub())
    }
  })

  useMount(() => {
    if (domRef && css) {
      let preClassNames: string[] = []
      const unSubs: Array<{ ob: Observable; unSub: UnObservableSubscribe }> = []
      const value = walkValue(css, ob => {
        const unSub = ob.subscribe(() => {
          preClassNames = setStyle({
            type: 2,
            factory: scss,
            el: domRef,
            value: walkValue(css),
            preClassNames
          })
        })
        unSubs.push({ unSub, ob })
      })

      preClassNames = setStyle({
        type: 2,
        factory: scss,
        preClassNames,
        el: domRef,
        value
      })

      return () => {
        preClassNames.forEach(css => removeCss(2, css))
        unSubs.forEach(({ ob, unSub }) => !ob.closed && unSub())
      }
    }
  })

  return () => jsx(is, { ...props, ref: domRef } as any, jsx("children", {}))
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

function walkValue(value: unknown, cb?: (value: Observable) => void) {
  if (!Array.isArray(value)) {
    value = [value]
  }

  const values: Array<ACSSObject | SCSSObject> = []
  ;(value as any[]).forEach(itemValue => {
    const res = resolveObservableState(itemValue)
    if (res) {
      values.push(res.value)
      cb && cb(res)
    } else {
      values.push(itemValue)
    }
  })

  return values
}
