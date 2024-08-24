const mysql = require('mysql2/promise')
const {Client, Pool} = require('pg')
const {db_config, db_system, logging} = require('./config')

/**
 * Class for handling database connection
 */
class DbManager {
    constructor(dbConnector){
        this.dbConnector = dbConnector // this is a fuction to connect database
        this.db = null
    }
    static getInstance(dbConnector) {
        if (!DbManager.instance) {
            DbManager.instance = new DbManager(dbConnector)
        }
        return DbManager.instance
    }
    /**
     * @returns mysql database connection
     */
    async connect() {
        if(!this.db){
            try {
                this.db = await this.dbConnector()
                if(logging) console.log("Successfully connected to database")
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
                if(logging) console.log('Database connection closed.')

            } catch (error) {
                if(logging) console.error('Error closing database connection', error)
                throw error
            } finally {
                this.db = null // Set database to null after closing
            }
        } else {
            if(logging) console.warn('Database connection is already closed or was never initialized')
        }
    }
}

/**
 * Class for handling MYSQL pool connection
 */
class PoolManager {
    constructor(poolConnector) {
        this.pool = null
        this.poolConnector = poolConnector
    }

    static getInstance(poolConnector) {
        if (!PoolManager.instance) {
            PoolManager.instance = new PoolManager(poolConnector)
        }
        return PoolManager.instance
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
                this.pool = poolConnector()
                return this.pool
            } catch (error) {
                if(logging) console.error("Error creating a connection pool", error)
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
                if(logging) console.log('Pool connection closed')
            } catch (error) {
                if(logging) console.error('Error closing pool connection', error)
                throw error
            } finally {
                this.pool = null // Set pool to null after closing
            }
        } else {
            if(logging) console.warn('Pool connection is already closed or was never initialized')
        }
    }
}

/**
 * @returns Turncate or delete all data on database
 */
async function truncateManager(database, truncateTables = []){
    try {
        
        switch(db_system){
            case 'mysql':
                await mysqlTruncator(database, truncateTables)
                break
            case 'postgres':
                await postgesTruncator(database, truncateTables)
                break
            default:
                throw new Error('Invalid Database System')
        }

        if(logging) console.log('All tables have been truncated.')

    } catch (error) {
        if(logging) console.error(error)
        throw error
    }
}

async function mysqlTruncator(database, truncateTables = []){

    let tables
    
    if(truncateTables.length > 0 && truncateTables.every(item => typeof item === 'string')){
        tables = truncateTables
    }else if(truncateTables.length === 0){
        const tb = await selectTables(database)
        tables = tb
    }else{
        throw new Error ('Invalid table name format')
    }
    
    if(tables){
        return await database.query(`
            SET FOREIGN_KEY_CHECKS = 0; 
            ${tables.map(table => `TRUNCATE TABLE ${table};`).join('\n    ')}
            SET FOREIGN_KEY_CHECKS = 1;
        `)
    }else{
        if(logging) console.log('0 tables found')
    }
    
}

async function postgesTruncator(database, truncateTables = []){

    let tables

    if(truncateTables.length > 0 && truncateTables.every(item => typeof item === 'string')){
        tables = arr.join(', ')
    }else if(truncateTables.length === 0){
        const tb = await selectTables(database)
        tables = tb.join(', ')
    }else{
        throw new Error ('Invalid table name format')
    }

    if(tables){
        return await database.query(`
            TRUNCATE TABLE ${tables} RESTART IDENTITY;           
        `)
    }else{
        if(logging) console.log('0 tables found')
    }
}

async function selectTables(database){
    switch(db_system){
        case 'mysql':
            const [tables] = await database.query('SHOW TABLES')
            return tables.map(table => table[Object.keys(table)[0]])
        case 'postgres':
            const res = await database.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public';")
            return res.rows.map(row => row.table_name)
        default:
            throw new Error('Unknown Database System')
    }
}

async function dbConnector(){
    switch(db_system){
        case 'mysql':
            return await mysql.createConnection(db_config)
        case 'postgres':
            const client = new Client(db_config)
            await client.connect()
            return client
        default:
            throw new Error('Unknown Database System')
    }
}

function poolConnector(waitForConnections = true, connectionLimit = 10, queueLimit = 0){

    switch(db_system){
        case 'mysql':
            return mysql.createPool({
                ...db_config,
                waitForConnections,
                connectionLimit,
                queueLimit
            })
        case 'postgres':
            return new Pool({
                ...db_config,
                max: connectionLimit,
                idleTimeoutMillis: queueLimit
            })
        default:
            throw new Error('Unknown Database System')
    }
}

module.exports = {
    init: function () {
        const db = DbManager.getInstance(dbConnector)
        const pool = PoolManager.getInstance(poolConnector)
        return {
            db,
            pool,
            truncateAll: truncateManager
        }
    }
}