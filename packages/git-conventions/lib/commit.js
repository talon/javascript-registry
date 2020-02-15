/**
 * [The Conventional Commits specification](https://www.conventionalcommits.org/en/v1.0.0) is a lightweight convention on top of commit messages. It provides an easy set of rules for creating an explicit commit history; which makes it easier to write automated tools on top of. This convention dovetails with SemVer, by describing the features, fixes, and breaking changes made in commit messages.
 *
 * ```js
 * import commit from "./lib/commit"
 * describe("commit", () => {
 * ```
 *
 * Commits MUST be prefixed with a type, which consists of a noun, feat, fix, etc. followed by a [...] REQUIRED terminal colon and space.
 *
 * A description MUST immediately follow the colon and space after the type/scope prefix. The description is a short summary of the code changes
 * ```js
 *   it("formats commits conventionally", () => {
 *     expect(commit({
 *       type: "feat",
 *       description: "improve stuff",
 *     })).toBe("feat: improve stuff")
 *   })
 * ```
 *
 * A scope MAY be provided after a type. A scope MUST consist of a noun describing a section of the codebase surrounded by parenthesis
 * ```js
 *   it("handles optional scopes", () => {
 *     expect(commit({
 *       type: "feat",
 *       scope: "sip",
 *       description: "improve stuff",
 *     })).toBe("feat(sip): improve stuff")
 *   })
 *
 * ```
 *
 * A longer commit body MAY be provided after the short description, providing additional contextual information about the code changes
 *
 * A commit body is free-form and MAY consist of any number of newline separated paragraphs.
 * ```js
 *   const body = "you would not believe it\ncause that's what we do"
 *
 *   it("handles optional body", () => {
 *     expect(commit({
 *       type: "feat",
 *       description: "improve stuff",
 *       body
 *     })).toBe(`feat: improve stuff\n\n${body}`)
 *   })
 * ```
 *
 * One or more footers MAY be provided one blank line after the body.
 * ```js
 *   const footer = "Reviewed-by: talon\naffects: packages/git-conventions"
 *
 *   it("handles optional footer", () => {
 *     expect(commit({
 *       type: "feat",
 *       description: "improve stuff",
 *       body,
 *       footer
 *     })).toBe(`feat: improve stuff\n\n${body}\n\n${footer}`)
 *   })
 * })
 * ```
 *
 * @param {object} options the commit options
 * @param {string} options.type the commit type
 * @param {string} [options.scope] the scope of the commit
 * @param {string} options.description a terse desription of the commit
 * @param {string} [options.body] a detailed explanation of the commit
 * @param {string} [options.footer] follow a convention similar to git trailer format
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

/**
 * ```js
 * import {breaking} from "./lib/commit"
 * describe("breaking changes", () => {
 * ```
 *
 * a breaking change MUST consist of the uppercase text BREAKING CHANGE, followed by a colon, space, and description
 * ```js
 *   it("handles a breaking change", () => {
 *     expect(breaking("all of it, everything")).toBe("BREAKING CHANGE: all of it, everything")
 *   })
 *
 *   it("handles breaking changes", () => {
 *     expect(breaking(["all of it, everything", "it's been gutted"])).toBe("BREAKING CHANGE: all of it, everything\nBREAKING CHANGE: it's been gutted")
 *   })
 * })
 * ```
 *
 * @param {string|string[]} changes the breaking change(s)
 * @returns {string} a conventional commit footer
 */
export function breaking(changes) {
  if (!Array.isArray(changes)) changes = [changes]
  return changes.map(change => `BREAKING CHANGE: ${change}`).join("\n")
}

/**
 * ```js
 * import {footer} from "./lib/commit"
 * describe("footer", () => {
 * ```
 *
 * Each footer MUST consist of a word token, followed by either a :<space> or <space># separator, followed by a string value (this is inspired by the git trailer convention).
 *
 * A footer’s token MUST use - in place of whitespace characters, e.g., Acked-by (this helps differentiate the footer section from a multi-paragraph body). An exception is made for BREAKING CHANGE, which MAY also be used as a token.
 * ```js
 *   it("turns an object into a commit footer", () => {
 *     expect(footer({"Reviewed-by": "talon", "affects": "packages/git-conventions"})).toBe("Reviewed-by: talon\naffects: packages/git-conventions")
 *   })
 * })
 * ```
 *
 * @param {object} meta the footer keys and values
 * @returns {string} a conventional commit footer
 */
export function footer(meta) {
  return Object.keys(meta)
    .map(key => `${key}: ${meta[key]}`)
    .join("\n")
}
