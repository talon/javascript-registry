#!/usr/bin/env node

import yargs from "yargs"
import shell from "shelljs"

import commit from "./commit"
import * as convention from "./convention"
import * as version from "./version"
// import * as monorepo from "./monorepo"

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
    "tag",
    "Tag HEAD with a semantic version",
    () => {},
    async function({ sources }) {
      try {
        shell.exec(`git tag '${await version.tag(convention.name)}'`)
      } catch (e) {
        console.error(e.message)
      }
    }
  ).argv
