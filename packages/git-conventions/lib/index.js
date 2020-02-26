#!/usr/bin/env node

import yargs from "yargs"
import commit, { breaking } from "./commit"
import bump from "./version"
import { affects } from "./monorepo"
import shell from "shelljs"

yargs
  .option("sources", {
    type: "string",
    description: "The sources to operate on in a monorepo"
  })
  .command(
    "commit",
    "Wraps `git commit` to assist in formatting a conventional commit",
    () => {},
    async function({ sources }) {
      const affected = sources ? affects(sources) : null
      try {
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
            footers: [affected, breaking]
          })}"`
        )
      } catch (e) {
        console.error(e.message)
      }
    }
  )
  .command(
    "bump",
    "Tag HEAD with a semantic version",
    () => {},
    async function() {
      for (let tag of await bump(sources)) {
        shell.exec(`git tag '${tag}'`)
      }
    }
  ).argv
