# @setsunajs/css

- 一个能适用多个框架的`css in js —— atom css 运行时

  `atom css` 也就是原子 CSS，你可以把它和`tailwindcss`联想到一起

  `@setsunajs/css`不需要什么配置，只需要引入相关 API 即可使用，内部创建的原子将会产生永久缓存，来避免`css in js`不断销毁和创建带来的性能损耗

  算是在性能好易用上取到了平衡吧

- 一个能适用多个框架的`css in js`运行时

  考虑到，如果只是纯粹的原子 CSS，很大可能会遇到因为使用不同开发者的，使用习惯，拆解不得当，导致的灵活度不够的问题，所以提供了类似于`@emotion/react`类似的`css in js`功能

  当然，它的体积会小得多，这是可选的特性，您也可以选择其他形式来弥补原子 CSS 灵活度不够的问题

- 目前支持的框架有（`rect`, `vue`），相关 TS 类型完备

如果您想要`tailwindcss`这样的体积优势，以及更加灵活的原子 css 方案，同时也喜欢`css in js`的灵活

或许您可以尝试下它

## 下载

```sh
npm i @setsunajs/css
```

## 导航

- <a href="#setsuna">适配 `setsuna`</a>
- <a href="#vue">适配 `vue`</a>
- <a href="#react">适配 `react`</a>
- <a href="#core">核心库，可以自定义封装，适配到任意框架</a>

## setsuna

使用时需要样式容器组件作为兜底，它用起来是这样

```jsx
import { Styled, C } from "@setsunajs/css/lib/setsunajs"

// 使用样式组件
const App = () => {
  // is 表示应该渲染出什么节点，默认是 div
  // atom 用于设置原子 css，它写起来和行内 style 一样，并且只有一级
  // css 用于设置 cssInJs 样式，它写起来和行内 style 一样，但可以存在嵌套和多级
  return () => (
    <Styled is="h1" atom={{ color: "red" }} css={{ color: "orange" }}>
      这是一段文字...
    </Styled>
  )
}

// 使用简写形式 01, C 是 Styled 组件的别名
const App1 = () => {
  return () => (
    <C is="h1" atom={{ color: "red" }} css={{ color: "orange" }}>
      这是一段文字...
    </C>
  )
}

// 使用简写形式 02, 样式容器上挂载着不同的标签名，是 is 属性的另一种使用方式
const App1 = () => {
  return () => (
    <div>
      <Styled.h1> 这是一段文字... </Styled.h1>
      <C.h2> 这是一段文字... </C.h2>
    </div>
  )
}
```

创建原子 css 并使用

**使用原子 css 需要依托于，样式容器的 `atom` 属性，它可以接收一个样式对象（对象只能有一级，不能嵌套），或者是样式数组**

**一旦经过使用的原子 css 都会被长久的缓存到全局，不会销毁实际样式，这意味着更好的性能，这是有意为之**

完整的可接收参数请看<a href="acss">core-acss</a>

```jsx
const App1 = () => {
  return () => (
    <C.div
      atom={{
        color: "red",

        //伪类的使用是，以伪类的符号作为 key，然后写嵌套对象样式即可
        //这是唯一允许发生嵌套的条件，内部会做特殊处理
        ":hover": {
          color: "slateblue"
        }
      }}
    >
      这是一段文字
    </C.div>
  )
}
```

创建 cssInJs 使用

**css in js 的定位是对于原子 css 的补充，也是一个备选方案，建议不要过度依赖**

**它依托于，样式容器的 `css` 属性，它可以接收一个样式对象（对象能有多级，允许嵌套），或者是样式数组**

```jsx
const App1 = () => {
  return () => (
    <C.div
      atom={{
        color: "red",
        "&hover": {
          color: "slateblue"
        },

        ".title": {
          color: "orange"
        }
      }}
    >
      这是一段文字
    </C.div>
  )
}
```

结合外部样式

```jsx
import { scss } from "@setsunajs/css/lib/setsunajs"

const atomStyle1 = { color: "red" }
const atomStyle2 = { fontSize: "12px" }

const cssStyle1 = { color: "red" }
const cssStyle2 = scss({ "&:hover": { color: "orange" } })

const App1 = () => {
  return () => (
    <C.div atom={[atomStyle1, atomStyle2]} css={[cssStyle1, cssStyle2]}>
      这是一段文字
    </C.div>
  )
}
```

创建响应式的样式 & 开发推荐写法

+ 创建样式 hook 抽离样式到外侧（如果样式多的话才需要），或者直接写行内原子 css（样式少的时候）
+ 内部根据外部的参数变化来动态调整参数

```jsx
import { FC, S, useEffect, useState } from 'setsunajs'
import { C } from '@setsunajs/css/lib/setsunajs'

const useHomeStyle = (num: S<number>) => {
  const [style, setStyle] = useState({
    textAlign: "center",
    color: 'orange'
  })

  useEffect([num], n => {
    console.log( n )
    setStyle({ ...style(), color: n % 2 === 0 ? 'red' : 'orange' })
  })

  return style
}

export const Home: FC = () => {
  const [num, setNum] = useState(0)
  const add = () => setNum(num() + 1)

  return () => (
    <C.h1 atom={useHomeStyle(num)}>
      <p>{num()}</p>
      <button onClick={add}>++</button>
    </C.h1>
  )
}
```

## vue

通过指令（`v-atom`）的方式使用， **行内， 原子 CSS**

该指令将会生成全局的，持久化的样式（即卸载后依然存在于全局，这是有意为之）

重复创建会自动去重，保证全局唯一

```vue
<script setup lang="ts">
import { vAtom } from "@setsunajs/css/lib/vue"
</script>

<template>
  <!-- 将会生成 color-red 的类名 -->
  <div v-atom="{ color: 'red', ':hover': { color: 'orange' } }">hello</div>
</template>
```

通过指令（`v-css`）的方式使用`css in js`

```vue
<script setup lang="ts">
import { vCss } from "@setsunajs/css/lib/vue"
</script>

<template>
  <div v-css="{ color: 'red' }">hello</div>
</template>
```

创建响应式的样式更改效果

```vue
<script setup lang="ts">
import { vAtom, vCss } from "@setsunajs/css/lib/vue"
import { reactive } from "vue"

const atomStyle = reactive({ color: "red" })
const cssStyle = reactive({ color: "red" })

setTimeout(() => {
  atomStyle.color = "blue"
  cssStyle.fontSize = "12px"
}, 2000)
</script>

<template>
  <div v-css="atomStyle">hello</div>
  <div v-css="cssStyle">hello</div>
</template>
```

样式组件

`is` 属性用于规定最终显示什么，默认是 div

`css` 属性和`v-css`指令效果一致

`atom`属性和`v-atom`指令效果一致

```vue
<script setup lang="ts">
import { vCss } from '@setsunajs/css/lib/vue'

const atomStyle = reactive({ color: "red" })
const cssStyle = reactive({ color: "red" })
</script>

<template>
<Styled is="h1" :atom="atomStyle" :css="cssStyle">hello</div>
</template>
```

结合外部样式

`scss` 会生成自己的样式，具体细节请看 <a href="#scss">core-scss</a>

```vue
<script setup lang="ts">
import { vCss, scss } from '@setsunajs/css/lib/vue'

const atomStyle = reactive({ color: "red" })
const cssStyle = reactive({ color: "red" })

const s1 = scss({ fontSize: "30px" })
</script>

<template>
<div v-css="[cssStyle, s1]">hello</div>
<Styled :css="[cssStyle, s1]">hello</Styled>

<div v-atom="[atomStyle, { fontSize: "40px" }]">aaa</div>
<Styled :atom="atomStyle, { fontSize: "40px" }]">hello</Styled>
</template>
```

开发推荐

我们肯定不希望我们的样式全部都写在行内，或者一个文件内

所以这里推荐两种做法

- 使用 `v-atom` 写在行内也可以，就和`tailwindcss`一样

- 使用 `reactive`抽离到外部使用，使用时自行引入

  ```js
  function useAppStyle() {
    const style = reactive({ color: "red" })
    return style
  }
  ```

## react

通过样式组件使用

`Styled`为容器组件，内部封装了样式处理的相关逻辑，`is`属性可以动态决定渲染成什么标签，默认是 div

`Styled.h1`是容器组件身上静态挂载的，如果不喜欢设置 `is` 则可以使用这种形式

```tsx
import { FC } from "react"
import { Styled } from "@setsunajs/css/lib/react"

const Home: FC = () => {
  return (
    <>
      <Styled.h1>aaa</Styled.h1>
      <Styled is="h1">aaa</Styled>
    </>
  )
}

export default Home
```

添加（`atom 原子`）样式

将会生成全局的，持久化的样式（即卸载后依然存在于全局，这是有意为之）

重复创建会自动去重，保证全局唯一

```tsx
import { FC } from "react"
import { Styled } from "@setsunajs/css/lib/react"

const Home: FC = () => {
  return (
    <>
      <Styled.h1 atom={{ color: "red" }}>aaa</Styled.h1>
      <Styled is="h1" atom={{ color: "red", ":hover": { color: "orange" } }}>
        aaa
      </Styled>
    </>
  )
}

//批量
const Home: FC = () => {
  return (
    <>
      <Styled.h1 atom={[{ color: "red" }]}>aaa</Styled.h1>
      <Styled is="h1" atom={[{ color: "red" }]}>
        aaa
      </Styled>
    </>
  )
}

export default Home
```

添加（`css in js`）样式

```tsx
import { FC } from "react"
import { Styled } from "@setsunajs/css/lib/react"

const Home: FC = () => {
  return (
    <>
      <Styled.h1 css={{ color: "red" }}>aaa</Styled.h1>
      <Styled is="h1" css={{ color: "red" }}>
        aaa
      </Styled>
    </>
  )
}

//批量
const Home1: FC = () => {
  return (
    <>
      <Styled.h1 css={[{ color: "red" }]}>aaa</Styled.h1>
      <Styled is="h1" css={[{ color: "red" }]}>
        aaa
      </Styled>
    </>
  )
}

export default Home
```

引用外部样式

`scss` 会生成自己的样式，具体细节请看 <a href="#scss">core-scss</a>，但你可能不太会用得到它

```tsx
import { FC, useState } from "react"
import { scss, Styled } from "@setsunajs/css/lib/react"

const css1 = scss({ color: "red" })

const Home: FC = () => {
  const [style, setStyle] = useState({ color: "red" })
  const toggleStyle = () => {
    setStyle({ color: style.color === "red" ? "orange" : "red" })
  }

  return (
    <Styled.h1
      css={[
        style,
        scss({ fontSize: "14px", [css1.className]: { color: "red" } })
      ]}
    >
      home page
      <hr />
      <button onClick={toggleStyle}>{JSON.stringify(style)}</button>
    </Styled.h1>
  )
}

export default Home
```

Q & A

- 为什么不是类似于`@emotion/react`那样的使用方式？

  因为本质上样式组件都需要在外侧生成一层，`@emotion/react`虽然可以直接写行内但是需要经过配置，而且写样式组件并不会多大多少代码

- 有没有`@emotion/styled`那样的外部样式组件？

  没有，原因有 2

  更加推荐使用 `atom` 的形式写样式，它即便写行内也不会有什么问题，或者通过 js 抽离到外部，容器组件内部会自定根据外部传入来更新样式

  对于`css in js`下的样式抽离和动态性，推荐是以组合`scss()` 的形式进行，你可以创建多个`scss()`实例，然后有条件的更新，组合，最后丢给容器组件即可

- 和 `emotion` 的对比

  体积更小

  可以使用 原子 css in js

  使用更加简单

## core

核心 API 有 4 个，所有的 API 都可以从 `@setsunajs/css`中引入，以下所有 demo 都可以在<a href="https://github.com/setsunajs/css/blob/main/src/__test__/browser.test.ts">这里</a>找到实际演示

### `createCache`

创建缓存，需要最先进行调用

### `acss`

创建一个原子 css 对象（此时尚未插入）

样式生成规则为`{color: "red"}  ==> color-red`, 即扁平化的 key-value，所有非法的传参会被忽略，比如嵌套样式

样式一旦插入将会一直保留在 dom 中，无法通过 `removeCss` 删除，这是有意为之

setsunajs, react, vue 中所有原子 CSS 的底层 API

```js
import { acss } from "@setsunajs/css"

//单个参数
const css1 = acss({ color: "red" })
//多个参数
const css2 = acss({ color: "red" }, { fontSize: "14px" })
```

拿到原子对象后，可以根据需要进行下一步的操作

```js
const css = acss({
  color: "red",
  fontSize: "12px"
})

//获取生成的类名数组
css.classNames

//插入到 dom 中
css.insert()
```

### `acss`

创建一个 `css in js`对象（此时尚未插入）

该 API 是为了弥补原子 CSS 灵活度不够的备用方案，内部会生成随机类名来确保样式的唯一性

样式允许嵌套，允许复用，允许组合，允许删除

样式依赖于运行时的编译

setsunajs, react, vue 中所有 `css in js` 的底层 API

```js
import { acss } from "@setsunajs/css"

//基本创建
const css1 = acss({ color: "red" })
//组合样式
const css2 = acss(
  { color: "red" },
  { fontSize: "14px" },
  acss({ color: "blue" })
)
//嵌套样式
const css3 = acss({
  color: "red",
  ".title": { color: "orange" }
})
//样式穿透，即嵌套 acss
const css4 = acss({
  color: "red",
  [css1.className]: {
    color: "orange"
  }
})
//伪元素
const css5: acss({
  color: "red",
  ":hover": {
    color: "orange"
  }
})
```

拿到创建的对象后，可以根据需要进行下一步的操作

```js
const css = acss({ color: "red" })

//获取生成的类名
css.className

//获取生成的多个类名（当发生样式嵌套时，编译成 css 会产生多条）
css.classNames

//插入到 dom
css.insert()
```

### `removeCss`

用于删除 `scss` 插入进 dom 的样式

```js
import { removeCss } from "@emotion/css"

removeCss(2, scssClassName)
```
