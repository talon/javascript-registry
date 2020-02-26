import recommend from "conventional-recommended-bump"
import versions from "git-semver-tags"

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
        // TODO consider how this interacts with the types in `commit`
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
