const TokenManager = require("../../utils/tokenManager")
const UnitTestFramework = require("../unit.test.framework")

const activeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiaWQiOjEsIm5hbWUiOiJEd2lKIiwiaWF0Ijo3MjcyNzQ1NTQwfQ.TyOgejLi1BeNzhIO1oojROgv37HMTL6K0ZGCvDWweoI'
const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiaWQiOjEsIm5hbWUiOiJEd2lKIiwiaWF0IjoxNjU2MTI5MTgxfQ.YRiKrJ1Zmc6GF_iKNr9G_rj_lFja3c-UEcGW903OJ3k'

const testObj = {
    generateToken: [
        {
            input: [{name: 'DwiJ'},'SECRET_KEY'],
            output: 'random string',
            description: 'Success should returning string token'
        },{
            input: [{},'SECRET_KEY'],
            output: {code: 'ER_JWT_EMPTY_PAYLOAD'},
            description: 'Empty payload should throw error ER_JWT_EMPTY_PAYLOAD'
        },{
            input: [{name: 'DwiJ'},''],
            output: {code: 'ER_JWT_EMPTY_SIGNATURE'},
            description: 'Empty secret token should throw error ER_JWT_EMPTY_SIGNATURE'
        },{
            input: [{name: 'DwiJ'},'SECRET_KEY', 0],
            output: {code: 'ER_JWT_EXPIRED'},
            description: 'Expired token should throw error ER_JWT_EXPIRED'
        },{
            input: [{name: 'DwiJ'},'SECRET_KEY', -1],
            output: {code: 'ER_JWT_EXPIRED'},
            description: 'Negative expiration time should throw error ER_JWT_EXPIRED'
        }
    ],
    verifyToken: [
        {
            input: [activeToken,'SECRET_KEY'],
            output: {name: 'DwiJ'},
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
            output: {name: 'DwiJ'},
            description: 'Success should return payload data even if token is expired when ignoreExpiration is true'
        }
    ]
}

const testModule = TokenManager
const test = new UnitTestFramework(testObj, testModule)

test.runTest()