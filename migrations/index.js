const Migration = require('./base.migrations')

/**
 * The object migrations contains keys for table names and values containing migration objects.
 */
const migrations = {
    roles: require('./202404271305-create-roles'),
    users: require('./202404271321-create-users')
}

module.exports = {
    /**
     * 
     * @param {Object} db Database connection 
     * @returns 
     */
    migration: (db) => Migration.migrate({migrations, db})
}