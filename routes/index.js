const router = require('express').Router()

router.use('/role', require('./role.routes'))
router.use('/user', require('./user.routes'))

module.exports = (app) => {
    app.use('/api', router)
}