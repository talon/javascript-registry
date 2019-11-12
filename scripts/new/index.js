import fs from "fs";
import prompts from "prompts";
import child_process from "child_process";
import { promisify } from "util";
import { resolve } from "path";
import files from "./files";

(async (mkdir, writeFile, spawn) => {
  const DEV_DEPENDENCIES = [
    "@babel/core",
    "@babel/preset-env",
    "documentation",
    "prettier",
    "nodemon"
  ];

  const { name, description } = await prompts([
    {
      type: "text",
      name: "name",
      message: "what do you call it?"
    },
    {
      type: "text",
      name: "description",
      message: "what does it do?"
    }
  ]);
  const pgk = resolve(`./packages/${name}`);

  await mkdir(pgk);
  await mkdir(resolve(pgk, "lib"));
  await Promise.all(
    Object.keys(files).map(file =>
      writeFile(
        resolve(`${pgk}/${file}`),
        files[file]({ name, description }),
        "utf8"
      )
    )
  );

  const child = {
    cwd: pgk,
    stdio: ["inherit", "inherit", "inherit"]
  };
  await spawn("npm", ["install", "--save-dev", ...DEV_DEPENDENCIES], child);
})(...[fs.mkdir, fs.writeFile, child_process.spawn].map(promisify));
