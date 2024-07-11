const router = require('express').Router()
const {sendResponse} = require('../controllers/base.controller')
const role = require('../controllers/role.controller')

// create new role
router.post('/', role.create, sendResponse)

// find role by params id
router.get('/:id', role.read, sendResponse) 

// find roles by request body
router.get('/', role.read, sendResponse) 

// update role
router.put('/', role.update, sendResponse) 

// delete role by params id
router.delete('/:id', role.destroy, sendResponse) 

module.exports = router