#!/usr/bin/env node

import dedent from "dedent-js"
import shell from "shelljs"
import yargs from "yargs"
import commit from "./commit"

yargs.command(
  "commit",
  "Wraps `git commit` by generating a commit message from a few standard prompts based off of https://github.com/angular/angular.js/blob/master/DEVELOPERS.md#-git-commit-guidelines",
  function() {
    console.log(
      commit({
        type: "feat",
        scope: "sip",
        description: "improve stuff"
      })
    )
  }
).argv
