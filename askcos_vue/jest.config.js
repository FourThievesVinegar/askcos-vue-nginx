module.exports = {
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  collectCoverageFrom: ["src/**/*.js", "!**/node_modules/**"],
  coverageReporters: ["html", "text", "text-summary", "cobertura"],
  testMatch: ["**/*.test.js"],
};
