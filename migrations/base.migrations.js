const {db_system, logging} = require('../config')

class Migration {
    static queryBuilder({columns = [], tableName, timestamp}){
        try {
            if(!Array.isArray(columns) || columns.length < 1){
                throw new Error('NoColumnsDefined')
            }

            // create column string query
            const colQuery = columns.map( col => {
                let autoIncrement = col.autoIncrement ? 'AUTO_INCREMENT PRIMARY KEY' : ''
                let dataType = col.dataType
                let nullable = col.nullable ? '' : 'NOT NULL'
                let references = col.references ? `REFERENCES ${col.references.table}(${col.references.key})` : ''
                const constrait = col.references ? `, CONSTRAINT fk_${tableName}_${col.references.table}` : ''
                const unique = col.unique ? 'UNIQUE' : ''
                const foreignKey = col.references ? `FOREIGN KEY (${col.columnName})` : ''
                const defaultValue = col.default ? `DEFAULT ${col.default}` : ''

                switch(db_system){
                    case 'postgres':
                        // format if autoincrement present
                        if(col.autoIncrement){
                            autoIncrement = col.autoIncrement ? 'SERIAL PRIMARY KEY' : ''
                            dataType = ''
                            nullable = ''
                        }
                        if(col.references){
                            references += ' DEFERRABLE INITIALLY DEFERRED'
                        }
                        // format enum datatype
                        if(typeof dataType == 'string' && dataType.startsWith("ENUM(")){
                            dataType = `${tableName}_${col.columnName}`
                        }
                        break
                    default:
                        throw new Error('Unknown Database System')
                }

                return `${col.columnName} ${dataType} ${nullable} ${unique} ${autoIncrement} ${constrait} ${foreignKey} ${references} ${defaultValue}`
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
                await runQuery(db, query, tableName, columns)

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

async function runQuery(db, query, tableName, columns){
    switch(db_system){
        case 'mysql':
            return await db.execute(query)
        case 'postgres':
            await posgresCreateEnumDatatype(db, tableName, columns)
            return await db.query(query)
        default:
            throw new Error('Unknown Database System')
    }
}

async function posgresCreateEnumDatatype(db, tableName, columns){
    try {
        for(const column of columns){
            const{ columnName, dataType } = column
            if(typeof dataType == 'string' && dataType.startsWith("ENUM(")){
                const enumValues = dataType
                    .substring(5, dataType.length - 1) // Remove "ENUM(" and the trailing ")"
                    .split(",") // Split by comma to get individual values
                    .map(value => value.trim().replace(/'/g, "")) // Trim whitespace and remove single quotes
                
                const query = `DO $$
                BEGIN
                    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = '${tableName}_${columnName}') THEN
                        CREATE TYPE ${tableName}_${columnName} AS ENUM (${enumValues.map(value => `'${value}'`).join(", ")});
                    END IF;
                END
                $$;
                `
                await db.query(query)
            }
        }
    } catch (error) {
        console.error(error)
    }
}

module.exports = Migration