import shell from "shelljs"
import { Subject } from "rxjs"
import inquirer from "inquirer"

/**
 * Create a conventionally formatted commit
 *
 * @param {object} options Extend the base convention
 * @param {string} [options.sources] the directory where you keep your sources in a monorepo
 * @param {string[]} [options.types] the available commit types
 * @returns {Promise<string>} a conventionally formatted commit message
 */
export default function(options) {
  const { sources, types } = Object.assign({}, options, {
    types: ["feat", "fix", "chore", "test", "WIP"]
  })

  const staged = shell
    .exec("git diff --cached --name-only", { silent: true })
    .stdout.split("\n")

  if (staged[0] === "")
    return Promise.reject(
      new Error("No changes found.\nUse `git add` to stage your changes!")
    )

  const prompts = new Subject()
  const message = inquirer.prompt(prompts).then(answers => format(answers))

  prompts.next({
    type: "list",
    name: "type",
    message: "What type of change is this? ",
    default: "WIP",
    choices: types
  })

  prompts.next({
    type: "input",
    name: "description",
    message: "Briefly describe this change: "
  })

  prompts.next({
    type: "input",
    name: "scope",
    message: "Provide the scope of this change (optional): "
  })

  prompts.next({
    type: "input",
    name: "body",
    message: "Provide any additional details (optional): "
  })

  // if this is a monorepo (i.e. has `sources`)
  // packages identifed as affected are confirmed by the user using the prompt
  // and added to the commit footer as `affects: [dir(s)]`
  if (sources) {
    const all = shell.ls(sources)
    const affected = new Set(
      staged
        .filter(path => path.match(new RegExp(`${sources}\/*`)))
        .map(path => path.replace(new RegExp(`${sources}\/`), "").split("/")[0])
    )

    prompts.next({
      type: "checkbox",
      name: "affects",
      message: "Identify what sources this commit affects: ",
      choices: all.map(pkg => {
        return { name: pkg, value: pkg, checked: affected.has(pkg) }
      })
    })
  }

  // TODO
  //   - build footer key values with prompt loop
  //   - with an option to require keys
  //   - BREAKING CHANGES
  prompts.complete()
  return message
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
 *   it("handles optional body", () => {
 *     expect(format({
 *       type: "feat",
 *       description: "improve stuff",
 *       body: "you would not believe it\ncause that's what we do"
 *     })).toBe(`feat: improve stuff\n\nyou would not believe it\ncause that's what we do`)
 *   })
 * ```
 *
 * One or more footers MAY be provided one blank line after the body.
 * ```js
 *   it("handles optional footer", () => {
 *     expect(format({
 *       type: "feat",
 *       description: "improve stuff",
 *       footer: {
 *         "Reviewed-by": "talon",
 *         "affects": "git-conventions"
 *       }
 *     })).toBe(`feat: improve stuff\n\nReviewed-by: talon\naffects: git-conventions`)
 *   })
 * })
 * ```
 *
 * @param {object} options the commit options
 * @param {string} options.type the commit type
 * @param {string} [options.scope] the scope of the commit
 * @param {string} options.description a terse desription of the commit
 * @param {string} [options.body] a detailed explanation of the commit
 * @param {object} [options.footer] follow a convention similar to git trailer format
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
    commit = `${commit}\n\n${Object.keys(footer)
      .map(key => `${key}: ${footer[key]}`)
      .join("\n")}`
  }

  return commit
}
