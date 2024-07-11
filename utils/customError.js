const logging = require('../config').logging

class CustomError extends Error {
    constructor(errorCode, originalError) {
        super(errorCode.message)
        this.name = this.constructor.name
        this.httpCode = errorCode.httpCode
        this.type = errorCode.type
        this.code = errorCode.code
        if (originalError && originalError.stack) {
            this.stack = `${this.stack}\nCaused by: ${originalError.stack}`
        }
    }
}

function createError(httpCode, type, code, message) {
    return { httpCode, type, code, message }
}

function errorHandler(error) {
    try {
        const errorDetail = errorCode[error.code] || errorCode.INTERNAL_SERVER_ERROR
        throw new CustomError(errorDetail, error)
    } catch (err) {
        if (logging) console.error(err)
        throw err
    }
}

function endpointErrorHandler(error){
    return {
        httpCode: error.httpCode || errorCode.INTERNAL_SERVER_ERROR.httpCode, 
        code: error.code || errorCode.INTERNAL_SERVER_ERROR.code,
        message: error.message || errorCode.INTERNAL_SERVER_ERROR.message
    }
}

function axiosErrorHandler(error) {
    const err = error.response?.data || error
    const errorDetail = errorCode[err.code] || errorCode.INTERNAL_SERVER_ERROR
    const customError = new CustomError(errorDetail, err)
    if(logging) console.error(customError)
    return {
        httpCode: customError.httpCode || errorCode.INTERNAL_SERVER_ERROR.httpCode, 
        code: customError.code || errorCode.INTERNAL_SERVER_ERROR.code,
        message: customError.message || errorCode.INTERNAL_SERVER_ERROR.message
    }
}


const errorCode = {
    // Database Error Cases
    'ER_ACCESS_DENIED_ERROR': createError(403, 'DB_Error', 'ER_ACCESS_DENIED_ERROR', 'Access denied'),
    'ER_BAD_DB_ERROR': createError(404, 'DB_Error', 'ER_BAD_DB_ERROR', 'Database not found'),
    'ER_PARTIAL_BULK_ENTRY': createError(207, 'DB_Error', 'ER_PARTIAL_BULK_ENTRY', 'Part of operations is terminated'),
    'ER_NOT_FOUND': createError(404, 'DB_Error', 'ER_NOT_FOUND', 'Resource not found'),
    'ER_DUP_ENTRY': createError(409, 'DB_Error', 'ER_DUP_ENTRY', 'Duplicate entry'),
    'ER_NO_SUCH_TABLE': createError(404, 'DB_Error', 'ER_NO_SUCH_TABLE', 'Table not found'),
    'ER_NO_DATA': createError(404, 'DB_Error', 'ER_NO_DATA', 'No data found'),
    'ER_PARSE_ERROR': createError(400, 'DB_Error', 'ER_PARSE_ERROR', 'Parse error'),
    'ER_INVALID_BODY': createError(400, 'DB_Error', 'ER_INVALID_BODY', 'Invalid request body'),
    'ER_BAD_FIELD_ERROR': createError(400, 'DB_Error', 'ER_BAD_FIELD_ERROR', 'Invalid field key'),
    'ER_CREATE_FAILED': createError(500, 'DB_Error', 'ER_CREATE_FAILED', 'Failed to create resource'),
    'ER_ROW_IS_REFERENCED_2': createError(400, 'DB_Error', 'ER_ROW_IS_REFERENCED_2', 'Row is referenced'),
    'ER_CON_COUNT_ERROR': createError(503, 'DB_Error', 'ER_CON_COUNT_ERROR', 'Connection count error'),
    'ER_DB_CREATE_EXISTS': createError(409, 'DB_Error', 'ER_DB_CREATE_EXISTS', 'Database already exists'),
    'ER_TABLE_EXISTS_ERROR': createError(409, 'DB_Error', 'ER_TABLE_EXISTS_ERROR', 'Table already exists'),
    'ER_LOCK_WAIT_TIMEOUT': createError(503, 'DB_Error', 'ER_LOCK_WAIT_TIMEOUT', 'Lock wait timeout'),
    'ER_DATA_TOO_LONG': createError(400, 'DB_Error', 'ER_DATA_TOO_LONG', 'Data too long'),
    'ER_TRUNCATED_WRONG_VALUE': createError(400, 'DB_Error', 'ER_TRUNCATED_WRONG_VALUE', 'Truncated wrong value'),
    'ER_MALFORMED_PACKET': createError(400, 'DB_Error', 'ER_MALFORMED_PACKET', 'Malformed packet'),

    // JWT Error Cases
    'ER_JWT_FAILED_CREATE_TOKEN': createError(401, 'JWT_Error', 'ER_JWT_FAILED_CREATE_TOKEN', 'Failed to create new token'),
    'ER_JWT_MALFORMED': createError(401, 'JWT_Error', 'ER_JWT_MALFORMED', 'JWT Malformed'),
    'ER_JWT_NOT_FOUND': createError(401, 'JWT_Error', 'ER_JWT_NOT_FOUND', 'JWT Not Found'),
    'ER_JWT_EMPTY_PAYLOAD': createError(401, 'JWT_Error', 'ER_JWT_EMPTY_PAYLOAD', 'JWT Empty Payload'),
    'ER_JWT_EXPIRED': createError(401, 'JWT_Error', 'ER_JWT_EXPIRED', 'JWT Expired'),
    'ER_JWT_EMPTY_SIGNATURE': createError(401, 'JWT_Error', 'ER_JWT_EMPTY_SIGNATURE', 'JWT Signature Empty'),
    'ER_JWT_PAYLOAD_INVALID': createError(401, 'JWT_Error', 'ER_JWT_PAYLOAD_INVALID', 'JWT Payload Invalid'),
    'ER_JWT_INVALID': createError(401, 'JWT_Error', 'ER_JWT_INVALID', 'JWT Invalid'),
    'ER_JWT_SIGNATURE_MISMATCH': createError(401, 'JWT_Error', 'ER_JWT_SIGNATURE_MISMATCH', 'JWT Signature Mismatch'),
    'ER_JWT_ALGORITHM_NOT_SUPPORTED': createError(401, 'JWT_Error', 'ER_JWT_ALGORITHM_NOT_SUPPORTED', 'JWT Algorithm Not Supported'),
    'ER_JWT_ISSUER_INVALID': createError(401, 'JWT_Error', 'ER_JWT_ISSUER_INVALID', 'JWT Issuer Invalid'),
    'ER_JWT_AUDIENCE_INVALID': createError(401, 'JWT_Error', 'ER_JWT_AUDIENCE_INVALID', 'JWT Audience Invalid'),

    // User Form Error Cases
    'ER_EMPTY_CREDENTIALS': createError(400, 'Input_Error', 'ER_EMPTY_CREDENTIALS', 'Empty user credential'),
    'ER_EMPTY_PASSWORD': createError(400, 'Input_Error', 'ER_EMPTY_PASSWORD', 'Empty Password'),
    'ER_INVALID_PASSWORD': createError(400, 'Input_Error', 'ER_INVALID_PASSWORD', 'Invalid Password'),
    'ER_INVALID_CREDENTIALS': createError(400, 'Input_Error', 'ER_INVALID_CREDENTIALS', 'Invalid Username or Password'),
    'ER_INVALID_PASSWORD_FORMAT': createError(400, 'Input_Error', 'ER_INVALID_PASSWORD_FORMAT', 'Invalid Password Format'),
    'ER_INVALID_USERNAME': createError(400, 'Input_Error', 'ER_INVALID_USERNAME', 'Invalid Username'),
    'ER_USERNAME_TAKEN': createError(409, 'Input_Error', 'ER_USERNAME_TAKEN', 'Username already taken'),
    'ER_EMAIL_TAKEN': createError(409, 'Input_Error', 'ER_EMAIL_TAKEN', 'Email already taken'),
    'ER_INVALID_EMAIL': createError(400, 'Input_Error', 'ER_INVALID_EMAIL', 'Invalid Email'),
    'ER_PASSWORD_TOO_SHORT': createError(400, 'Input_Error', 'ER_PASSWORD_TOO_SHORT', 'Password too short'),
    'ER_PASSWORD_TOO_WEAK': createError(400, 'Input_Error', 'ER_PASSWORD_TOO_WEAK', 'Password too weak'),

    // Query Builder Error
    'ER_INVALID_QUERY_PARAMS': createError(500, 'Query_Error', 'ER_INVALID_QUERY_PARAMS', 'Invalid query builder params'),

    // Password Manager Error
    'ER_INVALID_HASH_FORMAT': createError(500, 'Password_Manager_Error', 'ER_HASHING_PASSWORD', 'Password Hashing Error'),
    'ER_EMPTY_HASHED_PASSWORD': createError(500, 'Password_Manager_Error', 'ER_EMPTY_HASHED_PASSWORD', 'Empty Hashed Password'),
    'ER_COMPARE_PASSWORD': createError(500, 'Password_Manager_Error', 'ER_COMPARE_PASSWORD', 'Error compare password with hash'),

    // Internal Model Error
    'ER_INVALID_METHOD': createError(500, 'Model_Error', 'ER_INVALID_METHOD', 'Invalid method is called'),
    'ER_QUERY_ERROR': createError(500, 'Model_Error', 'ER_QUERY_PARAM', 'Query id not defined'),
    'ER_AUTHENTICATION_FAILED': createError(401, 'Authentication_Error', 'ER_AUTHENTICATION_FAILED', 'Authentication failed'),

    // unknown error
    'INTERNAL_SERVER_ERROR': createError(500, 'Unknown_Error', 'INTERNAL_SERVER_ERROR', 'Internal server error'),

    // Error Http Status
    'BAD_REQUEST': createError(400, 'Http_Error', 'BAD_REQUEST', 'Bad Request'),
    'UNAUTHORIZED': createError(401, 'Http_Error', 'UNAUTHORIZED', 'Unauthorized'),
    'FORBIDDEN': createError(403, 'Http_Error', 'FORBIDDEN', 'Forbidden'),
    'NOT_FOUND': createError(404, 'Http_Error', 'NOT_FOUND', 'Not Found'),
    'CONFLICT': createError(409, 'Http_Error', 'CONFLICT', 'Conflict'),
    'SERVICE_NOT_AVAILABLE': createError(503, 'Http_Error', 'SERVICE_NOT_AVAILABLE', 'Service Not Available'),
    'GATEWAY_TIMEOUT': createError(504, 'Http_Error', 'GATEWAY_TIMEOUT', 'Gateway Timeout'),
    'ER_GET_REFUSE_BODY': createError(400, 'Http_Error', 'ER_GET_REFUSE_BODY', 'Request body is not allowed in GET request')
}

module.exports = {errorCode, errorHandler, axiosErrorHandler, endpointErrorHandler}