import { src, dest, series, lastRun } from "gulp"
import babel from "gulp-babel"
import prettier from "gulp-prettier"
import documentation from "gulp-documentation"
import jest from "gulp-jest"

const ALL_FILES = ["**", "!node_modules/**"]
const LIBRARY_FILES = `lib/**`
const DISTRIBUTION_FOLDER = "dist"

export const format = () =>
  src(ALL_FILES)
    .pipe(prettier())
    .pipe(dest("./"))

export const docs = () =>
  src(LIBRARY_FILES)
    .pipe(documentation("md"))
    .pipe(dest("./"), { overwrite: true })

export const test = () => {
  process.env.NODE_ENV = "test"
  return src(["*.test.*", "*.md"]).pipe(jest())
}

export const build = () =>
  src(LIBRARY_FILES)
    .pipe(babel())
    .pipe(dest(DISTRIBUTION_FOLDER, { overwrite: true }))
