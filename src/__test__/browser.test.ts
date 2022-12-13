import { query, queryAll } from "@setsunajs/shared"
import "@testing-library/jest-dom"
import { acss } from "src/acss"
import { createCache, resolveCache, resolvePrefix } from "src/createCssCache"
import hash from "src/hash"
import { scss } from "src/scss"

describe("acss", () => {
  it("className", () => {
    expect(
      acss({
        color: "red",
        fontSize: "12px",
        ".title": {
          fontSize: "14px"
        }
      }).classNames
    ).toEqual(["color-red", "font-size-12px"])
  })

  it("style content", () => {
    expect(
      acss({
        color: "red",
        fontSize: "12px",
        ".title": {
          fontSize: "14px"
        }
      }).toStyleString()
    ).toEqual([".color-red{color:red;}", ".font-size-12px{font-size:12px;}"])
  })

  it("multiple-content", () => {
    expect(
      acss({ color: "red" }, { fontSize: "12px" }).toStyleString()
    ).toEqual([".color-red{color:red;}", ".font-size-12px{font-size:12px;}"])
  })

  it("insert(one and multiple)", async () => {
    createCache()
    acss({ color: "red", fontSize: "12px" }).insert()
    acss({ color: "orange", fontSize: "12px" }).insert()
    acss({ color: "red" }, { fontSize: "12px" }).insert()

    await Promise.resolve()

    const els = queryAll(`[${resolveCache().id}]`)!
    expect(els.length).toBe(1)
    expect(els[0].parentElement).toBe(document.head)
    expect(els[0].textContent).toBe(
      ".color-red{color:red;}.font-size-12px{font-size:12px;}.color-orange{color:orange;}"
    )
    document.head.removeChild(els[0])
  })
})

describe("scss", () => {
  const test = (rule: string, content: string) => {
    return new RegExp(`^\.[^{]+\{${rule}\}$`).test(content)
  }

  it("className", () => {
    expect(scss({ color: "red" }).className).toEqual([
      `${resolvePrefix()}${hash(`color:red;`)}`
    ])
  })

  it("style content", () => {
    const [s1, s2] = scss({
      color: "red",
      fontSize: "12px",
      ".title": {
        fontSize: "14px"
      }
    }).toStyleString()

    expect(test("color:red;font-size:12px;", s1)).toBeTruthy()
    expect(test("font-size:14px;", s2)).toBeTruthy()
  })

  it("insert", async () => {
    createCache()
    scss({ color: "red" }).insert()

    await Promise.resolve(1)

    const el = query(`[${resolveCache().id}]`)!
    expect(el.parentElement).toBe(document.head)
    expect(test("color:red;", el.textContent!)).toBeTruthy()
    document.head.removeChild(el)
  })

  it("nest scss", () => {
    const css1 = scss({ background: "red" })
    const css2 = scss({
      [css1.className]: {
        color: "pink"
      },
      color: "orange"
    })

    const [s1, s2] = css2.toStyleString()

    expect(test("color:orange;", s1)).toBeTruthy()
    expect(test("color:pink;", s2)).toBeTruthy()
  })

  it("multiple-content", () => {
    const css1 = scss({ background: "red", ".title": { color: "red" } })
    const css2 = scss({ fontWeight: "bold" })
    const css3 = scss(css1, { fontSize: "12px" }, css2)
    const [s1, s2] = css3.toStyleString()

    expect(
      test("background:red;font-size:12px;font-weight:bold;", s1)
    ).toBeTruthy()
    expect(test("color:red;", s2)).toBeTruthy()
  })

  it("multiple-insert", async () => {
    const css1 = scss({ background: "red", ".title": { color: "red" } })
    const css2 = scss({ fontWeight: "bold" })
    scss(css1, { fontSize: "12px" }, css2).insert()

    await Promise.resolve(1)

    const els = queryAll(`[${resolveCache().id}]`)!
    expect(els.length).toBe(2)

    expect(
      test(
        "background:red;font-size:12px;font-weight:bold;",
        els[0].textContent!
      )
    ).toBeTruthy()
    document.head.removeChild(els[0])

    expect(test("color:red;", els[1].textContent!)).toBeTruthy()
    document.head.removeChild(els[1])
  })
})
