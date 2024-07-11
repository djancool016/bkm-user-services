const QueryBuilder = require('../../utils/queryBuilder')
const UnitTestFramework = require("../unit.test.framework")

const init = {
    table: 'users',
    includes: [
        'id','roleId','statusId','username', 'password','email', 
        'name', 'phone', 'address','nik'
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
        },{
            table: 'status',
            references: 'status.id',
            foreignKey: 'users.statusId',
            includes: ['name'],
            alias: {
                name: 'status'
            }
        }
    ]
}

const testObj = {
    create: [
        {
            input: {name: 'DwiJ', username:'admin'},
            output: '',
            description: 'Success should return object contains CREATE query and params'
        },
        {
            input: {name: '', username: ''},
            output: {code: 'ER_BAD_FIELD_ERROR'},
            description: 'Empty input should throw error'
        }
    ],
    readByPk: [
        {
            input: {id: 1},
            output: '',
            description: 'Success should return object contains SELECT query and params'
        },
        {
            input: {id: null},
            output: {code: 'ER_BAD_FIELD_ERROR'},
            description: 'Null id should throw error'
        },
        {
            input: {id: 'invalid'},
            output: {code: 'ER_BAD_FIELD_ERROR'},
            description: 'Invalid id type should throw error'
        }
    ],
    readAll: [
        {
            input: {},
            output: '',
            description: 'Success should return object contains SELECT query and params'
        },
        {
            input: {page: 1, limit: 10},
            output: '',
            description: 'Success should return paginated SELECT query and params'
        }
    ],
    readByKeys: [
        {
            input: {name: 'DwiJ', roleId: 1, role: 'admin', status: 'active'},
            output: '',
            description: 'Success should return object contains SELECT query and params'
        },
        {
            input: {name: 'DwiJ'},
            output: '',
            description: 'Success should return object contains SELECT query and params with partial keys'
        },
        {
            input: {name: ''},
            output: {code: 'ER_BAD_FIELD_ERROR'},
            description: 'Empty key value should throw error'
        }
    ],
    update: [
        {
            input: {id: 1, name: 'JDwyne'},
            output: '',
            description: 'Success should return object contains UPDATE query and params'
        },
        {
            input: {id: 1},
            output: {code: 'ER_BAD_FIELD_ERROR'},
            description: 'Missing fields to update should throw error'
        },
        {
            input: {id: null, name: 'JDwyne'},
            output: {code: 'ER_BAD_FIELD_ERROR'},
            description: 'Null id should throw error'
        }
    ],
    delete: [
        {
            input: {id: 1},
            output: '',
            description: 'Success should return object contains DELETE query and params'
        },
        {
            input: {id: null},
            output: {code: 'ER_BAD_FIELD_ERROR'},
            description: 'Null id should throw error'
        },
        {
            input: {id: 'invalid'},
            output: {code: 'ER_BAD_FIELD_ERROR'},
            description: 'Invalid id type should throw error'
        }
    ]
}

const testModule = new QueryBuilder(init)

const test = new UnitTestFramework(testObj, testModule)

test.runTest()