#!/usr/bin/env node

import yargs from "yargs"
import commit from "./commit"
import { affects } from "./monorepo"
import inquirer from "inquirer"
import shell from "shelljs"

yargs
  .command(
    "commit",
    "Wraps `git commit` to assist in formatting a conventional commit",
    async function() {
      try {
        const message = await commit({
          footers: [
            affects("packages"),
            function breaking() {
              return inquirer
                .prompt({
                  type: "input",
                  name: "BREAKING CHANGES",
                  message: "Identify any BREAKING CHANGES: "
                })
                .then(answers =>
                  answers["BREAKING CHANGES"] !== "" ? answers : {}
                )
            }
          ]
        })
        // TODO: actually apply the commit
        shell.exec(`git commit -m "${message}"`)
      } catch (e) {
        console.error(e)
      }
    }
  )
  // TODO: generate semantic version and tag the repo
  .command("version", "Tag HEAD with a semantic version", async function() {
    console.log("yo")
  }).argv
