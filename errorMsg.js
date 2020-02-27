module.exports = {
    PARAMS_UNDEFINED: {
        code: 'E001',
        message: 'some parameters missing'
    },
    INVALID_CREDENTIALS: {
        code: 'E002',
        message: 'invalid credentials'
    },
    INVALID_TOKEN: {
        code: 'E003',
        message: 'invalid token'
    },
    TOKEN_EXPIRED: {
        code: 'E004',
        message: 'token expired'
    },
    ACCESS_NOT_GRANTED: {
        code: 'E005',
        message: 'you do not have the permission to call this api with specified parameters'
    },
    INVALID_DATA: {
        code: 'E006',
        message: 'parameters do not represents actual object inside db'
    },
    ENTITY_NOT_FOUND: {
        code: 'E007',
        message: 'entity has not been found'
    },
    PARAMS_WRONG_TYPE: {
        code: 'E008',
        message: 'some param type is wrong or cannot be cast to the correct one'
    },
    CANCER_EXCEPTION: {
        code: 'E009',
        message: 'someone attempted a carcinogenic action'
    },
    DATETIME_INVALID: {
        code: 'E010',
        message: 'invalid date-time format'
    },
    ALREADY_RESERVED: {
        code: 'E011',
        message: 'the space for the specified date and time is already reserved'
    },
    ALREADY_PRESENT: {
        code: 'E012',
        message: 'the entity is already present inside the DB'
    },
};