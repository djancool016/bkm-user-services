require('dotenv').config()
const util = require('util')
const {errorCode, errorHandler} = require('../utils/customError')

const jwt = require('jsonwebtoken')
const signAsync = util.promisify(jwt.sign)
const verifyAsync = util.promisify(jwt.verify)

/**
 * Generate and verify token for user authorization
 */
class TokenManager {
    /**
     * @param {Object} payload contains user data
     * @param {String} secret token secret from env file
     * @param {Number} expiresIn token expiration in second (default = 3600)
     * @returns string token
     */
    static async generateToken(payload, secret, expiresIn = 3600) {
        try {
            if(!payload || Object.keys(payload).length == 0) throw errorCode.ER_JWT_EMPTY_PAYLOAD
            if(!secret) throw errorCode.ER_JWT_EMPTY_SIGNATURE
            if(expiresIn <= 0) throw errorCode.ER_JWT_EXPIRED
            return await signAsync(payload, secret, payload.exp ? {} : { expiresIn })

        } catch (error) {
            throw errorHandler(error)
        }
    }
    /**
     * @param {String} token token for verification
     * @param {String} secret token secret from env file
     * @returns Promises contains payload
     */
    static async verifyToken(token, secret) {
        try {
            if(!token) throw errorCode.ER_JWT_NOT_FOUND
            if(!secret) throw errorCode.ER_JWT_EMPTY_SIGNATURE
            if (!token.startsWith('eyJ')) {
                throw errorCode.ER_JWT_MALFORMED
            }
            const payload = await verifyAsync(token, secret)
            if(payload) {
                if(!payload.iat || !payload.exp) throw errorCode.ER_JWT_EXPIRED
                if(payload.iat > payload.exp) throw errorCode.ER_JWT_EXPIRED

                const currentTime = Math.floor(Date.now() / 1000)
                const expiredTime = payload.exp - currentTime
                if(expiredTime <= 0) throw errorCode.ER_JWT_EXPIRED

                return payload
            }

        } catch (error) {
            if(error.message == 'invalid signature'){
                throw errorHandler(errorCode.ER_JWT_SIGNATURE_MISMATCH)
            }else if(error.message == 'jwt expired'){
                throw errorHandler(errorCode.ER_JWT_EXPIRED)
            }
            throw errorHandler(error)
        }
    }
    /**
     * @param {Object} payload contains client data { id, username }
     * @param {String} secret token secret (default = process.env.REFRESH_TOKEN_SECRET)
     * @param {Number} refreshTokenExpiration refresh token expiration in second (default = 86400)
     * @param {Number} accessTokenExpiration access token expiration in second (default = 3600)
     * @returns refreshToken & accessToken
     */
    static async authenticatedUser(
        payload, 
        secret = process.env.REFRESH_TOKEN_SECRET,
        refreshTokenExpiration = 86400, 
        accessTokenExpiration = 3600
    ) {
        try {
            const refreshToken = await TokenManager.generateToken(
                payload, secret, refreshTokenExpiration
            )
                
            const accessToken = await TokenManager.generateToken(
                payload, secret, accessTokenExpiration
            )
            if(!refreshToken || !accessToken) throw errorCode.ER_JWT_FAILED_CREATE_TOKEN
            return {refreshToken, accessToken}

        } catch (error) {
            errorHandler(error)
        }
    }
    
    /**
     * @param {String} accessToken require valid access token
     * @param {Number} refreshTokenExpiration refresh token expiration in second (default = 86400)
     * @param {Number} accessTokenExpiration access token expiration in second (default = 3600)
     * @returns new accessToken & refreshToken
     */
    static async tokenRotation(refreshToken, refreshTokenExpiration = 86400, accessTokenExpiration = 3600) {
        try {
            const payload = TokenManager.verifyToken(refreshToken, process.env.REFRESH_TOKEN_SECRET)

            return await TokenManager.authenticatedUser(
                payload, refreshTokenExpiration, accessTokenExpiration
            )

        } catch (error) {
            throw errorHandler(error)
        }
    }
}

module.exports = TokenManager
