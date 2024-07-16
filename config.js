require('dotenv').config()

const config = {
    // database configuration
    db_config: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB
    },
    logging: process.env.CONSOLE_LOG === '1',
    resetTables: process.env.TRUNCATING === '1',
    migrating: process.env.MIGRATING === '1',
    seeding: process.env.SEEDING === '1'
}

module.exports = config