import shell from "shelljs"

/**
 * Create a conventionally formatted commit
 *
 * @param {string} [sources] the directory where you keep your sources in a monorepo
 * @param {string[]} [types] the available commit types
 * @returns {Promise<string>} a conventionally formatted commit message
 */
export default function(
  sources,
  types = ["feat", "fix", "chore", "test", "WIP"]
) {
  const staged = shell
    .exec("git diff --cached --name-only", { silent: true })
    .stdout.split("\n")

  if (staged[0] === "")
    return Promise.reject(
      "You don't currently have any staged files\ntry `git add`"
    )

  return (
    this.prompt([
      {
        type: "list",
        name: "type",
        message: "What type of change is this? ",
        default: "WIP",
        choices: types
      },
      {
        type: "input",
        name: "description",
        message: "Briefly describe this change: "
      },
      {
        type: "input",
        name: "scope",
        message: "Provide the scope of this change (optional): "
      },
      {
        type: "input",
        name: "body",
        message: "Provide any additional details (optional): "
      }
    ])
      // Monorepo support
      .then(answers => {
        if (sources) {
          const affected = new Set(
            staged
              .filter(path => path.match(new RegExp(`${sources}\/*`)))
              .map(
                path =>
                  path.replace(new RegExp(`${sources}\/`), "").split("/")[0]
              )
          )
          const all = shell.ls(sources)

          return this.prompt({
            type: "checkbox",
            name: "affects",
            message: "Identify what sources this commit affects: ",
            choices: all.map(pkg => {
              return { name: pkg, value: pkg, checked: affected.has(pkg) }
            })
          }).then(({ affects }) => ({ affects, answers }))
        } else {
          return { answers, affects: false }
        }
      })
      // TODO
      //   - build footer key values with prompt loop
      //   - with an option to require keys
      .then(({ answers, affects }) =>
        format(
          Object.assign(
            answers,
            affects ? { footer: footer({ affects: affects.join(", ") }) } : {}
          )
        )
      )
      .then(message => this.log(`\n${message}\n`))
  )
}

/**
 * [The Conventional Commits specification](https://www.conventionalcommits.org/en/v1.0.0) is a lightweight convention on top of commit messages. It provides an easy set of rules for creating an explicit commit history; which makes it easier to write automated tools on top of. This convention dovetails with SemVer, by describing the features, fixes, and breaking changes made in commit messages.
 *
 * ```js
 * import {format} from "./lib/commit"
 * describe("format", () => {
 * ```
 *
 * Commits MUST be prefixed with a type, which consists of a noun, feat, fix, etc. followed by a [...] REQUIRED terminal colon and space.
 *
 * A description MUST immediately follow the colon and space after the type/scope prefix. The description is a short summary of the code changes
 * ```js
 *   it("formats commits conventionally", () => {
 *     expect(format({
 *       type: "feat",
 *       description: "improve stuff",
 *     })).toBe("feat: improve stuff")
 *   })
 * ```
 *
 * A scope MAY be provided after a type. A scope MUST consist of a noun describing a section of the codebase surrounded by parenthesis
 * ```js
 *   it("handles optional scopes", () => {
 *     expect(format({
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
 *     expect(format({
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
 *     expect(format({
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
export function format({ type, scope, description, body, footer }) {
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
