require('dotenv').config()

module.exports = {
    // database configuration
    db_config: {
        host: 'localhost',
        user: 'root',
        password: process.env.LOCAL_DB_PASSWORD,
        database: 'bkm_db_test'
    },
    logging: true,
    resetTables: true,
    migrating: true,
    seeding: true
}