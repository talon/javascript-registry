module.exports = ({
  "moduleFileExtensions": [
    "md",
    "js",
    "jsx",
  ],
  "testPathIgnorePatterns": [
    "/node_modules/",
    "/dist/",
  ],
  "transform": {
    "^.+\\.([jt]sx?|md)$": "./lib/babel-jest-upward.js"
  }
})