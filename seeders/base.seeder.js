const {logging, db_system} = require('../config')

class Seeder {
    /**
     * 
     * @param {Object} seeder seeder contain table name and seed data {table, seed}
     * @param {Object} db database connection
     */
    static async #seedTable(seeder, db){
        try {
            const {table, seed} = seeder

            if(!table){
                throw new Error('SEEDER_INVALID_TABLE_ERR')
            }
            if(!seed || !Array.isArray(seed) || seed.length < 1){
                throw new Error('SEEDER_INVALID_SEED_ERR')
            }

            // create bulk insert query
            const bulkInsertPromises = seed.map(async obj => {

                // extract keys and values from object data
                const keys = Object.keys(obj)
                const values = keys.map( key => obj[key])

                // create placeholder for the values
                const placeholders = keys.map((_, index) => parameterizedHandler(index + 1)).join(', ')

                // create insert query
                const query = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`
                
                // start seeding
                if (db_system === 'mysql') {
                    await db.execute(query, values)
                } else if (db_system === 'postgres') {
                    await db.query(query, values)
                }
            })

            // using Promise.all to reduce potential race condition
            await Promise.all(bulkInsertPromises)
            if(logging) console.log(`Seeder successfully populate table ${table}`)

        } catch (error) {
            if(logging) console.error(error.message)
            throw error
        }
    }
    /**
     * @param {Array<Object>} seeders seeder contain array of seeder
     * @param {Object} db database connection
     */
    static async seedTables(seeders = [], db){
        try {
            if(!Array.isArray(seeders)) {
                throw new Error('INVALID_ARRAY_DATATYPE')
            }
            for(const seeder of seeders){
                await Seeder.#seedTable(seeder, db)
            }
        } catch (error) {
            if(logging) console.error(error.message)
            throw error
        }
    }
}

function parameterizedHandler(paramIndex = 1){
    switch(db_system){
        case 'mysql':
            return '?'
        case 'postgres':
            return `$${paramIndex}`
        default:
            throw new Error('Invalid Database System')
    }
}

module.exports = Seeder