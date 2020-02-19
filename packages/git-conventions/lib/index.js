#!/usr/bin/env node

import yargs from "yargs"
import commit from "./commit"
import { affects } from "./monorepo"
import inquirer from "inquirer"

yargs
  .command(
    "commit",
    "Wraps `git commit` to assist in formatting a conventional commit",
    async function() {
      try {
        console.log(
          await commit({
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
        )
      } catch (e) {
        // TODO: Error UX, colors and stuff
        console.error(e)
      }
    }
  )
  // TODO
  .command("version", "Tag HEAD with a semantic version", async function() {
    console.log("yo")
  }).argv
