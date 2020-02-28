#!/usr/bin/env node

import yargs from "yargs"
import shell from "shelljs"
import inquirer from "inquirer"

import * as convention from "./convention"
import commit from "./commit"
import version from "./version"

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
      try {
        // TODO: allow editing before commiting
        shell.exec(
          `git commit -m "${await commit({
            types: convention.types,
            footers: convention.footers(sources)
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
    async function({ sources }) {
      const choices = await version(sources, convention.name)
      const tags = await inquirer
        .prompt({
          type: sources ? "checkbox" : "confirm",
          name: "plan",
          message: sources
            ? "Identify what sources to version bump: "
            : `Tag HEAD as ${choices[0].value}? `,
          // "confirm" ignores choices so it's okay to leave this here for now
          choices
        })
        .then(({ plan }) => {
          if (plan instanceof Array) {
            if (plan.length === 0)
              throw new Error("Aborting. No sources have been tagged.")
            return plan
          } else {
            if (plan) {
              return [choices[0].value]
            } else {
              throw new Error("Aborting. HEAD has not been tagged.")
            }
          }
        })

      for (let tag of tags) {
        console.log(`git tag '${tag}'`)
        shell.exec(`git tag '${tag}'`)
      }
    }
  ).argv
