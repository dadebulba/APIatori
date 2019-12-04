module.exports = {
    PARAMS_UNDEFINED: {
        code: 'A0001',
        message: 'some parameters missing'
    },
    INVALID_CREDENTIALS: {
        code: 'A0002',
        message: 'invalid credentials'
    },
    INVALID_TOKEN: {
        code: 'A0003',
        message: 'invalid token'
    },
    TOKEN_EXPIRED: {
        code: 'A0004',
        message: 'token expired'
    },
    ACCESS_NOT_GRANTED: {
        code: 'A0005',
        message: 'you do not have the permission to call this api with specified parameters'
    },
    INVALID_DATA: {
        code: 'A0006',
        message: 'parameters do not represents actual object inside db'
    },
    ENTITY_NOT_FOUND: {
        code: 'A0007',
        message: 'entity has not been found'
    },
    PARAMS_WRONG_TYPE: {
        code: 'A0008',
        message: 'some param type is wrong or cannot be cast to the correct one'
    }
};