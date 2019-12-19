import { src, dest, series, watch } from "gulp"
import babel from "gulp-babel"
import prettier from "gulp-prettier"
import documentation from "gulp-documentation"
import modify from "gulp-modify-file"
import jest from "gulp-jest"
import meta from "./package.json"

const PACKAGE = "./"
const ALL_FILES = ["**", "!node_modules/**"]
const LIBRARY_FILES = `lib/**`
const DISTRIBUTION_FOLDER = "dist"

export const docs = () =>
  src(LIBRARY_FILES)
    .pipe(documentation("md", { filename: "README.md" }, { markdownToc: true }))
    .pipe(modify(content => `# ${meta.name}\n>${meta.description}\n${content}`))
    .pipe(prettier())
    .pipe(dest("./"), { overwrite: true })

export const format = () =>
  src(ALL_FILES)
    .pipe(prettier())
    .pipe(dest("./"))

export const test = series(docs, tests)

export const compile = () =>
  src(LIBRARY_FILES)
    .pipe(babel())
    .pipe(dest(DISTRIBUTION_FOLDER, { overwrite: true }))

export const develop = series(test, () => watch(LIBRARY_FILES, series(test)))
export const distribute = series(test, format, compile)

function tests() {
  process.env.NODE_ENV = "test"
  return src(PACKAGE).pipe(jest())
}
