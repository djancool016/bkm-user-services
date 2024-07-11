const logging = require('../config').logging

class Migration {
    static queryBuilder({columns = [], tableName, timestamp}){
        try {
            if(!Array.isArray(columns) || columns.length < 1){
                throw new Error('NoColumnsDefined')
            }

            // create column string query
            const colQuery = columns.map( col => {
                const nullable = col.nullable ? '' : 'NOT NULL'
                const unique = col.unique ? 'UNIQUE' : ''
                const autoIncrement = col.autoIncrement ? 'AUTO_INCREMENT PRIMARY KEY' : ''
                const constrait = col.references ? `, CONSTRAINT fk_${tableName}_${col.references.table}` : ''
                const foreignKey = col.references ? `FOREIGN KEY (${col.columnName})` : ''
                const references = col.references ? `REFERENCES ${col.references.table}(${col.references.key})` : ''
                return `${col.columnName} ${col.dataType} ${nullable} ${unique} ${autoIncrement} ${constrait} ${foreignKey} ${references}`
            }).join(', ')

            // add timestamp
            const createdAt = timestamp ? 'createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP' : ''
            const updatedAt = timestamp ? `updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP` : ''

            let isTimeStamp = timestamp? `, ${createdAt} , ${updatedAt}` : ''

            const query = `${colQuery} ${isTimeStamp}`.replace(/\s+/g, ' ')

            if(query){
                // returning string query as promise which is easier to work with async/await in migrate method
                return Promise.resolve(`CREATE TABLE IF NOT EXISTS ${tableName} (${query})`)
            } else {
                return Promise.reject(query)
            }

        } catch (error) {
            throw error
        }
    }
    static async migrate({migrations, db}){

        const migrationErrors = []

        for(const key in migrations){
 
            const{tableName, columns} = migrations[key]

            try {
                const query = await Migration.queryBuilder({columns, tableName})
                await db.execute(query)

            } catch (err) {
                migrationErrors.push({ tableName: tableName, error: err })
            }
        }
        if (migrationErrors.length > 0) {
            if(logging) console.error(`Migration Error : ${JSON.stringify(migrationErrors)}`)
            throw new Error(`MigrationError`);
        }
        if(logging) console.log('All migrations completed successfully.')
    }
}

module.exports = Migration