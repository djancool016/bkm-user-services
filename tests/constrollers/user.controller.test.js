const userController = require('../../controllers/user.controller')
const UnitTestFramework = require('../unit.test.framework')
const {db, pool, truncateAll} = require('../../database').init()
const {seedTables} = require('../../seeders')
const { dataLogger } = require('../../utils/httpLogger')
const {migration} = require('../../migrations')
const TokenManager = require('../../utils/tokenManager')

const accessToken = TokenManager.generateToken({id: 1, username: 'admin'}, process.env.ACCESS_TOKEN_SECRET)
const refreshToken = TokenManager.generateToken({id: 1, username: 'admin'}, process.env.REFRESH_TOKEN_SECRET)
const expiredAccessToken = TokenManager.generateToken({id: 1, username: 'admin'}, process.env.ACCESS_TOKEN_SECRET, 0)
const expiredRefreshToken = TokenManager.generateToken({id: 1, username: 'admin'}, process.env.REFRESH_TOKEN_SECRET, 0)

const testCases = {
    rotateToken: [
        {
            input: {cookies: {accessToken, refreshToken}},
            output: {httpCode: 200, data: {refreshToken: 'random string', accessToken: 'random string'}},
            description: 'Success should generate new accessToken and refreshToken'
        },{
            input: {cookies: {accessToken, refreshToken: 'invalid_token'}},
            output: {httpCode: 401, code: 'ER_JWT_MALFORMED'},
            description: 'Invalid token should return Http Error 401'
        },{
            input: {cookies: {accessToken, refreshToken: undefined}},
            output: {httpCode: 401, code: 'ER_JWT_NOT_FOUND'},
            description: 'No token should return Http Error 401'
        },{
            input: {cookies: {accessToken, refreshToken: expiredRefreshToken}},
            output: {httpCode: 401, code: 'ER_JWT_EXPIRED'},
            description: 'Expired token should return Http Error 401'
        },{
            input: {cookies: {accessToken: expiredAccessToken, refreshToken}},
            output: {httpCode: 200, data: {refreshToken: 'random string', accessToken: 'random string'}},
            description: 'Expired accessToken and active refreshToken should generate new accessToken and refreshToken'
        }
    ],
    authorizeUser: [
        {
            input: {cookies: {accessToken, refreshToken}},
            output: {httpCode: 200, data: {id: 1, username: 'admin'}},
            description: 'Success should return user data'
        },{
            input: {cookies: {accessToken: 'invalid_token', refreshToken}},
            output: {httpCode: 401, code: 'ER_JWT_MALFORMED'},
            description: 'Invalid accessToken should return Http Error 401'
        },{
            input: {cookies: {accessToken, refreshToken: 'invalid_token'}},
            output: {httpCode: 401, code: 'ER_JWT_MALFORMED'},
            description: 'Invalid refreshToken should return Http Error 401'
        },{
            input: {cookies: {accessToken: undefined, refreshToken}},
            output: {httpCode: 401, code: 'ER_JWT_NOT_FOUND'},
            description: 'No accessToken should return Http Error 401'
        },{
            input: {cookies: {accessToken, refreshToken: undefined}},
            output: {httpCode: 401, code: 'ER_JWT_NOT_FOUND'},
            description: 'No refreshToken should return Http Error 401'
        },{
            input: {cookies: {accessToken: undefined, refreshToken: undefined}},
            output: {httpCode: 401, code: 'ER_JWT_NOT_FOUND'},
            description: 'No tokens should return Http Error 401'
        }
    ],
    authenticateUser: [
        {
            input: {body: {username: 'admin', password: 'root'}},
            output: {httpCode: 200, data: {id: 1, username: 'admin'}},
            description: 'Success should return user data and set cookies'
        },{
            input: {body: {username: 'admin', password: 'wrong_password'}},
            output: {httpCode: 400, code: 'ER_INVALID_PASSWORD'},
            description: 'Wrong password should return Http Error 401'
        },{
            input: {body: {username: 'nonexistent_user', password: 'any_password'}},
            output: {httpCode: 404, code: 'ER_NOT_FOUND'},
            description: 'Nonexistent user should return Http Error 404'
        },{
            input: {body: {username: '', password: 'any_password'}},
            output: {httpCode: 400, code: 'ER_INVALID_CREDENTIALS'},
            description: 'Empty username should return Http Error 401'
        },{
            input: {body: {username: 'admin', password: ''}},
            output: {httpCode: 400, code: 'ER_INVALID_CREDENTIALS'},
            description: 'Empty password should return Http Error 401'
        },{
            input: {body: {username: '', password: ''}},
            output: {httpCode: 400, code: 'ER_INVALID_CREDENTIALS'},
            description: 'Empty username and password should return Http Error 401'
        }
    ],
    login: [
        {
            input: {body: {username: 'admin', password: 'root'}},
            output: {httpCode: 200, data: {id: 1, username: 'admin'}},
            description: 'Valid credentials should return Http 200 and user data'
        },{
            input: {body: {username: 'admin', password: 'wrong_password'}},
            output: {httpCode: 400, code: 'ER_INVALID_PASSWORD'},
            description: 'Invalid password should return Http Error 401'
        },{
            input: {body: {username: 'nonexistent_user', password: 'any_password'}},
            output: {httpCode: 404, code: 'ER_NOT_FOUND'},
            description: 'Nonexistent user should return Http Error 404'
        },{
            input: {body: {username: '', password: 'any_password'}},
            output: {httpCode: 400, code: 'ER_INVALID_CREDENTIALS'},
            description: 'Empty username should return Http Error 400'
        },{
            input: {body: {username: 'admin', password: ''}},
            output: {httpCode: 400, code: 'ER_INVALID_CREDENTIALS'},
            description: 'Empty password should return Http Error 400'
        },{
            input: {body: {username: '', password: ''}},
            output: {httpCode: 403, code: 'ER_ACCESS_DENIED_ERROR'},
            description: 'Empty username and password should return Http Error 400'
        },{
            input: {cookies: {accessToken, refreshToken}},
            output: {httpCode: 200, data: {id: 1, username: 'admin'}},
            description: 'Valid tokens should return Http 200 and user data'
        },{
            input: {cookies: {accessToken: 'invalid_token', refreshToken}},
            output: {httpCode: 401, code: 'ER_JWT_MALFORMED'},
            description: 'Invalid accessToken should return Http Error 401'
        },{
            input: {cookies: {accessToken, refreshToken: 'invalid_token'}},
            output: {httpCode: 401, code: 'ER_JWT_MALFORMED'},
            description: 'Invalid refreshToken should return Http Error 401'
        },{
            input: {cookies: {accessToken: undefined, refreshToken}},
            output: {httpCode: 403, code: 'ER_ACCESS_DENIED_ERROR'},
            description: 'No accessToken should return Http Error 401'
        },{
            input: {cookies: {accessToken, refreshToken: undefined}},
            output: {httpCode: 403, code: 'ER_ACCESS_DENIED_ERROR'},
            description: 'No refreshToken should return Http Error 401'
        },{
            input: {cookies: {accessToken: undefined, refreshToken: undefined}},
            output: {httpCode: 403, code: 'ER_ACCESS_DENIED_ERROR'},
            description: 'No tokens should return Http Error 401'
        },{
            input: {cookies: {accessToken: expiredAccessToken, refreshToken}},
            output: {httpCode: 401, code: 'ER_JWT_EXPIRED'},
            description: 'Expired accessToken should return Http Error 401'
        }
    ],
    register: [
        {
            input: {body: {roleId: 2, username: 'new_user', password: 'oiewjuhfdusif123', email: 'new_user@example.com', name: 'New User', phone: '1234567890', address: 'Jakarta, Indonesia', nik: '1234567890123'}},
            output: {httpCode: 201},
            description: 'Valid user registration should return Http 201'
        },{
            input: {body: {roleId: 1, username: 'admin', password: 'oiewjuhfdusif123', email: 'existing_user@example.com', name: 'Existing User', phone: '0987654321', address: 'Bandung, Indonesia', nik: '3210987654321'}},
            output: {httpCode: 409, code: 'ER_DUP_ENTRY'},
            description: 'Duplicate user registration should return Http Error 409'
        },{
            input: {body: {roleId: 2, username: '', password: 'new_password', email: 'new_user@example.com', name: 'New User', phone: '1234567890', address: 'Jakarta, Indonesia', nik: '1234567890123'}},
            output: {httpCode: 400, code: 'ER_INVALID_BODY'},
            description: 'Empty username should return Http Error 400'
        },{
            input: {body: {roleId: 2, username: 'new_user', password: '', email: 'new_user@example.com', name: 'New User', phone: '1234567890', address: 'Jakarta, Indonesia', nik: '1234567890123'}},
            output: {httpCode: 400, code: 'ER_INVALID_BODY'},
            description: 'Empty password should return Http Error 400'
        },{
            input: {body: {roleId: 2, username: 'new_user', password: 'new_password', email: '', name: 'New User', phone: '1234567890', address: 'Jakarta, Indonesia', nik: '1234567890123'}},
            output: {httpCode: 400, code: 'ER_INVALID_BODY'},
            description: 'Empty email should return Http Error 400'
        },{
            input: {body: {roleId: 2, username: '', password: '', email: '', name: 'New User', phone: '1234567890', address: 'Jakarta, Indonesia', nik: '1234567890123'}},
            output: {httpCode: 400, code: 'ER_INVALID_BODY'},
            description: 'Empty username, password, and email should return Http Error 400'
        }
    ],
    profile: [
        {
            input: {cookies: {accessToken, refreshToken}},
            output: {httpCode: 200, data: {id: 1, username: 'admin', email: 'admin@Email.com', name: 'Dwi Julianto', phone: '213546879213', address: 'Semarang, Indonesia', nik: '7722323656989'}},
            description: 'Valid tokens should return user profile with Http 200'
        },{
            input: {cookies: {accessToken: 'invalid_token', refreshToken}},
            output: {httpCode: 401, code: 'ER_JWT_MALFORMED'},
            description: 'Invalid accessToken should return Http Error 401'
        },{
            input: {cookies: {accessToken, refreshToken: 'invalid_token'}},
            output: {httpCode: 401, code: 'ER_JWT_MALFORMED'},
            description: 'Invalid refreshToken should return Http Error 401'
        },{
            input: {cookies: {accessToken: undefined, refreshToken}},
            output: {httpCode: 401, code: 'ER_JWT_NOT_FOUND'},
            description: 'No accessToken should return Http Error 403'
        },{
            input: {cookies: {accessToken, refreshToken: undefined}},
            output: {httpCode: 401, code: 'ER_JWT_NOT_FOUND'},
            description: 'No refreshToken should return Http Error 403'
        },{
            input: {cookies: {accessToken: undefined, refreshToken: undefined}},
            output: {httpCode: 401, code: 'ER_JWT_NOT_FOUND'},
            description: 'No tokens should return Http Error 403'
        },{
            input: {cookies: {accessToken: expiredAccessToken, refreshToken: expiredRefreshToken}},
            output: {httpCode: 401, code: 'ER_JWT_EXPIRED'},
            description: 'Expired accessToken should return Http Error 401'
        }
    ]
}

const testModule = () => {
    const res = {}
    const next = (req) => () => req.result

    // mock setCookies function because this test not using express http res.cookies() method
    const setCookies = (req) => (res, tokens) => req['result'] = new dataLogger({data: tokens})

    const controller = (method, req, opt = [setCookies(req)]) => userController[method](req, res, next(req), ...opt)

    return {
        rotateToken: (req) => controller('rotateToken', req),
        authorizeUser: (req) => controller('authorizeUser', req),
        authenticateUser: (req) => controller('authenticateUser',req),
        login: (req) => controller('login', req),
        register: (req) => controller('register', req),
        profile: (req) => controller('profile', req)
    }
}

const test = new UnitTestFramework(testCases, testModule())

test.setBeforeAll = async () => {
    return await db.connect().then(async db => {
        await truncateAll(db)
        await migration(db)
        await seedTables(db)
    })
}
test.setAfterAll = async () => {
    await pool.end()
    await db.end()
}

test.runTest()