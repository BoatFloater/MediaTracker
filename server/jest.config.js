/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/__utils__/', '/__setup__/', 'build'],
  modulePathIgnorePatterns: ['build'],
  transformIgnorePatterns: ['/node_modules/(?!(chalk|nanoid)/)'],
  transform: {
    '^.+\\.[t|j]sx?$': 'babel-jest',
  },
  collectCoverageFrom: [
    'src/**/*.{js,ts}',
    '!src/**/*.d.ts',
    '!src/i18n/locales',
  ],
  reporters: ['default', 'jest-junit'],
  testLocationInResults: true,
  testTimeout: 30000,
};
