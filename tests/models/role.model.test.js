const UnitTestFramework = require("../unit.test.framework")
const {db, pool, truncateAll} = require('../../database').init()
const {seedTables} = require('../../seeders')
const RoleModel = require('../../models/role.model')

const validInput = {
    name: 'Tester Role',
    description: 'This is tested from jest'
}

const invalidInput = {
    nameX: 'Tester Role',
    description: 'This is tested from jest'
}

const validResult = [
    {
        id: 1, 
        name: 'Admin',
        description: "Full access to system features."
    }
]

const testCases = {
    create: [
        {
            input: validInput,
            output: {data:{affectedRows: 1}},
            description: 'Success should returning affectedRows = 1'
        },{
            input: invalidInput,
            output: {code: 'ER_BAD_FIELD_ERROR'},
            description: 'Invalid input should throwing error code ER_BAD_FIELD_ERROR'
        },{
            input: undefined,
            output: {code: 'ER_INVALID_BODY'},
            description: 'Invalid input should throwing error code ER_INVALID_BODY'
        }
    ],
    findByPk: [
        {
            input: 1,
            output: {data: validResult},
            description: 'Success should returning array of objects'
        },{
            input: 99999,
            output: {code: 'ER_NOT_FOUND'},
            description: 'Empty result should throwing error code ER_NOT_FOUND'
        },{
            input: undefined,
            output: {code: 'ER_INVALID_BODY'},
            description: 'Invalid input should throwing error code ER_INVALID_BODY'
        }
    ],
    findAll: [
        {
            input: {},
            output: {data: validResult},
            description: 'Success should returning array of objects'
        },{
            input: undefined,
            output: {code: 'ER_INVALID_BODY'},
            description: 'Invalid input should throwing error code ER_INVALID_BODY'
        }
    ],
    findByKeys: [
        {
            input: {id:1, name: 'adm'},
            output: {data:validResult},
            description: 'Success should returning array of objects'
        },{
            input: {id:1, name: 'adm', other: 'unknown key'},
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
            input: {id: 2, name: 'New Role'},
            output: {data: {affectedRows: 1}},
            description: 'Success should affectedRows  = 1'
        },{
            input: {id: 2, nameX: 'New Role'},
            output: {code: 'ER_BAD_FIELD_ERROR'},
            description: 'Invalid input should throwing error code ER_BAD_FIELD_ERROR'
        },{
            input: undefined,
            output: {code: 'ER_INVALID_BODY'},
            description: 'Invalid input should throwing error code ER_INVALID_BODY'
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
        }
    ]
}

const testModule = new RoleModel()

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