import shell from "shelljs"
import inquirer from "inquirer"
import versions from "git-semver-tags"

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
// TODO pull monorepo stuff into monorepo.js
// TODO get choices
export function tag(sources, convention) {
  // return Promise.all(
  //   shell.ls(sources).map(async function(source) {
  //     return await new Promise((resolve, reject) => {
  //       // this is just "lerna-style" (pacakge@version), not lerna dependent.
  //       // TODO: support private registries here with prefix ("@talon/") + source
  //       versions({ lernaTags: true, package: source }, (error, tags) => {
  //         if (error) return reject(error)
  //         if (tags.length === 0) return resolve("0.0.0")
  //         resolve(tags[0].replace(source + "@", ""))
  //       })
  //     })
  //     return await bump(source, current, convention).then(bump => {
  //       return {
  //         value: `${bump.source}@${bump.next}`,
  //         // checked: next.type === "patch",
  //         name: highlight(bump)
  //       }
  //     })
  //   })
  // )
  //
  // const tags = await inquirer
  //   .prompt({
  //     type: "checkbox",
  //     name: "plan",
  //     message: "Identify what sources to version bump: ",
  //     choices
  //   })
  //   .then(({ plan }) => {
  //     if (plan instanceof Array) {
  //       if (plan.length === 0)
  //         throw new Error("Aborting. No sources have been tagged.")
  //       return plan
  //     } else {
  //       if (plan) {
  //         return [choices[0].value]
  //       } else {
  //         throw new Error("Aborting. HEAD has not been tagged.")
  //       }
  //     }
  //   })
}
