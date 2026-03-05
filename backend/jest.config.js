export default {
    transform: {
        '^.+\\.(t|j)sx?$': 'babel-jest',
    },
    testEnvironment: 'node',
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
        '^@todo-app/shared$': '<rootDir>/../node_modules/@todo-app/shared',
    },
    transformIgnorePatterns: ['node_modules/(?!@todo-app/shared)'],
};
