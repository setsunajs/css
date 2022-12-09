# @setsunajs/css

- <a href="https://github.com/setsunajs/css/tree/main/docs/zh.md">中文文档</a>

- a css in js that can apply to multiple frameworks -- atom css runtime

  `atom css` is atomic CSS. You can associate it with `tailwindcss`

  `@setsunajs/css`  no configuration is required, just import the relevant API to use it. The internally created atom will generate a permanent cache to avoid the performance loss caused by the constant destruction and creation of  `css in js'
  
  It's a balance between good performance and ease of use
  
 - a 'css in js' runtime that can apply to multiple frameworks

   Considering that if it is purely atomic CSS, it may encounter the problem of insufficient flexibility due to the use of different developers, their usage habits, and improper disassembly, so it provides a similar 'css in js' function as' @ emotion/react'

   Of course, its volume will be much smaller, which is an optional feature. You can also choose other forms to make up for the lack of flexibility of atomic CSS

Currently, the supported frameworks are (` rect ', ` vue'), and the related TS types are complete

If you want the size advantage of 'tailwindcss' and a more flexible atomic css scheme, you also like the flexibility of' css in js'

Maybe you can try it


## install

```sh
npm i @setsunajs/css
```

## Table of Contents

- <a href="#setsuna"> `setsuna`</a>
- <a href="#vue"> `vue`</a>
- <a href="#react"> `react`</a>
- <a href="#core">core，Customized encapsulation can be applied to any frame</a>

## setsuna

The style container component is required to be used as the pocket bottom. It is used as follows

```jsx
import { Styled, C } from "@setsunajs/css/lib/setsunajs"

// using Style Components
const App = () => {
	//Is indicates which node should be rendered. The default is div
	//Atom is used to set the atomic css. It is written in the same style as the inline style and has only one level
	//Css is used to set the cssInJs style, which is the same as the inline style, but can have nesting and multi-level
  return () => (
    <Styled is="h1" atom={{ color: "red" }} css={{ color: "orange" }}>
      text...
    </Styled>
  )
}

// Using the short 01, C is the alias of the Styled component
const App1 = () => {
  return () => (
    <C is="h1" atom={{ color: "red" }} css={{ color: "orange" }}>
      这是一段文字...
    </C>
  )
}

// Using the short 02, Different tag names are mounted on the style container, which is another way to use the is attribute
const App1 = () => {
  return () => (
    <div>
      <Styled.h1> text... </Styled.h1>
      <C.h2> text... </C.h2>
    </div>
  )
}
```

use atom css

**The use of atomic css depends on the 'atom' attribute of the style container, which can receive a style object (objects can only have one level and cannot be nested), or a style array**

**Once used, the atomic CSS will be cached to the global for a long time, and the actual style will not be destroyed, which means better performance. This is intentional**

See<a href="#acss">core acss for complete acceptable parameters</a>

```jsx
const App1 = () => {
  return () => (
    <C.div
      atom={{
        color: "red",

        //The use of pseudo classes is to use the pseudo class symbol as the key, and then write the nested object style

				//This is the only condition that allows nesting. Special processing will be done internally
        ":hover": {
          color: "slateblue"
        }
      }}
    >
      text
    </C.div>
  )
}
```

use cssInJs

**The positioning of css in js is a supplement to atomic css and an alternative. It is recommended not to rely too much on it**

**It relies on the `css` attribute of the style container. It can receive a style object (objects can have multiple levels and can be nested) or a style array**

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
      text
    </C.div>
  )
}
```

External Styles

```jsx
import { scss } from "@setsunajs/css/lib/setsunajs"

const atomStyle1 = { color: "red" }
const atomStyle2 = { fontSize: "12px" }

const cssStyle1 = { color: "red" }
const cssStyle2 = scss({ "&:hover": { color: "orange" } })

const App1 = () => {
  return () => (
    <C.div atom={[atomStyle1, atomStyle2]} css={[cssStyle1, cssStyle2]}>
      text
    </C.div>
  )
}
```

Create a responsive style&develop recommended writing

- Create a style hook to extract the style to the outside (only required if there are many styles), or directly write the atomic css in the line (when there are few styles)
- Dynamically adjust parameters internally according to external parameter changes

```jsx
import { FC, S, useEffect, useState } from "setsunajs"
import { C } from "@setsunajs/css/lib/setsunajs"

const useHomeStyle = (num: S<number>) => {
  const [style, setStyle] = useState({
    textAlign: "center",
    color: "orange"
  })

  useEffect([num], n => {
    console.log(n)
    setStyle({ ...style(), color: n % 2 === 0 ? "red" : "orange" })
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

use atom css

Used by the directive (` v-atom ')

This instruction will generate a global, persistent style (that is, it still exists in the global after unloading, which is intentional)

Repeated creation will automatically remove duplicates to ensure global uniqueness

```vue
<script setup lang="ts">
import { vAtom } from "@setsunajs/css/lib/vue"
</script>

<template>
  <div v-atom="{ color: 'red', ':hover': { color: 'orange' } }">hello</div>
</template>
```

use `css in js` by directive （`v-css`

```vue
<script setup lang="ts">
import { vCss } from "@setsunajs/css/lib/vue"
</script>

<template>
  <div v-css="{ color: 'red' }">hello</div>
</template>
```

Create responsive style change effects

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

style component

`is` attribute is used to specify what will be displayed finally. The default is div

`css` attribute is consistent with the `v-css` directive

`atom` attribute has the same effect as the `v-atom` directive

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

use external styles

`scss ` is an auxiliary function, but you may not use it <a href="#scss">core-scss</a>

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

Development recommendation

We certainly don't want all our styles written in the line or in a file

So here are two recommended practices

- use `v-atom` to write in the line, just like `tailwindcss`

- use `reactive` to extract it for external use, and introduce it when using

  ```js
  function useAppStyle() {
    const style = reactive({ color: "red" })
    return style
  }
  ```

## react

Use with style components

The following three writing methods have the same effect

```tsx
import { FC } from "react"
import { Styled, C } from "@setsunajs/css/lib/react"

const Home: FC = () => {
  return (
    <>
    	//01 display elements can be changed through is. default is div
      <Styled is="h1">aaa</Styled>
    
      //02 the short
      <Styled.h1>aaa</Styled.h1>
    
    	//03 the short
    	<C.h1>aaa</C.h1>
    </>
  )
}

export default Home
```

use atom css

A global and persistent style will be generated (that is, it still exists in the global after uninstallation, which is intentional)

Repeated creation will automatically remove duplicates to ensure global uniqueness

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

//batchs
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

use css in js

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

//batchs
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

use external styles

`scss ` is an auxiliary function, but you may not use it <a href="#scss">core-scss</a>

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

- Why not use it in a way similar to '@ emotion/react'?

  Because in essence, style components need to generate a layer on the outside. Although '@ emotion/react' can be written directly in the line, it needs to be configured, and there is not much code to write style components

- Are there external style components like '@ emotion/styled'?

  No, there are 2 reasons

  It is more recommended to use the form of 'atom' to write the style. Even if it is written in the line, there will be no problem. Or, if it is extracted to the outside through js, the container component will automatically update the style according to the external incoming

  For style separation and dynamics under 'css in js', it is recommended to combine' scss() '. You can create multiple' scss() 'instances, then conditionally update and combine them, and finally throw them to container components

- Comparison with 'emotion'

​		Smaller volume

​		You can use atomic css in js

​		Easier to use

## core

four core APIs, all of which can be imported from '@ setsunajs/css'. All the following demos can be imported in<a href=“ https://github.com/setsunajs/css/blob/main/src/__test__/browser.test.ts ">Here</a>find the actual demonstration

### `createCache`

create a cache, need call it first

### `acss`

Create an atomic css object (it has not been inserted at this time)

The style generation rule is `{color: "red"}==>color red`, that is, flat key values. All illegal references, such as nested styles, will be ignored

Once the style is inserted, it will remain in the dom and cannot be deleted through `removeCss`  This is intentional

The underlying API of all atomic CSS in setsunajs, react, and vue

```js
import { acss } from "@setsunajs/css"

//once
const css1 = acss({ color: "red" })
//multiple
const css2 = acss({ color: "red" }, { fontSize: "14px" })
```

After getting the atomic object, you can proceed to the next step as required

```js
const css = acss({
  color: "red",
  fontSize: "12px"
})

//get the generated class names
css.classNames

//insert to dom
css.insert()
```

### `acss`

Create a `css in js ` object (it has not been inserted at this time)

This API is an alternative solution to make up for the lack of flexibility of atomic CSS. Random class names will be generated internally to ensure the uniqueness of the style

Styles can be nested, reused, combined and deleted

Styles depend on compilation at run time

The underlying API of all `css in js`  in setsunajs, react, vue

```js
import { acss } from "@setsunajs/css"

//basic
const css1 = acss({ color: "red" })
//combination
const css2 = acss(
  { color: "red" },
  { fontSize: "14px" },
  acss({ color: "blue" })
)
//nested
const css3 = acss({
  color: "red",
  ".title": { color: "orange" }
})
//deep style
const css4 = acss({
  color: "red",
  [css1.className]: {
    color: "orange"
  }
})
//Pseudo element
const css5: acss({
  color: "red",
  ":hover": {
    color: "orange"
  }
})
```

After you get the created object, you can proceed to the next step as required

```js
const css = acss({ color: "red" })

//get the generated class name
css.className

//Get multiple generated class names (when style nesting occurs, multiple names will be generated when compiled into css)
css.classNames

//insert to dom
css.insert()
```

### `removeCss`

The style used to delete `scss` inserted into dom

```js
import { removeCss } from "@emotion/css"

removeCss(2, scssClassName)
```
