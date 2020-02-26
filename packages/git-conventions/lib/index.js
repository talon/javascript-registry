#!/usr/bin/env node

import yargs from "yargs"
import commit, { breaking } from "./commit"
import { affects } from "./monorepo"
import shell from "shelljs"
import commits from "git-raw-commits"
import parser from "conventional-commits-parser"

// TODO use meow? https://github.com/sindresorhus/meow
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
    // TODO get commits https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/git-raw-commits
    // TODO parse commits https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-commits-parser
    // TODO recommended bump https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-recommended-bump
    // TODO GPG signing support
    // TODO release message
    // TODO tag the repo shell.exec(`git tag "${await version()}"`)
    commits({})
      // .pipe(parser())
      .pipe(process.stdout)
  }).argv
