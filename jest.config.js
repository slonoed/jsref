const {defaults: tsjPreset} = require('ts-jest/presets')

module.exports = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/**/*.spec.ts'],
  transform: {
    ...tsjPreset.transform,
    '\\.js$': 'babel-jest',
    '\\.txt$': 'jest-raw-loader',
  },
}
