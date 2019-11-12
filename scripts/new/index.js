import fs from "fs";
import assert from "assert";
import prompts from "prompts";
import child_process from "child_process";
import { promisify } from "util";
import { resolve } from "path";
import files from "./files";

const [mkdir, writeFile, spawn] = [
  fs.mkdir,
  fs.writeFile,
  child_process.spawn
].map(promisify);

const DEV_DEPENDENCIES = [
  "@babel/core",
  "@babel/preset-env",
  "documentation",
  "prettier",
  "nodemon"
];

console.log("🥚 Oh! A package.");
prompts([
  {
    type: "text",
    name: "name",
    message: "🥚 what do you call it?"
  },
  {
    type: "text",
    name: "description",
    message: "🥚 what does it do?"
  }
])
  .then(async ({ name, description }) => {
    assert(name && name !== "", "name not provided");
    assert(description && description !== "", "description not provided");

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
    await spawn("npm", ["install", "--save-dev", ...DEV_DEPENDENCIES], {
      cwd: pgk,
      stdio: ["inherit", "inherit", "inherit"]
    });
  })
  .then(({ name, pkg }) =>
    console.log(`🐣 @talon/${name} (${pkg}) was created`)
  )
  .catch(e => {
    if (e.code === "EEXIST") return console.log("that package already exists!");
    console.log(e);
  });
