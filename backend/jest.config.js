export default {
    transform: {
      "^.+\\.[t|j]sx?$": "babel-jest"
    },
    moduleFileExtensions: ['js', 'json'],
    testEnvironment: 'node',
    transformIgnorePatterns: [
      "node_modules/(?!variables/.*)"
    ]
  };