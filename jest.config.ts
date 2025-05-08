export default {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    moduleNameMapper: {
      '^@/(.*)$': '<rootDir>/$1', 
    },
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
        "compilerOptions": {
          "baseUrl": "./src", // Ensure the baseUrl is set to the 'src' folder
          "paths": {
            "@/*": ["*"]
          }
      }
  };
  
  
  