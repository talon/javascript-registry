//@flow
const MarkdownIt = require("markdown-it")
const fs = require("fs")
const { resolve } = require("path")

/**
 * Convert a markdown string with JS code blocks into executable code.
 *
 * ```js
 * import lit from "./lib"
 * import { readFileSync } from "fs"
 * import { resolve } from "path"
 *
 * test("examples/simple", () => {
 *   expect(
 *     lit(readFileSync(resolve(__dirname, "./examples/simple/literate.md"), "utf8"))
 *   ).toBe(readFileSync(resolve(__dirname, "./examples/simple/illiterate.js"), "utf8"))
 * })
 * ```
 * @name lit
 */
module.exports = function lit(markdown /*: string */) {
  return (
    MarkdownIt()
      .parse(markdown, {})
      .map(token => {
        if (token.type === "fence")
          return token.info.match(/js$/) ? token.content + "\n" : comment(token)

        if (token.nesting === 1 && token.level === 0)
          return `/**\n * ${
            token.markup.length !== 0 ? token.markup + " " : ""
          }`

        if (token.type.match(/inline/) && token.level > 0)
          return `${token.content}\n`

        if (token.nesting === -1 && token.level === 0) return ` */\n`

        return ""
      })
      .join("")
      .replace(/^\s+\*\/\n\/\*\*\n/gm, " *\n")
      .trim() + "\n"
  )
}

function comment(token) {
  return `/**
 * ${token.markup}${token.info}
 * ${token.content.split("\n").join("\n *")} ${token.markup}
 */
`
}
