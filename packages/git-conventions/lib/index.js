#!/usr/bin/env node

import dedent from "dedent-js"
import shell from "shelljs"
import yargs from "yargs"
import path from "path"

/**
 * ```js
 * describe.skip("git-conventions", () => {
 *   it("commits", () => expect(true).toBeTruthy())
 *   it("releases", () => expect(true).toBeTruthy())
 * })
 * ```
 */
yargs
  .command(
    "commit",
    "Wraps `git commit` by generating a commit message from a few standard prompts based off of https://github.com/angular/angular.js/blob/master/DEVELOPERS.md#-git-commit-guidelines",
    function commit() {
      const changedFiles = shell
        .exec("git diff --cached --name-only", { silent: true })
        .stdout.split("\n")

      console.log(changedFiles)

      // return dedent`${type}(${scope}): ${subject}

      // ${body}

      // ${footer}
      // `
    }
  )
  .command(
    "release",
    "Generate a CHANGELOG for each source folder and semantically versions the repository by tagging it",
    function release() {
      console.log("release")
    }
  ).argv
