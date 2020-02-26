#!/usr/bin/env node

import yargs from "yargs"
import commit, { breaking } from "./commit"
import { affects } from "./monorepo"
import { bump, current } from "./version"
import shell from "shelljs"

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
    const source = "@talon/lit"
    // TODO do this for every package
    const version = await current(source)
    const next = await bump(source, version)

    console.log(`${source}: ${version} -> ${next}`)
    // TODO tag the repo shell.exec(`git tag ${source}@${version}"`)
    // TODO release message
    // TODO GPG signing support
  }).argv
