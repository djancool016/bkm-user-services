const mysql = require('mysql2/promise')
const {db_config, loging} = require('./config')

/**
 * Class for handling MYSQL database connection
 */
class MysqlDatabaseConnection {
    constructor(){
        this.db = null
    }
    static getInstance() {
        if (!MysqlDatabaseConnection.instance) {
            MysqlDatabaseConnection.instance = new MysqlDatabaseConnection()
        }
        return MysqlDatabaseConnection.instance
    }
    /**
     * @returns mysql database connection
     */
    async connect() {
        if(!this.db){
            try {
                this.db = await mysql.createConnection(db_config)
                if(loging) console.log("Successfully connected to database")
                return this.db
            } catch (error) {
                throw error
            }
        }
        return this.db
    }
    /**
     * Close database connection
     */
    async end(){
        if(this.db){
            try {
                await this.db.end()
                if(loging) console.log('Database connection closed.')

            } catch (error) {
                if(loging) console.error('Error closing database connection', error)
                throw error
            } finally {
                this.db = null // Set database to null after closing
            }
        } else {
            if(loging) console.warn('Database connection is already closed or was never initialized')
        }
    }
}

/**
 * Class for handling MYSQL pool connection
 */
class MysqlPoolConnection {
    constructor() {
        this.pool = null
    }

    static getInstance() {
        if (!MysqlPoolConnection.instance) {
            MysqlPoolConnection.instance = new MysqlPoolConnection()
        }
        return MysqlPoolConnection.instance
    }

    /**
     * 
     * @param {Boolean} waitForConnections - Determines the pool's action when no connections are available and the limit has been reached.
     * @param {Number} connectionLimit - The maximum number of connections to create at once. (Default: 10)
     * @param {Number} queueLimit - The maximum number of connection requests the pool will queue before returning an error. (Default: 0)
     * @returns - Mysql pool connection
     */
    createPool(
        waitForConnections = true,
        connectionLimit = 10,
        queueLimit = 0
    ){
        if(!this.pool){
            try {
                this.pool = mysql.createPool({
                    ...db_config,
                    waitForConnections,
                    connectionLimit,
                    queueLimit
                })
                return this.pool
            } catch (error) {
                if(loging) console.error("Error creating a connection pool", error)
                throw error
            }
        }
    }
    /**
     * Close pool connection
     */
    async end(){
        if (this.pool){
            try {
                await this.pool.end()
                if(loging) console.log('Pool connection closed')
            } catch (error) {
                if(loging) console.error('Error closing pool connection', error)
                throw error
            } finally {
                this.pool = null // Set pool to null after closing
            }
        } else {
            if(loging) console.warn('Pool connection is already closed or was never initialized')
        }
    }
}

/**
 * @returns Turncate or delete all data on database
 */
async function truncateAll(database){
    try {
        const [tables] = await database.query('SHOW TABLES')

        await Promise.all(tables.map(async(table) => {
            const tableName = table[Object.keys(table)[0]]
            // Disable foreign key checks
            await database.query('SET FOREIGN_KEY_CHECKS = 0')
            // Truncate table
            await database.query(`TRUNCATE TABLE ${tableName}`)
            // Enable foreign key checks
            await database.query('SET FOREIGN_KEY_CHECKS = 0')
        }))

        if(tables.length > 0){
            if(loging) console.log('All tables have been truncated.')
            return
        }
        if(loging)  console.log('0 tables found')
        return

    } catch (error) {
        if(loging) console.error(error)
        throw error
    }
}

module.exports = {
    init: function () {
        const db = MysqlDatabaseConnection.getInstance()
        const pool = MysqlPoolConnection.getInstance()
        return {
            db,
            pool,
            truncateAll
        }
    }
}