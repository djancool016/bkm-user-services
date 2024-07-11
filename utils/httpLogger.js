// Constants for HTTP status codes
const HttpStatus = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    PARTIAL_CONTENT: 207,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_NOT_AVAILABLE: 503,
    GATEWAY_TIMEOUT: 504,
}

/**
 * Logs HTTP status code and message.
 * @param {object} param - Parameters.
 * @param {number} param.httpCode - HTTP status code.
 * @param {string} [param.message=''] - Custom log message. If empty, auto-fills with HTTP status code description.
 * @returns {object} - Log object containing httpCode, status, and message.
 */
function statusLogger({httpCode, message = ''}){

    try {

        if(!httpCode) throw new Error('EmptyHttpCode')
        if(invalidStatusCode(httpCode)) throw new Error('InvalidHttpCode')

        let status
        let defaultMessage

        switch (httpCode) {
            case HttpStatus.OK:
            case HttpStatus.NO_CONTENT:
            case HttpStatus.PARTIAL_CONTENT:
            case HttpStatus.CREATED:
                status = true
                defaultMessage = message || getHttpStatusByValue(httpCode)
                break
            default:
                status = false
                defaultMessage = message || getHttpStatusByValue(httpCode) || 'Invalid Status Code'
                break
        }
        return { httpCode, status, message: defaultMessage }

    } catch (error) {
        
        switch(error.message){
            case 'EmptyHttpCode': 
                return statusLogger({httpCode: 500, message: 'Empty HTTP Code'})
            case 'InvalidHttpCode':
                return statusLogger({httpCode: 500, message: 'Invalid HTTP Code'})
            default:
                return statusLogger({httpCode: 500, message: error.message})
        }       
    }
}
/**
 * Logs HTTP data.
 * @param {object} param - Parameters.
 * @param {object} param.data - Data to log.
 * @param {string} [param.message=''] - Custom log message.
 * @param {number} [param.httpCode=200] - HTTP status code.
 * @returns {object} - Log object containing httpCode, data, status, and message.
 */
function dataLogger({data, message = '', httpCode = 200}){

    try {

        if(!data || Object.keys(data).length < 1) throw new Error('EmptyData')

        return {httpCode, data, status: true, message: message || 'OK'}

    } catch (error) { 
        switch(error.message){
            case 'EmptyData': 
                return statusLogger({httpCode: 404, message: 'Empty Payload Data'})
            default:
                return statusLogger({httpCode: 500, message: error.message})
        }      
    }
}

/**
 * Function to format status string.
 * @param {string} statusString - String representation of HTTP status code.
 * @returns {string} - Formatted status string.
 */
function formatStatusString(statusString) {
    const words = statusString.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    return words.join(' ')
}

/**
 * Function to get HTTP status string by value.
 * @param {number} value - HTTP status code.
 * @returns {string} - Formatted HTTP status string.
 */
function getHttpStatusByValue(value) {
    const key = Object.keys(HttpStatus).find((key) => HttpStatus[key] === value)
    return key ? formatStatusString(key) : ''
}

function invalidStatusCode(statusCode) {
    for (let key in HttpStatus) {
        if (HttpStatus[key] === statusCode) {
            return false // Status code is in the list
        }
    }
    return true // Status code is not in the list
}

module.exports = { statusLogger, dataLogger }