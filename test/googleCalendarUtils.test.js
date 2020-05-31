const validateEvent = require("../googleCalendarUtils").validateEventObject;
const GoogleCalendarParametersError = require("../errors/googleCalendarParameterError");

describe("Google Calendar utils - validateEventObject() function", () => {

    test("01 - Missing 'id' and 'group' - should throw", () => {
        const event = {
            from: "2020-05-30T21:00:00",
            to: "2020-05-30T22:00:00",
            others: ["mario.rossi@gmail.com", "luca.bianchi@gmail.com"],
            title: "Event title",
            description: "Event description",
            location: "Event location"
        };

        expect(() => validateEvent(event)).toThrowError(GoogleCalendarParametersError);
        expect(() => validateEvent(event)).toThrowError(/group/);
    });

    test("02 - 'id' is not a string - should throw", () => {
        const event = {
            id: [],
            from: "2020-05-30T21:00:00",
            to: "2020-05-30T22:00:00",
            others: ["mario.rossi@gmail.com", "luca.bianchi@gmail.com"],
            title: "Event title",
            description: "Event description",
            location: "Event location"
        };

        expect(() => validateEvent(event)).toThrowError(GoogleCalendarParametersError);
        expect(() => validateEvent(event)).toThrowError(/id/);
    });

    test("03 - 'group' is not a string - should throw", () => {
        const event = {
            group: [],
            from: "2020-05-30T21:00:00",
            to: "2020-05-30T22:00:00",
            others: ["mario.rossi@gmail.com", "luca.bianchi@gmail.com"],
            title: "Event title",
            description: "Event description",
            location: "Event location"
        };

        expect(() => validateEvent(event)).toThrowError(GoogleCalendarParametersError);
        expect(() => validateEvent(event)).toThrowError(/group/);
    });

    test("04 - 'from' date not specified - should throw", () => {
        const event = {
            id: "eventID",
            group: "group name",
            to: "2020-05-30T22:00:00",
            others: ["mario.rossi@gmail.com", "luca.bianchi@gmail.com"],
            title: "Event title",
            description: "Event description",
            location: "Event location"
        };

        expect(() => validateEvent(event)).toThrowError(GoogleCalendarParametersError);
        expect(() => validateEvent(event)).toThrowError(/from/);
    });

    test("05 - 'from' date not well formed - should throw", () => {
        const event = {
            id: "eventID",
            group: "group name",
            from: "2020-05-3021:00:00", //Missing 'T'
            to: "2020-05-30T22:00:00",
            others: ["mario.rossi@gmail.com", "luca.bianchi@gmail.com"],
            title: "Event title",
            description: "Event description",
            location: "Event location"
        };

        expect(() => validateEvent(event)).toThrowError(GoogleCalendarParametersError);
        expect(() => validateEvent(event)).toThrowError(/from/);
    });

    test("06 - 'to' date not specified - should throw", () => {
        const event = {
            id: "eventID",
            group: "group name",
            from: "2020-05-30T21:00:00",
            others: ["mario.rossi@gmail.com", "luca.bianchi@gmail.com"],
            title: "Event title",
            description: "Event description",
            location: "Event location"
        };

        expect(() => validateEvent(event)).toThrowError(GoogleCalendarParametersError);
        expect(() => validateEvent(event)).toThrowError(/to/);
    });

    test("07 - 'to' date not well formed - should throw", () => {
        const event = {
            id: "eventID",
            group: "group name",
            to: "2020-05-3022:00:00",   //Missing 'T'
            from: "2020-05-30T21:00:00",
            others: ["mario.rossi@gmail.com", "luca.bianchi@gmail.com"],
            title: "Event title",
            description: "Event description",
            location: "Event location"
        };

        expect(() => validateEvent(event)).toThrowError(GoogleCalendarParametersError);
        expect(() => validateEvent(event)).toThrowError(/to/);
    });

    test("08 - not valid dates - should throw", () => {
        const event = {
            id: "eventID",
            group: "group name",
            to: "2020-05-30T21:00:00",
            from: "2020-05-30T22:00:00",
            others: ["mario.rossi@gmail.com", "luca.bianchi@gmail.com"],
            title: "Event title",
            description: "Event description",
            location: "Event location"
        };

        expect(() => validateEvent(event)).toThrowError(GoogleCalendarParametersError);
        expect(() => validateEvent(event)).toThrowError(/valid/);
    });

    test("09 - 'others' contains not only strings - should throw", () => {
        const event = {
            id: "eventID",
            group: "group name",
            from: "2020-05-30T21:00:00",
            to: "2020-05-30T22:00:00",
            others: ["mario.rossi@gmail.com", "luca.bianchi@gmail.com", []],
            title: "Event title",
            description: "Event description",
            location: "Event location"
        };

        expect(() => validateEvent(event)).toThrowError(GoogleCalendarParametersError);
        expect(() => validateEvent(event)).toThrowError(/others/);
        expect(() => validateEvent(event)).toThrowError(/strings/);
    });

    test("10 - 'others' contains mails not well formed - should throw", () => {
        const event = {
            id: "eventID",
            group: "group name",
            from: "2020-05-30T21:00:00",
            to: "2020-05-30T22:00:00",
            others: ["mario.rossi@gmail.com", "luca.bianchigmail.com"],
            title: "Event title",
            description: "Event description",
            location: "Event location"
        };

        expect(() => validateEvent(event)).toThrowError(GoogleCalendarParametersError);
        expect(() => validateEvent(event)).toThrowError(/others/);
        expect(() => validateEvent(event)).toThrowError(/email/);
    });

    test("11 - 'title' not specified- should throw", () => {
        const event = {
            id: "eventID",
            group: "group name",
            from: "2020-05-30T21:00:00",
            to: "2020-05-30T22:00:00",
            others: ["mario.rossi@gmail.com", "luca.bianchi@gmail.com"],
            description: "Event description",
            location: "Event location"
        };

        expect(() => validateEvent(event)).toThrowError(GoogleCalendarParametersError);
        expect(() => validateEvent(event)).toThrowError(/title/);
    });

    test("12 - 'title' is not a string - should throw", () => {
        const event = {
            id: "eventID",
            group: "group name",
            from: "2020-05-30T21:00:00",
            to: "2020-05-30T22:00:00",
            others: ["mario.rossi@gmail.com", "luca.bianchi@gmail.com"],
            title: [],
            description: "Event description",
            location: "Event location"
        };

        expect(() => validateEvent(event)).toThrowError(GoogleCalendarParametersError);
        expect(() => validateEvent(event)).toThrowError(/title/);
    });

    test("13 - 'description' is not a string - should throw", () => {
        const event = {
            id: "eventID",
            group: "group name",
            from: "2020-05-30T21:00:00",
            to: "2020-05-30T22:00:00",
            others: ["mario.rossi@gmail.com", "luca.bianchi@gmail.com"],
            title: "Event title",
            description: [],
            location: "Event location"
        };

        expect(() => validateEvent(event)).toThrowError(GoogleCalendarParametersError);
        expect(() => validateEvent(event)).toThrowError(/description/);
    });

    test("14 - 'location' is not a string - should throw", () => {
        const event = {
            id: "eventID",
            group: "group name",
            from: "2020-05-30T21:00:00",
            to: "2020-05-30T22:00:00",
            others: ["mario.rossi@gmail.com", "luca.bianchi@gmail.com"],
            title: "Event title",
            description: "Event description",
            location: []
        };

        expect(() => validateEvent(event)).toThrowError(GoogleCalendarParametersError);
        expect(() => validateEvent(event)).toThrowError(/location/);
    });

    test("15 - Event object well formed - should return true", () => {
        const event = {
            id: "eventID",
            group: "group name",
            from: "2020-05-30T21:00:00",
            to: "2020-05-30T22:00:00",
            others: ["mario.rossi@gmail.com", "luca.bianchi@gmail.com"],
            title: "Event title",
            description: "Event description",
            location: "Event location"
        };

        expect(() => validateEvent(event)).toBeTruthy();
    });
});