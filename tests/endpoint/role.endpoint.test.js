const ApiTestFramework = require('../api.test.framework')
const {db, pool, truncateAll} = require('../../database').init()
const {seedTables} = require('../../seeders')

const testObj = {
    findByPk: [
        {
            method: 'GET',
            endpoint: '/1',
            input: {},
            output: {httpCode: 200, data: [{ id: 1, name: 'Admin' }]},
            description: 'should return role with id 1'
        },{
            method: 'GET',
            endpoint: '/99999',
            input: {},
            output: {httpCode: 404},
            description: 'should return error 404 for non-existent role with id 99999'
        }
    ],
    findAll: [
        {
            method: 'GET',
            endpoint: '/',
            input: {},
            output: {httpCode: 200, data: [{ id: 1, name: 'Admin' }, { id: 2, name: 'Manager' }]},
            description: 'should return all roles'
        }
    ],
    findByKeys: [
        {
            method: 'GET',
            endpoint: '/?id=1',
            input: {},
            output: {httpCode: 200, data: [{ id: 1, name: 'Admin' }]},
            description: 'request using query array should return roles with id 1'
        },{
            method: 'GET',
            endpoint: '/?name=Admin',
            input: {},
            output: {httpCode: 200, data: [{ id: 1, name: 'Admin' }]},
            description: 'request using query array should return roles with name Admin'
        },{
            method: 'GET',
            endpoint: '/?id=9999',
            input: {},
            output: {httpCode: 404},
            description: 'request using query array should return error 404 for non-existent role with id 9999'
        },{
            method: 'GET',
            endpoint: '/?name=Admin,Manager',
            input: {},
            output: {httpCode: 200, data: [{ id: 1, name: 'Admin' }, { id: 2, name: 'Manager' }]},
            description: 'request using query array should return multiple role'
        },
        {
            method: 'GET',
            endpoint: '/?id=1,2&name=Manager',
            input: {},
            output: {httpCode: 200, data: [{ id: 2, name: 'Manager' }]},
            description: 'request using query array should return role with id 2 and name Manager'
        }
    ],
    create: [
        {
            method: 'POST',
            endpoint: '/',
            input: {name: 'Guest', description: 'Guest user'},
            output: {httpCode: 201, data: {affectedRows: 1}},
            description: 'should create a new role with name Guest'
        },
        {
            method: 'POST',
            endpoint: '/',
            input: {name: 'Admin', description: 'Guest user'},
            output: {httpCode: 409},
            description: 'should return error 409 for duplicate role name Admin'
        }
    ],
    update: [
        {
            method: 'PUT',
            endpoint: '/',
            input: {id: 1, name: 'SuperAdmin'},
            output: {httpCode: 200, data: { affectedRows: 1 }},
            description: 'should update role with id 1 to name SuperAdmin'
        },
        {
            method: 'PUT',
            endpoint: '/',
            input: {id: 99999, name: 'NonExistent'},
            output: {httpCode: 404},
            description: 'should return error 404 for updating non-existent role with id 99999'
        }
    ],
    delete: [
        {
            method: 'DELETE',
            endpoint: '/2',
            input: {},
            output: {data: { affectedRows: 1 }},
            description: 'should delete role with id 2'
        },
        {
            method: 'DELETE',
            endpoint: '/99999',
            input: {},
            output: {httpCode: 404},
            description: 'should return error 404 for deleting non-existent role with id 99999'
        }
    ]
}

const baseURL = 'http://localhost:6100/api/role'
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
