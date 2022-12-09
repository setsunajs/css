import { ACSSObject } from "./../acss"
import {
  createBlock,
  DefineComponent,
  defineComponent,
  Directive,
  isReactive,
  isRef,
  onMounted,
  openBlock,
  ref,
  renderSlot,
  resolveDynamicComponent,
  unref,
  watch,
  withCtx
} from "vue"
import { CSSObject, CSSProperties } from "../css"
import { acss } from "../acss"
import { scss, SCSSObject } from "../scss"
import { removeCss } from "../removeCss"

export * from "../acss"
export * from "../scss"
export * from "../css"

type Options = {
  type: number
  factory: any
  preClassNames: string[]
  el: HTMLElement
  value: CSSType | ATOMType
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

const classNameOnlyReg = /^(\S+)$/

function setStyle({ type, factory, el, preClassNames, value }: Options) {
  if (!Array.isArray(value)) value = [value as any]

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

export const vAtom: Directive<HTMLElement, ATOMType> = {
  mounted(el, { value }) {
    let preClassNames: string[] = []

    preClassNames = setStyle({
      type: 1,
      factory: acss,
      el,
      preClassNames,
      value: unref(value)
    })

    watchChange(value, value => {
      preClassNames = setStyle({
        type: 1,
        factory: acss,
        el,
        preClassNames,
        value
      })
    })
  }
}

export const vCss: Directive<HTMLElement, CSSType> = {
  mounted(el, { value }) {
    let preClassNames: string[] = []

    preClassNames = setStyle({
      type: 2,
      factory: scss,
      el,
      preClassNames,
      value: unref(value)
    })

    watchChange(value, value => {
      preClassNames = setStyle({
        type: 2,
        factory: scss,
        el,
        preClassNames,
        value
      })
    })
  }
}

function watchChange(value: any, callback: (value: any) => any) {
  if (isRef(value) || isReactive(value)) {
    watch(value, callback)
  }
}

export const Styled = defineComponent({
  props: {
    is: {
      type: String,
      default: "div"
    },
    css: {
      type: [Object, Array],
      default: () => {}
    },
    atom: {
      type: [Object, Array],
      default: () => {}
    }
  },
  setup({ css, atom }) {
    const domRef = ref<null | HTMLElement>(null)
    onMounted(() => {
      if (css && domRef.value) {
        let preClassNames: string[] = []

        preClassNames = setStyle({
          type: 2,
          factory: scss,
          el: domRef.value,
          preClassNames,
          value: unref(css) as any
        })

        watchChange(css, value => {
          preClassNames = setStyle({
            type: 2,
            factory: scss,
            el: domRef.value!,
            preClassNames,
            value
          })
        })
      }

      if (atom && domRef.value) {
        setStyle({
          type: 1,
          factory: acss,
          el: domRef.value,
          preClassNames: [],
          value: unref(atom) as any
        })

        watchChange(atom, value => {
          setStyle({
            type: 1,
            factory: acss,
            el: domRef.value!,
            preClassNames: [],
            value
          })
        })
      }
    })

    //template: `<component :is="tag" ref="domRef"><slot/></component>`,
    return (_ctx: any, _cache: any) => {
      return (
        openBlock(),
        createBlock(
          resolveDynamicComponent(_ctx.is),
          { ref: domRef },
          {
            default: withCtx(() => [renderSlot(_ctx.$slots, "default")]),
            _: 3
          },
          512
        )
      )
    }
  }
}) as DefineComponent<{
  is?: keyof CSSProperties | (string & {})
  css?: CSSType
  atom?: ATOMType
}>
