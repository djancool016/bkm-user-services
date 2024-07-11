const PasswordManager = require("../../utils/passwordManager")
const UnitTestFramework = require("../unit.test.framework")

const testObj = {
    encrypt: [
        {
            input: {password: 'root235689'},
            output: 'random string',
            description: 'Success encrypt should return hashed password'
        },{
            input: {password: ['Not a String']},
            output: {code: 'ER_INVALID_PASSWORD_FORMAT'},
            description: 'Failed encrypt should throw error for not string'
        },{
            input: {password: undefined},
            output: {code: 'ER_EMPTY_PASSWORD'},
            description: 'Failed encrypt should throw error for empty password'
        },{
            input: {password: 'short'},
            output: {code: 'ER_PASSWORD_TOO_SHORT'},
            description: 'Failed encrypt should throw error for short password'
        },{
            input: {password: 'weakpassword'},
            output: {code: 'ER_PASSWORD_TOO_WEAK'},
            description: 'Failed encrypt should throw error for weak password'
        }
    ],
    compare: [
        {
            input: {
                password: 'root', 
                hashedPassword: '$2b$10$h6Uo0u07tzgVf14jTsIPHOskqDUdDwLsZeMFCxX5rm8BsEJTePZd.'
            },
            output: true,
            description: 'Success compare should return true'
        },{
            input: {
                password: 'InvalidPassword', 
                hashedPassword: '$2b$10$h6Uo0u07tzgVf14jTsIPHOskqDUdDwLsZeMFCxX5rm8BsEJTePZd.'
            },
            output: {code: 'ER_INVALID_PASSWORD'},
            description: 'Failed compare should throw error for invalid password'
        },{
            input: {
                password: 1234, 
                hashedPassword: '1234'
            },
            output: {code: 'ER_INVALID_PASSWORD_FORMAT'},
            description: 'Failed compare should throw error for invalid password format'
        },{
            input: {
                password: 'root', 
                hashedPassword: 'invalidhashedpassword'
            },
            output: {code: 'ER_INVALID_PASSWORD'},
            description: 'Failed compare should throw error for invalid hashed password'
        },{
            input: {
                password: undefined, 
                hashedPassword: '$2b$10$h6Uo0u07tzgVf14jTsIPHOskqDUdDwLsZeMFCxX5rm8BsEJTePZd.'
            },
            output: {code: 'ER_EMPTY_PASSWORD'},
            description: 'Failed compare should throw error for empty password'
        }
    ]
}

const testModule = PasswordManager
const test = new UnitTestFramework(testObj, testModule)

test.runTest()