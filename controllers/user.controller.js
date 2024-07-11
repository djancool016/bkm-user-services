const UserModel = require('../models/user.model')
const baseController = require('./base.controller')
const TokenManager = require("../utils/tokenManager")
const {errorCode, endpointErrorHandler} = require('../utils/customError')
const {dataLogger, statusLogger} = require('../utils/httpLogger')
const PasswordManager = require('../utils/passwordManager')
const tokenSecret = {
    accessToken: process.env.ACCESS_TOKEN_SECRET,
    refreshToken: process.env.REFRESH_TOKEN_SECRET
}

/**
 * Fonction for rotate or renew JWT Token
 */
async function rotateToken(req, res, next, cookies = setCookies, secret = tokenSecret){
    try {
        // go to next middleware if error occured
        if(req.result?.status === false) return next()

        // get refreshToken from header
        const {refreshToken} = isTokenExist(req)

        // validate token and get payload
        const payload = await validateToken(refreshToken, secret.refreshToken)

        // rotate tokens
        const tokens = await handleTokenRotation(payload, secret.refreshToken)
        
        // send token as Http-only cookies
        cookies(res, tokens)
        
        return next()

    } catch (error) {
        if(error.message == 'jwt malformed'){
            error['code'] = 'ER_JWT_MALFORMED'
        }
        req.result = endpointErrorHandler(error)
        return next()
    }
}
/**
 * function for authorize user using JWT Token
 */
async function authorizeUser(req, res, next, cookies = setCookies, secret = tokenSecret){
    try {
        // check if token exist
        const{refreshToken, accessToken} = isTokenExist(req)

        // get payload data
        let payload = await validateToken(accessToken, secret.accessToken)
        let user

        // validate payload data
        if(payload) {
            user = await getUserData(payload)
        }else{
            await rotateToken(req, res, next, cookies, secret)
            user = await getUserData(payload)
        }

        if(!user.data) throw errorCode.ER_JWT_PAYLOAD_INVALID
        
        // add user data into request payload
        const {password, ...rest} = user.data[0]
        req.result = dataLogger({data: rest})

        // run next middleware
        return next()

        // returning validated payload data

    } catch (error) {
        req.result = endpointErrorHandler(error)
        return next()
    }
}
/**
 * Function for handling user login using 
 * authorizeUser (JWT Token) or authenticateUser (user credential)
 */
async function login(req, res, next, cookies = setCookies, secret = tokenSecret) {
    try {
        // check if token exist
        const refreshToken = req?.cookies?.refreshToken
        const accessToken = req?.cookies?.accessToken

        if (accessToken && refreshToken) {
            // use authorizeUser if tokens exist
            return await authorizeUser(req, res, next, cookies, secret)
        } else if (req.body?.username || req.body?.password) {
            // use authenticateUser if tokens do not exist
            return await authenticateUser(req, res, next, cookies, secret)
        } else {
            // throw forbidden if no token and no credentials
            throw errorCode.ER_ACCESS_DENIED_ERROR
        }
    } catch (error) {
        req.result = endpointErrorHandler(error)
        return next()
    }
}
/**
 * Function to authenticate user using username and password
 */
async function authenticateUser(req, res, next, cookies = setCookies, secret = tokenSecret) {
    try {
        if(!req.body) throw errorCode.ER_INVALID_BODY
        const { username, password } = req.body

        // Validate username and password
        if (!username || !password) {
            throw errorCode.ER_INVALID_CREDENTIALS
        }
        const model = new UserModel()
        // Fetch user data from database
        const user = await model.findByKeys({username}, false)
        if (!user.data[0]) throw errorCode.ER_NOT_FOUND

        const {password: hash, ...data} = user.data[0]

        if(!hash) throw errorCode.ER_EMPTY_HASHED_PASSWORD

        // Verify password
        const isPasswordValid = await PasswordManager.compare({password, hashedPassword: hash})
        if (!isPasswordValid) throw errorCode.ER_INVALID_PASSWORD

        // Generate tokens
        const payload = { id: data.id, username: data.username }
        const tokens = await TokenManager.authenticatedUser(payload, secret.refreshToken)

        // Set cookies
        cookies(res, tokens);

        req.result = dataLogger({ data })

        // Run next middleware
        return next()
    } catch (error) {
        req.result = endpointErrorHandler(error)
        return next()
    }
}
/**
 * Function for deauthenticate user by revoke token from client side cookies
 */
async function logout(req, res, next) {
    try {
        // Clear cookies
        res.clearCookie('accessToken', {
            httpOnly: true,
            secure: true,
            sameSite: 'strict'
        });
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: true,
            sameSite: 'strict'
        });

        req.result = statusLogger({httpCode: 200, message: 'Logout successful'})

        // Run next middleware
        return next()
    } catch (error) {
        req.result = endpointErrorHandler(error)
        return next()
    }
}
/**
 * Function for create new user
 */
async function register(req, res, next, cookie = setCookies, secret = tokenSecret) {
    try {
        if (!req.body || !req.body.password) throw errorCode.ER_INVALID_BODY
        const { password, ...userData } = req.body

        const model = new UserModel()

        // Hash password
        const hashedPassword = await PasswordManager.encrypt({password})

        // Create new user
        const newUser = await model.create({ password: hashedPassword , ...userData})
        const user = await model.findByPk(newUser.data.insertId)

        if(!user.data[0]) throw errorCode.ER_NOT_FOUND

        const{id, username, ...rest} = user.data[0]

        // Generate tokens
        const payload = { id, username }
        const tokens = await TokenManager.authenticatedUser(payload, secret.refreshToken)

        // Set cookies
        cookie(res, tokens)

        req.result = statusLogger({httpCode: 201})

        // Run next middleware
        return next()
    } catch (error) {
        req.result = endpointErrorHandler(error)
        return next()
    }
}
/**
 * Function for retrieve user information
 */
async function profile(req, res, next, cookie = setCookies, secret = tokenSecret) {
    try {
        const { refreshToken } = isTokenExist(req)
        
        const payload = await validateToken(refreshToken, secret.refreshToken)
        const user = await getUserData(payload)

        const {password, ...rest} = user.data[0]

        if (rest) {
            req.result = dataLogger({ httpCode: 200, data: rest })
        } else {
            throw errorCode.ER_NOT_FOUND
        }

        return next()
    } catch (error) {
        req.result = endpointErrorHandler(error)
        return next()
    }
}

function setCookies(res, tokens) {
    Object.entries(tokens).forEach(([tokenName, tokenValue]) => {
        res.cookie(tokenName, tokenValue, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict'
        })
    })
}

function isTokenExist(req){
    const refreshToken = req?.cookies?.refreshToken
    const accessToken = req?.cookies?.accessToken

    const isJwtToken = (token) => {
        const jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/
        return jwtRegex.test(token)
    }
    if(!refreshToken || !accessToken){
        throw errorCode.ER_JWT_NOT_FOUND
    }else if(!isJwtToken(refreshToken) || !isJwtToken(accessToken)){
        throw errorCode.ER_JWT_MALFORMED
    }else{
        return {refreshToken, accessToken}
    }
}
async function handleTokenRotation(payload, secret){
    const tokens = await TokenManager.authenticatedUser(payload, secret)
    if (tokens && tokens.refreshToken && tokens.accessToken) {
        return tokens
    } else {
        throw errorCode.ER_JWT_INVALID
    }
}
async function validateToken(token, secret){
    // validate token and get payload
    const payload = await TokenManager.verifyToken(token, secret)
    if(payload) return payload
}

async function getUserData(payload) {
    const model = new UserModel()
    const user = await model.findByPk(payload.id)
    if (user) return user
    throw errorCode.ER_JWT_PAYLOAD_INVALID
}

const controller = (method) => (req, res, next) => {
    return baseController[method](req, res, next, model = new UserModel())
}

module.exports = {
    rotateToken, 
    authorizeUser, 
    authenticateUser, 
    login, 
    register, 
    logout,
    profile,
    create: controller('create'),
    read: controller('read'),
    update: controller('update'),
    destroy: controller('destroy')
}

