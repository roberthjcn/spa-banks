import type { Config } from 'jest';

const config: Config = {
    preset: 'jest-preset-angular',
    setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
    testEnvironment: 'jsdom',
    transform: {
        '^.+\\.(ts|js|mjs|html|svg)$': [
            'jest-preset-angular',
            {
                tsconfig: '<rootDir>/tsconfig.spec.json',
                stringifyContentPathRegex: '\\.(html|svg)$',
                isolatedModules: true,
                useESM: true,  
            },
        ],
    },
    moduleFileExtensions: ['ts', 'html', 'js', 'json', 'mjs'],
    testMatch: ['**/+(*.)+(spec).+(ts)'],
    moduleNameMapper: {
        '^(\\.{1,2}/.*\\.js)$': '$1',
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
        '\\.html$': '<rootDir>/__mocks__/htmlMock.js'
    },
    transformIgnorePatterns: [
        'node_modules/(?!.*\\.mjs$|@angular|rxjs|zone.js)'
    ],
    testPathIgnorePatterns: [
        '<rootDir>/node_modules/',
        '<rootDir>/src/validators/' 
    ],
    coveragePathIgnorePatterns: [
        '<rootDir>/src/validators/' 
    ],
    resolver: 'jest-preset-angular/build/resolvers/ng-jest-resolver.js',
};

export default config;