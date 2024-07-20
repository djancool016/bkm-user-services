const TokenManager = require("../../utils/tokenManager")
const UnitTestFramework = require("../unit.test.framework")

const activeToken = TokenManager.generateToken({id: 1, username: 'admin'}, 'SECRET_KEY')
const expiredToken = TokenManager.generateToken({id: 1, username: 'admin'}, 'SECRET_KEY', 0)

const testObj = {
    generateToken: [
        {
            input: [{id: 1, username: 'admin'},'SECRET_KEY'],
            output: 'random string',
            description: 'Success should returning string token'
        },{
            input: [{},'SECRET_KEY'],
            output: {code: 'ER_JWT_EMPTY_PAYLOAD'},
            description: 'Empty payload should throw error ER_JWT_EMPTY_PAYLOAD'
        },{
            input: [{id: 1, username: 'admin'},''],
            output: {code: 'ER_JWT_EMPTY_SIGNATURE'},
            description: 'Empty secret token should throw error ER_JWT_EMPTY_SIGNATURE'
        },{
            input: [{id: 1, username: 'admin'},'SECRET_KEY', -1],
            output: {code: 'ER_JWT_EXPIRED'},
            description: 'Negative expiration time should throw error ER_JWT_EXPIRED'
        }
    ],
    verifyToken: [
        {
            input: [activeToken,'SECRET_KEY'],
            output: {id: 1, username: 'admin'},
            description: 'Success should returning payload data'
        },{
            input: ['invalid token', 'SECRET_KEY'],
            output: {code: 'ER_JWT_MALFORMED'},
            description: 'Invalid token should throw error ER_JWT_MALFORMED'
        },{
            input: ['', 'SECRET_KEY'],
            output: {code: 'ER_JWT_NOT_FOUND'},
            description: 'Empty token should throw error ER_JWT_NOT_FOUND'
        },{
            input: [activeToken,'INVALID_SECRET_KEY'],
            output: {code: 'ER_JWT_SIGNATURE_MISMATCH'},
            description: 'Invalid payload should throw error ER_JWT_SIGNATURE_MISMATCH'
        },{
            input: [activeToken,''],
            output: {code: 'ER_JWT_EMPTY_SIGNATURE'},
            description: 'Empty payload should throw error ER_JWT_EMPTY_SIGNATURE'
        },{
            input: [expiredToken, 'SECRET_KEY'],
            output: {code: 'ER_JWT_EXPIRED'},
            description: 'Expired token should throw error ER_JWT_EXPIRED'
        },{
            input: [activeToken, 'SECRET_KEY', {ignoreExpiration: true}],
            output: {id: 1, username: 'admin'},
            description: 'Success should return payload data even if token is expired when ignoreExpiration is true'
        }
    ]
}

const testModule = TokenManager
const test = new UnitTestFramework(testObj, testModule)

test.runTest()