class GoogleCalendarParameterError extends Error {
    constructor(msg){
        super("Parameter error for Google Calendar API - " + msg);

        this.status = 400;
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = GoogleCalendarParameterError;