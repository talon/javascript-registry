module.exports = ({
  "moduleFileExtensions": [
    "md",
    "js",
    "ts",
    "jsx",
    "tsx"
  ],
  "testPathIgnorePatterns": [
    "/node_modules/",
    "/dist/",
  ],
  "transform": {
    "^.+\\.([jt]sx?|md)$": "./lib/babel-jest-upward.js"
  }
})