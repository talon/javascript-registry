import dedent from "dedent-js"

/**
 * ```js
 * import commit from "./lib/commit"
 *
 * describe("git-conventions commit", () => {
 *   it("formats commits conventionally", () => {
 *     expect(commit({
 *       type: "feat",
 *       description: "improve stuff",
 *     })).toBe("feat: improve stuff")
 *   })
 *
 *   it("handles optional scopes", () => {
 *     expect(commit({
 *       type: "feat",
 *       scope: "sip",
 *       description: "improve stuff",
 *     })).toBe("feat(sip): improve stuff")
 *   })
 *
 *   it("handles optional body", () => {
 *     expect(commit({
 *       type: "feat",
 *       description: "improve stuff",
 *       body: "you would not believe it",
 *     })).toBe("feat: improve stuff\n\nyou would not believe it")
 *   })
 *
 *   it("handles optional footer", () => {
 *     expect(commit({
 *       type: "feat",
 *       description: "improve stuff",
 *       body: "you would not believe it",
 *       footer: "BREAKING CHANGE: all of it",
 *     })).toBe("feat: improve stuff\n\nyou would not believe it\n\nBREAKING CHANGE: all of it")
 *   })
 * })
 * ```
 *
 * @param {object} options - the commit options
 * @param {string} options.type - the commit type
 * @param {string} [options.scope] - the scope of the commit
 * @param {string} options.description - a terse desription of the commit
 * @param {string} [options.body] - a detailed explanation of the commit
 * @param {string} [options.footer] - follow a convention similar to git trailer format
 * @returns {string} a conventional commit
 */
export default function({ type, scope, description, body, footer }) {
  let commit = scope
    ? `${type}(${scope}): ${description}`
    : `${type}: ${description}`

  if (body) {
    commit = `${commit}\n\n${body}`
  }

  if (footer) {
    commit = `${commit}\n\n${footer}`
  }

  return commit
}
