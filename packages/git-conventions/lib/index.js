#!/usr/bin/env node

import yargs from "yargs"
import commit, { breaking } from "./commit"
import version from "./version"
import { affects } from "./monorepo"
import shell from "shelljs"

yargs
  .command(
    "commit",
    "Wraps `git commit` to assist in formatting a conventional commit",
    async function() {
      try {
        // TODO make this configurable from the CLI
        shell.exec(
          `git commit -m "${await commit({
            types: ["feat", "fix", "chore", "test", "WIP"],
            footers: [affects("packages"), breaking]
          })}"`
        )
      } catch (e) {
        console.error(e.message)
      }
    }
  )
  .command("version", "Tag HEAD with a semantic version", async function() {
    try {
      shell.exec(`git tag "${await version()}"`)
    } catch (e) {
      console.error(e.message)
    }
  }).argv
