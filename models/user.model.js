const QueryBuilder = require("../utils/queryBuilder")
const BaseModel = require("./bese.model")

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

const queryBuilder = new QueryBuilder(init)

class UserModel extends BaseModel{
    constructor(){
        super(queryBuilder)
    }
}

module.exports = UserModel