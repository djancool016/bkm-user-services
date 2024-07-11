const ApiTestFramework = require('../api.test.framework')
const {db, pool, truncateAll} = require('../../database').init()
const {seedTables} = require('../../seeders')

const testObj = {
    // register: [
    //     {
    //         method: 'POST',
    //         endpoint: '/register',
    //         input: {roleId: 2, username: 'new_user', password: 'oiewjuhfdusif123', email: 'new_user@example.com', name: 'New User', phone: '1234567890', address: 'Jakarta, Indonesia', nik: '1234567890123'},
    //         output: {httpCode: 201, status: true, message: 'Created'},
    //         description: 'Valid user registration should return Http 201'
    //     },
    //     {
    //         method: 'POST',
    //         endpoint: '/register',
    //         input: {roleId: 1, username: 'admin', password: 'oiewjuhfdusif123', email: 'existing_user@example.com', name: 'Existing User', phone: '0987654321', address: 'Bandung, Indonesia', nik: '3210987654321'},
    //         output: {httpCode: 409, code: 'CONFLICT'},
    //         description: 'Duplicate user registration should return Http Error 409'
    //     },
    //     {
    //         method: 'POST',
    //         endpoint: '/register',
    //         input: {roleId: 2, username: '', password: 'new_password', email: 'new_user@example.com', name: 'New User', phone: '1234567890', address: 'Jakarta, Indonesia', nik: '1234567890123'},
    //         output: {httpCode: 400, code: 'BAD_REQUEST'},
    //         description: 'Empty username should return Http Error 400'
    //     },
    //     {
    //         method: 'POST',
    //         endpoint: '/register',
    //         input: {roleId: 2, username: 'new_user', password: '', email: 'new_user@example.com', name: 'New User', phone: '1234567890', address: 'Jakarta, Indonesia', nik: '1234567890123'},
    //         output: {httpCode: 400, code: 'BAD_REQUEST'},
    //         description: 'Empty password should return Http Error 400'
    //     },
    //     {
    //         method: 'POST',
    //         endpoint: '/register',
    //         input: {roleId: 2, username: 'new_user', password: 'new_password', email: '', name: 'New User', phone: '1234567890', address: 'Jakarta, Indonesia', nik: '1234567890123'},
    //         output: {httpCode: 400, code: 'BAD_REQUEST'},
    //         description: 'Empty email should return Http Error 400'
    //     },
    //     {
    //         method: 'POST',
    //         endpoint: '/register',
    //         input: {roleId: 2, username: '', password: '', email: '', name: 'New User', phone: '1234567890', address: 'Jakarta, Indonesia', nik: '1234567890123'},
    //         output: {httpCode: 400, code: 'BAD_REQUEST'},
    //         description: 'Empty username, password, and email should return Http Error 400'
    //     }
    // ],
    login: [
        {
            method: 'POST',
            endpoint: '/login',
            input: {username: 'admin', password: 'root'},
            output: {httpCode: 200, data: {id: 1, username: 'admin'}},
            description: 'Valid login should return Http 200 and user data'
        },
        {
            method: 'POST',
            endpoint: '/login',
            input: {username: 'admin', password: 'wrong_password'},
            output: {httpCode: 400, code: 'ER_INVALID_PASSWORD'},
            description: 'Invalid password should return Http Error 401'
        },
        {
            method: 'POST',
            endpoint: '/login',
            input: {username: 'nonexistent_user', password: 'any_password'},
            output: {httpCode: 404, code: 'ER_NOT_FOUND'},
            description: 'Nonexistent user should return Http Error 404'
        },
        {
            method: 'POST',
            endpoint: '/login',
            input: {username: '', password: 'any_password'},
            output: {httpCode: 400, code: 'ER_INVALID_CREDENTIALS'},
            description: 'Empty username should return Http Error 400'
        },
        {
            method: 'POST',
            endpoint: '/login',
            input: {username: 'admin', password: ''},
            output: {httpCode: 400, code: 'ER_INVALID_CREDENTIALS'},
            description: 'Empty password should return Http Error 400'
        },
        {
            method: 'POST',
            endpoint: '/login',
            input: {username: '', password: ''},
            output: {httpCode: 403, code: 'ER_ACCESS_DENIED_ERROR'},
            description: 'Empty username and password should return Http Error 400'
        }
    ]
}

const baseURL = 'http://localhost:6100/api/user'
const test = new ApiTestFramework(testObj, baseURL)

test.setBeforeAll = async () => {
    return await db.connect().then(async db => {
        await truncateAll(db)
        await seedTables(db)
    })
}
test.setAfterAll = async () => {
    await pool.end()
    await db.end()
}

test.runTest()
