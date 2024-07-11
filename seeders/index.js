const Seeder = require('./base.seeder')

const seeds = {
    rolesSeed: require('./202404291044-roles-seed'),
    usersSeed: require('./202404291121-users-seed')
}

async function seedTables(db) {
    const arraySeeds = Object.values(seeds)
    await Seeder.seedTables(arraySeeds, db)
}

module.exports = {
    seedTables: (db) => seedTables(db)
}