import recommend from "conventional-recommended-bump"
import versions from "git-semver-tags"
import shell from "shelljs"
import chalk from "chalk"

/**
 * Apply [Semantically Versioned](https://semver.org) tags derived from the Conventional Commit history
 *
 * ```sh
 * git-conventions bump
 * git-conventions bump --sources packages # for monorepos
 * ```
 * > The version is calculated by [conventional-recommended-bump](https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-recommended-bump) using the Angular preset
 *
 * @param {string} [sources] what sources to operate on in a monorepo
 * @returns {Promise<object[]>} the tag(s) to apply to the repo
 */
export default function version(sources, convention) {
  // TODO only tag changed sources
  // TODO flag to accept all tags
  if (!sources) {
    return new Promise((resolve, reject) => {
      resolve([
        {
          value: "0.0.1",
          name: highlight({
            current: "0.0.0",
            next: "0.0.1",
            type: "minor"
          })
        }
      ])
    })
  } else {
    return Promise.all(
      shell.ls(sources).map(async function(source) {
        const current = await new Promise((resolve, reject) => {
          // this is just "lerna-style" (pacakge@version), not lerna dependent.
          // TODO: support private registries here with prefix ("@talon/") + source
          versions({ lernaTags: true, package: source }, (error, tags) => {
            if (error) return reject(error)
            if (tags.length === 0) return resolve("0.0.0")
            resolve(tags[0].replace(source + "@", ""))
          })
        })

        return await bump(source, current, convention).then(bump => {
          return {
            value: `${bump.source}@${bump.next}`,
            // checked: next.type === "patch",
            name: highlight(bump)
          }
        })
      })
    )
  }
}

export async function bump(source, current, convention) {
  return await new Promise((resolve, reject) => {
    let [major, minor, patch] = current.split(".").map(i => parseInt(i))
    recommend(
      {
        preset: convention,
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
  const prefix = `${chalk.bold(bump.source)}@${chalk.dim(
    bump.current + " -> "
  )}`

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
