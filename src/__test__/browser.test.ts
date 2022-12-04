import "@testing-library/jest-dom"
import { acss } from "src/acss"
import { createCache, resolveCache } from "src/createCssCache"
import { scss } from "src/scss"

describe("acss", () => {
  it("acss-className", () => {
    expect(
      acss({
        color: "red",
        fontSize: "12px",
        ".title": {
          fontSize: "14px"
        }
      }).toString()
    ).toEqual([".color-red", ".font-size-12px"])
  })

  it("style-insert", async () => {
    createCache()
    acss({ color: "red", fontSize: "12px" }).insert()
    acss({ color: "orange", fontSize: "12px" }).insert()
    await Promise.resolve(1)
    expect(document.querySelector(`[${resolveCache().id}]`)!.textContent).toBe(
      ".color-red{color:red;}.font-size-12px{font-size:12px;}.color-orange{color:orange;}"
    )
  })
})

describe("scss", () => {
  it("scss-className", () => {
    expect(
      scss({
        color: "orange",
        ".title": {
          fontSize: "12px"
        }
      }).toString().length
    ).toBe(2)

    const s1 = scss({ background: "red" })
    const s2 = scss({ color: "red" })
    const s3 = scss({
      color: "orange",
      ".title": {
        fontSize: "12px"
      },
      [s1.toString()[0]]: {
        color: "pink"
      }
    })
  })

  it("deep scss", () => {
    const s1 = scss({ background: "red" })
    const s2 = scss({
      color: "orange",
      [s1.toString()[0]]: {
        color: "pink"
      }
    })
    expect(s2.toStyleString()).toEqual([
      ".7kmldq{color:orange;}",
      ".7kmldq .1443u2l{color:pink;}"
    ])
  })

  it("scss self style", () => {
    const s1 = scss({ background: "red" })
    const s2 = scss({
      color: "orange",
      [s1.toString()[0]]: {
        color: "pink"
      }
    })
    expect(s2.toSelfString()).toBe(".7kmldq{color:orange;}")
  })

  it("scss insert", async () => {
    createCache()
    scss({ color: "red" }).insert()

    expect(document.querySelectorAll(`[${resolveCache().id}]`).length).toBe(1)
    await Promise.resolve(1)
    expect(document.querySelectorAll(`[${resolveCache().id}]`)[1].textContent).toBe(".tokvmb{color:red;}")
  })
})
