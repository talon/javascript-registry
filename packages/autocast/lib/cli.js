#!/usr/bin/env node

import chalk from "chalk";
import script from "../dist";
import blessed from "blessed";

script(require("../settings.json")).then(lines => {
  lines.forEach(line => {
    console.log(line);
    console.log(chalk.bold(`${line.host}:`), line.response);
  });
});
