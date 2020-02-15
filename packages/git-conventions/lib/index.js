#!/usr/bin/env node

import dedent from "dedent-js"
import shell from "shelljs"
import yargs from "yargs"
import commit, { breaking, footer } from "./commit"

yargs.command(
  "commit",
  "Wraps `git commit` by generating a commit message from a few standard prompts based off of https://github.com/angular/angular.js/blob/master/DEVELOPERS.md#-git-commit-guidelines",
  function() {
    console.log("Example:\n")
    console.log(
      commit({
        type: "feat",
        description: "improve stuff",
        body: "you would not believe it\ncause that's what we do",
        footer: `${breaking("everything, like all of it")}\n${footer({
          "Reviewed-by": "talon",
          affects: "packages/git-conventions"
        })}`
      })
    )
  }
).argv
