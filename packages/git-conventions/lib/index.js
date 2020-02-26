#!/usr/bin/env node

import yargs from "yargs"
import commit, { breaking } from "./commit"
import { affects } from "./monorepo"
import { bump, current } from "./version"
import shell from "shelljs"
import dedent from "dedent"
import inquirer from "inquirer"
import chalk from "chalk"

// TODO make `sources` configurable from the CLI
// TODO act like a regular repo if `sources` is not provided
const sources = "packages"

// TODO use meow? https://github.com/sindresorhus/meow
yargs
  .command(
    "commit",
    "Wraps `git commit` to assist in formatting a conventional commit",
    async function() {
      try {
        shell.exec(
          `git commit -m "${await commit({
            // TODO settle on a standard here between these and the version.bump preset
            types: ["feat", "fix", "chore", "test", "WIP"],
            footers: [affects(sources), breaking]
          })}"`
        )
      } catch (e) {
        console.error(e.message)
      }
    }
  )
  .command("bump", "Tag HEAD with a semantic version", async function() {
    inquirer
      .prompt({
        type: "checkbox",
        name: "plan",
        message: "Identify what sources to version bump: ",
        choices: await Promise.all(
          shell
            .ls(sources)
            // FIXME remove this
            .map(name => `@talon/${name}`)
            .map(async function(source) {
              let version = await current(source)
              let next = await bump(source, version)

              const highlight = (v, type) => {
                const [major, minor, patch] = v.split(".")
                switch (type) {
                  case "major":
                    return `${chalk.underline.bold(major)}.${minor}.${patch}`
                  case "minor":
                    return `${major}.${chalk.underline.bold(minor)}.${patch}`
                  default:
                    return `${major}.${minor}.${chalk.underline.bold(patch)}`
                }
              }

              return {
                value: `${source}@${next.version}`,
                checked: next.type === "patch",
                name: dedent`
              ${type(next.type)} ${chalk.bold(
                  // FIXME remove this
                  source.replace("@talon/", "")
                )}: ${chalk.dim(version + " ->")} ${highlight(
                  next.version,
                  next.type
                )}
                    ${chalk.dim(next.reason)}
            `
              }
            })
        )
      })
      .then(({ plan }) => {
        console.log(plan.join("\n"))
        // TODO tag the repo shell.exec(`git tag ${source}@${version}"`)
        // TODO GPG signing support
      })
  }).argv

/**
 * @private
 */
function type(t) {
  switch (t) {
    case "major":
      return "📢 "
    case "minor":
      return "📈 "
    default:
      return "🩹 "
  }
}
