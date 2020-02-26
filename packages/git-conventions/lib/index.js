#!/usr/bin/env node

import yargs from "yargs"
import commit, { breaking } from "./commit"
import bump from "./version"
import { affects } from "./monorepo"
import shell from "shelljs"

// TODO make `sources` configurable from the CLI
const sources = "packages"

// TODO use meow? https://github.com/sindresorhus/meow
yargs
  .command(
    "commit",
    "Wraps `git commit` to assist in formatting a conventional commit",
    async function() {
      try {
        // TODO make `sources` optional
        shell.exec(
          `git commit -m "${await commit({
            // strictly follows the Angular Convention https://github.com/angular/angular.js/blob/master/DEVELOPERS.md#type
            // because that's the preset used in `version.next`
            types: [
              "feat",
              "fix",
              "docs",
              "style",
              "refactor",
              "perf",
              "test",
              "chore"
            ],
            footers: [affects(sources), breaking]
          })}"`
        )
      } catch (e) {
        console.error(e.message)
      }
    }
  )
  .command("bump", "Tag HEAD with a semantic version", async function() {
    // TODO GPG signing support
    for (let tag of await bump(sources)) {
      shell.exec(`git tag '${tag}'`)
    }
  }).argv
