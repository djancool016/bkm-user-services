const router = require('express').Router()
const {sendResponse} = require('../controllers/base.controller')
const user = require('../controllers/user.controller')

// Register new user
router.post('/register', user.register, sendResponse)

// Login using credential username and password
router.post('/login', user.login, sendResponse)

// Authorize user using token
router.post('/auth', user.authorizeUser, sendResponse)

// Logout
router.post('/logout', user.logout, sendResponse)

// Find user by parameter id
router.post('/profile', user.profile, sendResponse)

// Find user by parameter id
router.get('/:id', user.read, sendResponse)

// Find user by query or body
router.get('/', user.read, sendResponse)

// Update user information
router.put('/', user.update, sendResponse)

// Delete user data
router.delete('/:id', user.destroy, sendResponse)

module.exports = router