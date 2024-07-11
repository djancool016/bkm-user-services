require('dotenv').config()
const {errorCode, errorHandler} = require('../utils/customError')
const bcrypt = require('bcrypt')

const MIN_PASSWORD_LENGTH = 6
const onlyLetters = /^[A-Za-z]+$/
const onlyNumbers = /^[0-9]+$/

/**
 * PasswordManager class for hashing password and compare password with hashed password
 */
class PasswordManager {

    /**
     * @param {String} password user input password
     * @param {Number} saltRounds rounds for hashing password, default = 10
     * @returns hashed password
     */
    static async encrypt({password, saltRounds = 10}){

        try {
            // check password
            if(!password) throw errorCode.ER_EMPTY_PASSWORD
            // check if password is string
            if(typeof password !== 'string') throw errorCode.ER_INVALID_PASSWORD_FORMAT
            // check if password length is too short
            if(password.length < MIN_PASSWORD_LENGTH) throw errorCode.ER_PASSWORD_TOO_SHORT
            // check if password is too weak
            if(this.isWeakPassword(password)) throw errorCode.ER_PASSWORD_TOO_WEAK


            // hashing password
            const salt = await bcrypt.genSalt(saltRounds)
            const hashedPassword = await bcrypt.hash(password, salt)
            if(!hashedPassword) throw errorCode.ER_HASHING_PASSWORD

            // returning hashed password
            return hashedPassword

        } catch (error) {
            throw errorHandler(error)
        }
    }
    /**
     * @param {String} password user input password
     * @param {String} hashedPassword hashed password from database
     * @returns Boolean
     */
    static async compare({password, hashedPassword}){

        try {
            // check password
            if(!password) throw errorCode.ER_EMPTY_PASSWORD
            // check if password is string
            if(typeof password !== 'string') throw errorCode.ER_INVALID_PASSWORD_FORMAT
            // check hashed password
            if(typeof hashedPassword !== 'string' || !hashedPassword) throw errorCode.ER_INVALID_HASH_FORMAT

            // compare password
            const result = await bcrypt.compare(password, hashedPassword)
            if(!result) throw errorCode.ER_INVALID_PASSWORD
            
            // returning true
            return result
        } catch (error) {
            throw errorHandler(error)
        }
    }
    /**
     * @param {String} password user input password
     * @returns Boolean
     */
    static isWeakPassword(password) {

        // check if password contains only letters or only numbers
        if (onlyLetters.test(password) || onlyNumbers.test(password)) return true

        // if none of the above conditions are met, the password is not weak
        return false
    }
}

module.exports = PasswordManager