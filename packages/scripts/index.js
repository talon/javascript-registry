import { src, dest, series, lastRun } from "gulp"
import babel from "gulp-babel"
import prettier from "gulp-prettier"
import typedoc from "gulp-typedoc"
import jest from "gulp-jest"
import del from "del"

const ALL_FILES = ["**", "!node_modules/**"]
const LIBRARY_FILES = `lib/**`
const DISTRIBUTION_FOLDER = "dist"

export const readme = series(
  generate_documentation,
  move_documentation_to_readme,
  remove_documentation_folder
)

export const test = series(readme, tests)

export const format = () =>
  src(ALL_FILES)
    .pipe(prettier())
    .pipe(dest("./"))

export const build = () =>
  src(LIBRARY_FILES)
    .pipe(babel())
    .pipe(dest(DISTRIBUTION_FOLDER, { overwrite: true }))

function generate_documentation() {
  return src(LIBRARY_FILES).pipe(
    typedoc({
      mode: "file",
      readme: "none",
      module: "commonjs",
      jsx: true,
      ignoreCompilerErrors: true,
      excludeExternals: true,
      excludeNotExported: true,
      // FIXME:
      // hideBreadcrumbs: true,
      plugins: ["typedoc-plugin-markdown"],
      out: "./docs"
    })
  )
}

function move_documentation_to_readme() {
  return src("./docs/README.md").pipe(dest("./"))
}

function remove_documentation_folder() {
  return del("./docs")
}

function tests() {
  process.env.NODE_ENV = "test"
  return src(["*.test.*", "*.md"]).pipe(jest())
}
