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
  value: CSSObject | SCSSObject | Array<CSSObject>
}

function setStyle({ type, factory, el, preClassNames, value }: Options) {
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

  preClassNames.forEach(css => {
    console.log(css, "r")
    if (css) {
      el.classList.remove(css.slice(1))
      removeCss(type, css)
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
      if (atom) {
        let preClassNames: string[] = []

        preClassNames = setStyle({
          type: 1,
          factory: acss,
          el: domRef.value!,
          preClassNames,
          value: unref(atom)
        })

        watchChange(atom, value => {
          preClassNames = setStyle({
            type: 1,
            factory: acss,
            el: domRef.value!,
            preClassNames,
            value
          })
        })
      }

      if (css) {
        let preClassNames: string[] = []

        preClassNames = setStyle({
          type: 2,
          factory: scss,
          el: domRef.value!,
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

    // // template: `<component :is="tag" ref="domRef"><slot/></component>`,
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
  css?: CSSObject | SCSSObject | Array<CSSObject>
  atom?: CSSObject | Array<CSSObject>
}>
