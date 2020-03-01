import shell from "shelljs"
import inquirer from "inquirer"
import * as version from "./version"

/**
 * Finds sources affected by a commit and prompts if they should be included
 * as `affects: [source]` in the footer
 *
 * @private
 * @param {string} sources the directory where independently versioned sources exist
 * @returns {Function} used to create the footer in `commit`
 */
export function affects(sources) {
  return async function() {
    const staged = shell
      .exec("git diff --cached --name-only", { silent: true })
      .stdout.split("\n")

    const all = shell.ls(sources)
    const affected = new Set(
      staged
        .filter(path => path.match(new RegExp(`${sources}\/*`)))
        .map(path => path.replace(new RegExp(`${sources}\/`), "").split("/")[0])
    )

    return await inquirer
      .prompt({
        type: "checkbox",
        name: "affects",
        message: "Identify what sources this commit affects: ",
        choices: all.map(pkg => {
          return {
            name: pkg,
            value: pkg,
            checked: affected.has(pkg)
          }
        })
      })
      .then(({ affects }) => ({
        affects: affects.join(", ")
      }))
  }
}

// TODO only tag changed sources
export function tag(sources, convention) {
  return inquirer
    .prompt({
      type: "checkbox",
      name: "tags",
      message: "Identify what sources to version bump: ",
      choices: async function() {
        return await Promise.all(
          shell.ls(sources).map(async function(source) {
            const current = await version.current(source)
            const bump = await version.next({ current, convention, source })
            return {
              value: `${bump.source}@${bump.next}`,
              // checked: next.type === "patch",
              name: version.highlight(bump)
            }
          })
        )
      }
    })
    .then(({ tags }) => {
      if (tags instanceof Array) {
        if (tags.length === 0)
          throw new Error("Aborting. No sources have been tagged.")
        return tags
      }
    })
}
