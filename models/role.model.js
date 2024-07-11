const QueryBuilder = require("../utils/QueryBuilder");
const BaseModel = require("./bese.model");

const init = {
    table: 'roles',
    includes: [
        'id','name', 'description'
    ],
    association: []
}

const queryBuilder = new QueryBuilder(init)

class RoleModel extends BaseModel{
    constructor(){
        super(queryBuilder)
    }
}

module.exports = RoleModel