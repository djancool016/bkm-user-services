const {statusLogger, dataLogger} = require('../utils/httpLogger')
const {errorCode, endpointErrorHandler} = require('../utils/customError')

async function create(req, res, next, model){
    try {
        if(req.result?.httpCode > 299) return next()

        const result = await model.create(req.body)

        if(result.data){
            req.result = dataLogger({httpCode: 201, data: result.data})
        }else {
            throw result
        }
        // Continue to next middleware
        return next()
        
    } catch (error) {
        req.result = endpointErrorHandler(error)
        return next()
    }
}
async function read(req, res, next, model){
    try {
        if(req.result?.httpCode > 299) return next()
            
        let result 
        switch(requestType(req)){
            case 'query':
                result = await model.findByKeys(req.query)
                break
            case 'params':
                result = await model.findByPk(req.params.id)
                break
            case 'body':
                throw errorCode.ER_GET_REFUSE_BODY
            case 'empty':
                result = await model.findAll(req.body || req.query || {})
                break
            default:
                throw errorCode.ER_INVALID_BODY
        }

        if(result.data){
            req.result = dataLogger({httpCode: 200, data: result.data})
        }else{
            throw result
        }
        return next()

    } catch (error) {
        req.result = endpointErrorHandler(error)
        return next()
    }
}
async function update(req, res, next, model){
    try {
        if(req.result?.httpCode > 299) return next()

        const result = await model.update(req.body) 

        if(result.data){
            req.result = dataLogger({httpCode: 200, data: result.data})
        }else{
            throw result
        }
        return next()

    } catch (error) {
        req.result = endpointErrorHandler(error)
        return next()
    }
}
async function destroy(req, res, next, model){
    try {
        if(req.result?.httpCode > 299) return next()
    
        let id

        switch(requestType(req)){
            case 'query':
                id = req.query.id
                break
            case 'params':
                id = req.params.id
                break
            case 'body':
                id = req.body.id
                break
            default:
                throw errorCode.ER_INVALID_BODY
        }
        const result = await model.delete(id)

        if(result.data){
            req.result = dataLogger({httpCode: 200, data: result.data})
        }else{
            throw result
        }
        return next()

    } catch (error) {
        if(error.code == 'ER_ROW_IS_REFERENCED_2'){
            error.message = 'Id is used as foreign key'
        }
        req.result = endpointErrorHandler(error)
        return next()
    }
}
/**
 * Sends response based on request result.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
function sendResponse(req, res) {
    if(req.result){
        res.status(req.result.httpCode).json(req.result)
    }else {
        res.status(500).json(statusLogger({
            httpCode: 500, 
            message:'BaseControllerBadResponse'
        }))
    }
}

function requestType(req) {

    const isFindAll = () => {
        const data = req.body || req.query || {}
        const keys = Object.keys(data)
        return keys.length === 0 || 
        (keys.length === 1 && (keys.includes('size') || keys.includes('pageSize'))) ||
        (keys.length === 2 && keys.includes('size') && keys.includes('pageSize'))  
    }
    if (req.body && Object.keys(req.body).length > 0) {
        return 'body'
    }
    if (Array.isArray(req.body)) {
        return 'body_array'
    } 
    if (req.params && Object.keys(req.params).length > 0) {
        return 'params'
    }
    if (req.query && Object.keys(req.query).length > 0) {
        return 'query'
    }
    if (isFindAll()) {
        return 'empty'
    }
    return 'invalid'
}



module.exports = {
    create, read, update, destroy, sendResponse
}
