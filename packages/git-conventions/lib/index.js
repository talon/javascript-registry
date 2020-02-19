#!/usr/bin/env node

import yargs from "yargs"
import commit, { breaking } from "./commit"
import { affects } from "./monorepo"
import shell from "shelljs"

// TODO: generate semantic version and tag the repo
// .command("version", "Tag HEAD with a semantic version", async function() {})
yargs.command(
  "commit",
  "Wraps `git commit` to assist in formatting a conventional commit",
  async function() {
    try {
      // TODO: This should be configurable from the CLI
      const message = await commit({
        types: ["feat", "fix", "chore", "test", "WIP"],
        footers: [affects("packages"), breaking]
      })

      shell.exec(`git commit -m "${message}"`)
    } catch (e) {
      console.error(e.message)
    }
  }
).argv
