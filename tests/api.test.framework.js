const axios = require('axios')
const UnitTestFramework = require('./unit.test.framework')
const { axiosErrorHandler } = require('../utils/customError')

/**
 * Data-Driven Testing (DDT) for endpoint testing using axios
 */
class ApiTestFramework extends UnitTestFramework {
    /**
     * Constructor to initialize the EndpointTestFramework
     * @param {Object} testObj - Object containing test cases
     * @param {string} baseURL - Base URL for the API endpoints
     */
    constructor(testObj = {}, baseURL) {
        super(testObj)
        this.baseURL = baseURL // Store the base URL
    }
    
    /**
     * Method to test a specific endpoint with given test cases
     * @param {string} method - TestObj key for description
     * @param {Array} testCases - Array of test cases for the endpoint
     */
    testMethod(method, testCases) {
        testCases.forEach(testCase => {
            const {method: httpMethod, endpoint, input, output, description} = testCase // Destructure test case

            describe(`Test ${method} endpoint`, () => {
                test(description, async () => {
                    try {
                        let response
                        const config = {
                            headers: {
                                'Content-Type': 'application/json',
                            }
                        }
                        // Add headers for access token and refresh token from cookies
                        if (input.cookies) {
                            const accessToken = await input.cookies.accessToken
                            const refreshToken = await input.cookies.refreshToken
                            config.headers['Cookie'] = `accessToken=${accessToken}; refreshToken=${refreshToken}`
                        }
                        switch (httpMethod.toLowerCase()) {
                            case 'get':
                                response = await axios.get(`${this.baseURL}${endpoint}`, { params: input }, config)
                                break
                            case 'post':
                                response = await axios.post(`${this.baseURL}${endpoint}`, input, config)
                                break
                            case 'put':
                                response = await axios.put(`${this.baseURL}${endpoint}`, input, config)
                                break
                            case 'delete':
                                response = await axios.delete(`${this.baseURL}${endpoint}`, { data: input }, config)
                                break
                        }
                        const jsonResponse = await response.data
                        // Compare test result with expected output
                        this.resultBuilder(jsonResponse, output)
                    } catch (error) {
                        const err = axiosErrorHandler(error)
                        // Handle error and compare with expected output if any
                        expect(err).toEqual(expect.objectContaining(output))
                    }
                })
            })
        })
    }
}

module.exports = ApiTestFramework
