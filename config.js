const fs = require('fs')
const path = require('path')
const dotenv = require('dotenv')

const env = process.env.NODE_ENV || 'development'
const envFile = path.resolve(__dirname, `.env.${env}`)

if (fs.existsSync(envFile)) {
  dotenv.config({ path: envFile })
} else {
  console.error(`Environment file ${envFile} not found`)
  process.exit(1)
}

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