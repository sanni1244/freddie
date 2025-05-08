export default {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    moduleNameMapper: {
      '^@/(.*)$': '<rootDir>/$1', 
    },
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    "compilerOptions": {
    "types": ["jest", "@testing-library/jest-dom"]
  }
  };
  
  