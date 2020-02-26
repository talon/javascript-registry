import recommend from "conventional-recommended-bump"
import versions from "git-semver-tags"
import shell from "shelljs"
import inquirer from "inquirer"
import chalk from "chalk"

/**
 * Get the version tags to be applied to the repo
 *
 * @param {string} sources what sources to operate on in a monorepo
 * @returns {Promise<string[]>} the tag(s) to apply to the repo
 */
export default async function version(sources) {
  // TODO make `sources` optional
  // TODO only tag changed sources
  // TODO flag to accept all tags
  return inquirer
    .prompt({
      type: "checkbox",
      name: "plan",
      message: "Identify what sources to version bump: ",
      choices: await Promise.all(
        shell.ls(sources).map(async function(source) {
          let version = await current(source)
          let next = await bump(source, version)

          return {
            value: `${source}@${next.version}`,
            // checked: next.type === "patch",
            name: `${chalk.bold(source)}@${chalk.dim(
              version + " ->"
            )} ${highlight(next.version, next.type)}`
          }
        })
      )
    })
    .then(({ plan }) => plan)
}
/**
 * Get the current version of a source
 *
 * @param {string} source the source to grab the version from
 * @returns {Promise<string>} the most recent version of the source
 */
export function current(source) {
  return new Promise((resolve, reject) => {
    // this is just "lerna-style" (pacakge@version), not lerna dependent.
    versions({ lernaTags: true, package: source }, (error, tags) => {
      if (error) return reject(error)
      if (tags.length === 0) return resolve("0.0.0")
      resolve(tags[0].replace(source + "@", ""))
    })
  })
}

/**
 * Get the next version of a source
 *
 * @param {string} source the source to operate on
 * @param {string} version the current version to bump
 * @returns {Promise<object>} the next recommended release type, version and reason
 */
export function bump(source, version) {
  let [major, minor, patch] = version.split(".").map(i => parseInt(i))
  return new Promise((resolve, reject) => {
    recommend(
      {
        preset: `angular`,
        tagPrefix: source + "@"
      },
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
          type: releaseType,
          version: `${major}.${minor}.${patch}`,
          reason
        })
      }
    )
  })
}

/**
 * prints out a user friendly string identifying the version change
 *
 * @param {string} v the version string to operate on
 * @param {string} type the type of release this is
 * @returns {string} user friendly string identifying the version change
 */
function highlight(v, type) {
  const [major, minor, patch] = v.split(".")
  switch (type) {
    case "major":
      return `${chalk.underline.bold(major)}.${minor}.${patch} 💥`
    case "minor":
      return `${major}.${chalk.underline.bold(minor)}.${patch} 📈`
    default:
      return `${major}.${minor}.${chalk.underline.bold(patch)} 🩹`
  }
}
