const QueryBuilder = require('../../utils/QueryBuilder')
const BaseModel = require('../../models/bese.model')
const UnitTestFramework = require("../unit.test.framework")
const {db, pool, truncateAll} = require('../../database').init()
const {seedTables} = require('../../seeders')

const init = {
    table: 'users',
    includes: [
        'id','roleId','username', 'password','email', 
        'name', 'phone', 'address','nik', 'status'
    ],
    association: [
        {
            table: 'roles',
            references: 'roles.id',
            foreignKey: 'users.roleId',
            includes: ['name'],
            alias: {
                name: 'role'
            }
        }
    ]
}

const validUser = {
    roleId: 1,
    userName: 'TestUser1',
    password: '1234',
    email: 'email@gmail.com',
    name: 'DwiJ',
    phone: '+62123123123',
    address: 'Indonesia',
    nik: '1122334455'
}

const invalidUser = {
    roleIdX: 1,
    userNameX: 'TestUser1',
    passwordX: '1234',
    emailX: 'email@gmail.com',
    name: 'DwiJ',
    phone: '+62123123123',
    address: 'Indonesia',
    nik: '1122334455'
}

const testCases = {
    create: [
        {
            input: validUser,
            output: {data:{affectedRows: 1}},
            description: 'Success should returning affectedRows = 1'
        },{
            input: invalidUser,
            output: {code: 'ER_BAD_FIELD_ERROR'},
            description: 'Invalid input should throwing error code ER_INVALID_BODY'
        },{
            input: undefined,
            output: {code: 'ER_INVALID_BODY'},
            description: 'Invalid input should throwing error code ER_INVALID_BODY'
        },{
            input: {roleId: 1, userName: '', password: '1234', email: 'email@gmail.com', name: 'DwiJ', phone: '+62123123123', address: 'Indonesia', nik: '1122334455'},
            output: {code: 'ER_INVALID_BODY'},
            description: 'Empty username should throwing error code ER_INVALID_BODY'
        }
    ],
    findByPk: [
        {
            input: 1,
            output: {data: [{id: 1, username: 'admin'}]},
            description: 'Success should returning array of objects'
        },{
            input: 99999,
            output: {code: 'ER_NOT_FOUND'},
            description: 'Empty result should throwing error code ER_NOT_FOUND'
        },{
            input: undefined,
            output: {code: 'ER_INVALID_BODY'},
            description: 'Invalid input should throwing error code ER_INVALID_BODY'
        },{
            input: 'invalid_id',
            output: {code: 'ER_INVALID_BODY'},
            description: 'Invalid id should throwing error code ER_INVALID_BODY'
        }
    ],
    findAll: [
        {
            input: {},
            output: {data: [{id: 1, username: 'admin'}]},
            description: 'Success should returning array of objects'
        },{
            input: undefined,
            output: {code: 'ER_INVALID_BODY'},
            description: 'Invalid input should throwing error code ER_INVALID_BODY'
        }
    ],
    findByKeys: [
        {
            input: {id:1, username: 'adm'},
            output: {data:[{id: 1, username: 'admin'}]},
            description: 'Success should returning array of objects'
        },{
            input: {id:1, username: 'adm', other: 'unknown key'},
            output: {code: 'ER_NOT_FOUND'},
            description: 'Empty result should throwing error code ER_NOT_FOUND'
        },{
            input: undefined,
            output: {code: 'ER_INVALID_BODY'},
            description: 'Invalid input should throwing error code ER_INVALID_BODY'
        }
    ],
    update: [
        {
            input: {id: 2, name: 'JuliantDwyne'},
            output: {data: {affectedRows: 1}},
            description: 'Success should affectedRows  = 1'
        },{
            input: {id: 2, nameX: 'JuliantDwyne'},
            output: {code: 'ER_BAD_FIELD_ERROR'},
            description: 'Invalid input should throwing error code ER_INVALID_BODY'
        },{
            input: undefined,
            output: {code: 'ER_INVALID_BODY'},
            description: 'Invalid input should throwing error code ER_INVALID_BODY'
        },{
            input: {id: 2, name: ''},
            output: {code: 'ER_INVALID_BODY'},
            description: 'Empty name should throwing error code ER_INVALID_BODY'
        }
    ],
    delete: [
        {
            input: 2,
            output: {data: {affectedRows: 1}},
            description: 'Success should affectedRows  = 1'
        },{
            input: 99999,
            output: {code: 'ER_NOT_FOUND'},
            description: 'Empty result should throwing error code ER_NOT_FOUND'
        },{
            input: undefined,
            output: {code: 'ER_INVALID_BODY'},
            description: 'Invalid input should throwing error code ER_INVALID_BODY'
        },{
            input: 'invalid_id',
            output: {code: 'ER_INVALID_BODY'},
            description: 'Invalid id should throwing error code ER_INVALID_BODY'
        }
    ]
}

const queryBuilder = new QueryBuilder(init)

const testModule = new BaseModel(queryBuilder)

const test = new UnitTestFramework(testCases, testModule)

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