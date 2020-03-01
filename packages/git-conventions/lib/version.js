import recommend from "conventional-recommended-bump"
import chalk from "chalk"
import inquirer from "inquirer"
import versions from "git-semver-tags"

/**
 * Apply [Semantically Versioned](https://semver.org) tags derived from the Conventional Commit history
 *
 * ```sh
 * git-conventions tag
 * git-conventions tag --sources packages # for monorepos
 * ```
 * > The version is calculated by [conventional-recommended-bump](https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-recommended-bump) using the Angular preset
 *
 * @param {string} convention the name of the convention to use
 * @returns {Promise<string[]>} the tag(s) to apply to the repo
 */
export async function tag(convention) {
  const version = await current()
  const bump = await next({ current: version, convention })

  return inquirer
    .prompt({
      type: "confirm",
      name: "yes",
      message: `${highlight(bump)}? `
    })
    .then(({ yes }) => {
      if (yes) {
        return [bump.next]
      }
    })
}

/**
 * Get the current version
 *
 * @private
 * @param {string} [source] the source to grab the version from
 * @returns {Promise<string>} the most recent version of the source
 */
export function current(source) {
  // TODO only tag changed sources
  return new Promise((resolve, reject) => {
    versions(
      // this is just "lerna-style" (pacakge@version), not lerna dependent.
      Object.assign({}, source ? { lernaTags: true, package: source } : {}),
      (error, tags) => {
        if (error) return reject(error)
        if (tags.length === 0) return resolve("0.0.0")
        resolve(tags[0].replace(source + "@", ""))
      }
    )
  })
}

/**
 * Get the next version
 *
 * @param {object} options
 * @param {string} options.current the current version
 * @param {string} options.convention the name of the convention to use
 * @param {string} [options.source] the name of the source
 */
export async function next({ current, convention, source }) {
  return await new Promise((resolve, reject) => {
    let [major, minor, patch] = current.split(".").map(i => parseInt(i))
    recommend(
      Object.assign(
        {
          preset: convention
        },
        source ? { tagPrefix: source + "@" } : {}
      ),
      (error, { releaseType, reason }) => {
        if (error) return reject(error)

        switch (releaseType) {
          case "major":
            major++
            break
          case "minor":
            minor++
            break
          case "patch":
            patch++
            break
        }

        resolve({
          source,
          current,
          next: `${major}.${minor}.${patch}`,
          type: releaseType,
          reason
        })
      }
    )
  })
}

/**
 * prints out a user friendly string identifying the version change
 *
 * @private
 * @param {object} bump
 * @param {string} bump.current the current version string
 * @param {string} bump.next the next version string
 * @param {string} bump.type the type of release this is
 * @param {string} [bump.source] the source to operate on
 * @returns {string} user friendly string identifying the version change
 */
export function highlight(bump) {
  let prefix = `${chalk.dim(bump.current + " -> ")}`

  if (bump.source) {
    prefix = `${chalk.bold(bump.source)}@${prefix}`
  }

  const [major, minor, patch] = bump.next.split(".")
  switch (bump.type) {
    case "major":
      return prefix + `${chalk.underline.bold(major)}.${minor}.${patch} 💥`
    case "minor":
      return prefix + `${major}.${chalk.underline.bold(minor)}.${patch} 📈`
    default:
      return prefix + `${major}.${minor}.${chalk.underline.bold(patch)} 🩹`
  }
}
