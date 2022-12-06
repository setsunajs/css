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
  value: CSSObject | SCSSObject | Array<CSSObject | SCSSObject>
}

function setStyle({ type, factory, el, preClassNames, value }: Options) {
  if (!Array.isArray(value)) value = [value as any]

  const css = factory(...value)
  css.insert()

  const classNames: string[] = css.classNames
  if (!el.classList.contains(classNames[0])) {
    el.classList.add(classNames[0])
  }

  preClassNames.forEach(className => {
    const index = className.indexOf(className)
    if (index === -1) {
      removeCss(type, className)
    }
    if (/^[a-zA-Z]+$/.test(className)) {
      el.classList.remove(className)
    }
  })

  return classNames
}

export const vAtom: Directive<HTMLElement, CSSObject | Array<CSSObject>> = {
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

export const vCss: Directive<
  HTMLElement,
  CSSObject | SCSSObject | Array<CSSObject>
> = {
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
      type: Object,
      default: () => {}
    },
    atom: {
      type: Object,
      default: () => {}
    }
  },
  setup({ css, atom }) {
    const domRef = ref<null | HTMLElement>(null)
    onMounted(() => {
      if (atom && domRef.value) {
        setStyle({
          type: 1,
          factory: acss,
          el: domRef.value,
          preClassNames: [],
          value: unref(atom)
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

      if (css && domRef.value) {
        let preClassNames: string[] = []

        preClassNames = setStyle({
          type: 2,
          factory: scss,
          el: domRef.value,
          preClassNames,
          value: unref(css)
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
  css?: CSSObject | SCSSObject | Array<CSSObject | SCSSObject>
  atom?: CSSObject | Array<CSSObject>
}>
