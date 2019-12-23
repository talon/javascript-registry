module.exports = ({
  "moduleFileExtensions": [
    "md",
    "js",
    "ts",
    "jsx",
    "tsx"
  ],
  "testRegex": [
    ".+\\.test\\.[jt]sx?$",
    "packages\/.+(README|API)\\.md$"
  ],
  "testPathIgnorePatterns": [
    "/node_modules/",
    "/api/"
  ],
  "transform": {
    "^.+\\.([jt]sx?|md)$": "./lib/babel-jest-upward.js"
  }
})