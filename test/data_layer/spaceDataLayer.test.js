const mockSpaces = require("../data/spaces.json");

process.env.MOCK_SPACES = JSON.stringify(mockSpaces);
const spaceDL = require("../../data_layer/space_data_layer/spaceDataLayer");

//Data layer APIs
const getAllSpaces = spaceDL.getAllSpaces;
const getSpace = spaceDL.getSpace;
const createSpace = spaceDL.createSpace;
const modifySpace = spaceDL.modifySpace;
const deleteSpace = spaceDL.deleteSpace;
const getAllBookingsForSpace = spaceDL.getAllBookingsForSpace;
const getBookingForSpace = spaceDL.getBookingForSpace;
const createBookingForSpace = spaceDL.createBookingForSpace;
const modifyBookingForSpace = spaceDL.modifyBookingForSpace;
const deleteBookingForSpace = spaceDL.deleteBookingForSpace;

//Errors
const ParametersError = require("../../errors/parametersError");
const IntervalOverlapError = require("../../errors/intervalOverlapError");
const SpaceAlreadyExistsError = require("../../errors/spaceAlreadyExistsError");

beforeAll(async () => {
    await spaceDL.init();

    //Retrive id of the inserted mocked data
    let data = await getAllSpaces();
    if (data == undefined)
        process.exit(1);

    for (var i=0; i<mockSpaces.length; i++)
        mockSpaces[i].sid = data[i].sid;

    //Insert two mock bookings for the first space for testing purpose
    const bookingData1 = {
        uid: mockSpaces[0].sid, //It performs only a validation check of the id string
        gid: mockSpaces[0].sid,
        from: "2222-02-24T20:00:00.000Z",
        to: "2222-02-24T23:00:00.000Z",
        type: "attivita",
        eventId: "eventID"
    }
    const bookingData2 = {
        uid: mockSpaces[0].sid, //It performs only a validation check of the id string
        gid: mockSpaces[0].sid,
        from: "2222-06-24T20:00:00.000Z",
        to: "2222-06-24T23:00:00.000Z",
        type: "attivita",
        eventId: "eventID"
    }
    const bookingData3 = {
        uid: mockSpaces[0].sid, //It performs only a validation check of the id string
        gid: mockSpaces[0].sid,
        from: "2222-11-24T20:00:00.000Z",
        to: "2222-11-24T23:00:00.000Z",
        type: "attivita",
        eventId: "eventID"
    }

    var res = await createBookingForSpace(mockSpaces[0].sid, bookingData1);
    if (res == undefined)
        process.exit(1);
    
    mockSpaces[0].bookings = [];
    mockSpaces[0].bookings.push(res);

    res = await createBookingForSpace(mockSpaces[0].sid, bookingData2);
    if (res == undefined)
        process.exit(1);
    
    mockSpaces[0].bookings.push(res);

    res = await createBookingForSpace(mockSpaces[0].sid, bookingData3);
    if (res == undefined)
        process.exit(1);
    
    mockSpaces[0].bookings.push(res);
});

describe("Get all spaces", () => {
    test("01 - Retrieve all spaces - should return a list", () => {
        getAllSpaces().then(data => {
            expect(data).not.toBeUndefined();
            expect(data.length).toBe(mockSpaces.length);
        })
    });
});

describe("Get space by id", () => {
    test("01 - sid not specified - should throw", async () => {
        await expect(getSpace()).rejects.toThrow(ParametersError);
    });

    test("02 - sid is undefined - should throw", async () => {
        const sid = undefined;

        await expect(getSpace(sid)).rejects.toThrow(ParametersError);
    });

    test("03 - sid is an array - should throw", async () => {
        const sid = [];

        await expect(getSpace(sid)).rejects.toThrow(ParametersError);
    });

    test("04 - sid not exists - should return null", async () => {
        const sid = mockSpaces[0].sid.substring(0, mockSpaces[0].sid.length-5) + "abcde";
        const res = await getSpace(sid);
        expect(res).toBeUndefined();
    });

    test("05 - sid is valid - should return the space", async () => {
        const sid = mockSpaces[0].sid;
        const res = await getSpace(sid);

        expect(res).not.toBeUndefined();
    });
});

describe("Create new spaces", () => {
    test("01 - name not specified - should throw", async () => {
        await expect(createSpace()).rejects.toThrow(ParametersError);
    });

    test("02 - name is undefined - should throw", async () => {
        const name = undefined;

        await expect(createSpace(name)).rejects.toThrow(ParametersError);
    });

    test("03 - name is not a string - should throw", async () => {
        const name = [];
        
        await expect(createSpace(name)).rejects.toThrow(ParametersError);
    });

    test("04 - name is an empty string - should throw", async () => {
        const name = "";
        
        await expect(createSpace(name)).rejects.toThrow(ParametersError);
    });

    test("05 - already exist a space with that name - should throw", async () => {
        const name = mockSpaces[0].name;

        await expect(createSpace(name)).rejects.toThrow(SpaceAlreadyExistsError);
    });

    test("06 - name is valid - should create", async () => {
        const name = "Dinamic";
        const res = await createSpace(name);
        expect(res).not.toBeUndefined();
    });
});

describe("Modify an existing space", () => {
    test("01 - sid not specified, name not specified - should throw", async () => {
        const sid = undefined;
        const name = "New name from test";

        await expect(modifySpace()).rejects.toThrow(ParametersError);
    });

    test("02 - sid not specified, valid name - should throw", async () => {
        const sid = undefined;
        const name = "New name from test";

        await expect(modifySpace(name)).rejects.toThrow(ParametersError);
    });

    test("03 - Valid sid, name not specified - should throw", async () => {
        const sid = mockSpaces[0].sid;
        const name = "New name from test";

        await expect(modifySpace(sid)).rejects.toThrow(ParametersError);
    });

    test("04 - sid undefined - should throw", async () => {
        const sid = undefined;
        const name = "New name from test";

        await expect(modifySpace(sid, name)).rejects.toThrow(ParametersError);
    });

    test("05 - name undefined - should throw", async () => {
        const sid = mockSpaces[0].sid;
        const name = undefined;

        await expect(modifySpace(sid, name)).rejects.toThrow(ParametersError);
    });

    test("06 - sid is an array - should throw", async () => {
        const sid = [];
        const name = "New name from test";

        await expect(modifySpace(sid, name)).rejects.toThrow(ParametersError);
    });

    test("07 - name is an array - should throw", async () => {
        const sid = mockSpaces[0].sid;
        const name = undefined;

        await expect(modifySpace(sid, name)).rejects.toThrow(ParametersError);
    });

    test("08 - name is an empty string - should throw", async () => {
        const sid = mockSpaces[0].sid;
        const name = "";

        await expect(modifySpace(sid, name)).rejects.toThrow(ParametersError);
    });

    test("09 - sid not exists - should return undefined", async () => {
        const sid = mockSpaces[0].sid.substring(0, mockSpaces[0].sid.length-5) + "abcde";
        const name = "New name from test";

        const res = await modifySpace(sid, name);
        expect(res).toBeUndefined();
    });

    test("10 - Valid sid and name - should fulfill the request", async () => {
        const sid = mockSpaces[0].sid;
        const name = "New name from test";

        const res = await modifySpace(sid, name);
        expect(res).not.toBeUndefined();
        expect(res.name).toEqual(name);
    });
});

describe("Delete an existing space", () => {
    test("01 - sid not specified - should throw", async () => {
        let sid = undefined;

        await expect(deleteSpace()).rejects.toThrow(ParametersError);
    });

    test("02 - sid is undefined - should throw", async () => {
        let sid = undefined;

        await expect(deleteSpace(sid)).rejects.toThrow(ParametersError);
    });

    test("03 - sid is an array - should throw", async () => {
        let sid = [];

        await expect(deleteSpace(sid)).rejects.toThrow(ParametersError);
    });

    test("04 - sid not exists - should return undefined", async () => {
        let sid = mockSpaces[0].sid.substring(0, mockSpaces[0].sid.length-5) + "abcde";
        const res = await deleteSpace(sid);
        
        expect(res).toBeUndefined();
    });

    test("05 - sid valid - should fulfill the request", async () => {
        let sid = mockSpaces[1].sid;
        const res = await deleteSpace(sid);
        
        expect(res).not.toBeUndefined();
    });
});

describe("Get all bookings for a space", () => {
    test("01 - sid not specified - should throw", async () => {
        const sid = undefined;

        await expect(getAllBookingsForSpace()).rejects.toThrow(ParametersError);
    });

    test("02 - sid is undefined - should throw", async () => {
        const sid = undefined;

        await expect(getAllBookingsForSpace(sid)).rejects.toThrow(ParametersError);
    });

    test("03 - sid is an array - should throw", async () => {
        const sid = [];

        await expect(getAllBookingsForSpace(sid)).rejects.toThrow(ParametersError);
    });

    test("04 - sid not exists - should return undefined", async () => {
        const sid = mockSpaces[0].sid.substring(0, mockSpaces[0].sid.length-5) + "abcde";
        const res = await getAllBookingsForSpace(sid);
        expect(res).toBeUndefined();
    });

    test("05 - sid valid - should return an array of size mockSpaces[0].bookings.length", async () => {
        const sid = mockSpaces[0].sid;
        const res = await getAllBookingsForSpace(sid);
        expect(res).not.toBeUndefined();
        expect(res.length).toBe(mockSpaces[0].bookings.length);
    });
});

describe("Get a booking of a space", () => {
    test("01 - sid not specified, bid not specified - should throw", async () => {
        const sid = undefined;
        const bid = undefined;

        await expect(getBookingForSpace()).rejects.toThrow(ParametersError);
    });

    test("02 - sid not specified, bid is valid - should throw", async () => {
        const sid = undefined;
        const bid = mockSpaces[0].bookings[0].bid;

        await expect(getBookingForSpace(bid)).rejects.toThrow(ParametersError);
    });

    test("03 - sid valid, bid not specified - should throw", async () => {
        const sid = mockSpaces[0].sid;
        const bid = mockSpaces[0].bookings[0].bid;

        await expect(getBookingForSpace(sid)).rejects.toThrow(ParametersError);
    });

    test("04 - sid undefined, bid undefined - should throw", async () => {
        const sid = undefined;
        const bid = undefined;

        await expect(getBookingForSpace(sid, bid)).rejects.toThrow(ParametersError);
    });

    test("05 - sid undefined, bid valid - should throw", async () => {
        const sid = undefined;
        const bid = mockSpaces[0].bookings[0].bid;

        await expect(getBookingForSpace(sid, bid)).rejects.toThrow(ParametersError);
    });

    test("06 - sid valid, bid undefined - should throw", async () => {
        const sid = mockSpaces[0].sid;
        const bid = undefined;

        await expect(getBookingForSpace(sid, bid)).rejects.toThrow(ParametersError);
    });

    test("07 - sid not exists, bid valid - should return undefined", async () => {
        const sid = mockSpaces[0].sid.substring(0, mockSpaces[0].sid.length-5) + "abcde";
        const bid = mockSpaces[0].bookings[0].bid;

        const res = await getBookingForSpace(sid, bid);
        expect(res).toBeUndefined();
    });

    test("08 - sid valid, bid not exists - should return undefined", async () => {
        const sid = mockSpaces[0].sid;
        const bid = mockSpaces[0].bookings[0].bid.substring(0, mockSpaces[0].bookings[0].bid.length-5) + "abcde";

        const res = await getBookingForSpace(sid, bid);
        expect(res).toBeUndefined();
    });

    test("09 - sid valid, bid valid - should return the requested booking", async () => {
        const sid = mockSpaces[0].sid;
        const bid = mockSpaces[0].bookings[0].bid;

        const res = await getBookingForSpace(sid, bid);
        expect(res).not.toBeUndefined();
        expect(res.bid).toEqual(bid);
    });
});

describe("Create a booking for a space", () => {
    const validBookingData = {
        uid: mockSpaces[0].sid, //It performs only a validation check of the id string
        gid: mockSpaces[0].sid,
        from: "2222-02-24T22:00:00.000Z",
        to: "2222-02-24T23:00:00.000Z",
        type: "attivita",
        eventId: "eventID"
    };

    test("01 - sid not specified, booking data not specified - should throw", async () => {
        let sid = undefined;
        let bookingData = undefined;

        await expect(createBookingForSpace()).rejects.toThrow(ParametersError);
    });

    test("02 - sid not specified, valid booking data - should throw", async () => {
        let sid = undefined;
        let bookingData = {
            uid: mockSpaces[0].sid, //It performs only a validation check of the id string
            gid: mockSpaces[0].sid,
            from: "2222-02-24T22:00:00.000Z",
            to: "2222-02-24T23:00:00.000Z",
            type: "attivita",
            eventId: "eventID"
        };

        await expect(createBookingForSpace(bookingData)).rejects.toThrow(ParametersError);
    });

    test("03 - sid is valid, booking data not specified - should throw", async () => {
        let sid = mockSpaces[0].sid;
        let bookingData = {
            uid: mockSpaces[0].sid, //It performs only a validation check of the id string
            gid: mockSpaces[0].sid,
            from: "2222-02-24T22:00:00.000Z",
            to: "2222-02-24T23:00:00.000Z",
            type: "attivita",
            eventId: "eventID"
        };

        await expect(createBookingForSpace(sid)).rejects.toThrow(ParametersError);
    });

    test("04 - sid undefined, booking data undefined - should throw", async () => {
        let sid = undefined;
        let bookingData = undefined;

        await expect(createBookingForSpace(sid, bookingData)).rejects.toThrow(ParametersError);
    });

    test("05 - sid undefined, booking data is valid - should throw", async () => {
        let sid = undefined;
        let bookingData = {
            uid: mockSpaces[0].sid, //It performs only a validation check of the id string
            gid: mockSpaces[0].sid,
            from: "2222-02-24T22:00:00.000Z",
            to: "2222-02-24T23:00:00.000Z",
            type: "attivita",
            eventId: "eventID"
        };

        await expect(createBookingForSpace(sid, bookingData)).rejects.toThrow(ParametersError);
    });

    test("06 - sid is valid, booking data undefined - should throw", async () => {
        let sid = mockSpaces[0].sid;
        let bookingData = undefined;

        await expect(createBookingForSpace(sid, bookingData)).rejects.toThrow(ParametersError);
    });

    test("07 - sid is an array, valid booking data - should throw", async () => {
        let sid = [];
        let bookingData = {
            uid: mockSpaces[0].sid, //It performs only a validation check of the id string
            gid: mockSpaces[0].sid,
            from: "2222-02-24T22:00:00.000Z",
            to: "2222-02-24T23:00:00.000Z",
            type: "attivita",
            eventId: "eventID"
        };

        await expect(createBookingForSpace(sid, bookingData)).rejects.toThrow(ParametersError);
    });

    test("08 - sid not exists, valid booking data - should return undefined", async () => {
        let sid = mockSpaces[0].sid.substring(0, mockSpaces[0].sid.length-5) + "abcde";
        let bookingData = {
            uid: mockSpaces[0].sid, //It performs only a validation check of the id string
            gid: mockSpaces[0].sid,
            from: "2222-02-24T22:00:00.000Z",
            to: "2222-02-24T23:00:00.000Z",
            type: "attivita",
            eventId: "eventID"
        };
        bookingData.ITTT = 123;

        const res = await createBookingForSpace(sid, bookingData);
        expect(res).toBeUndefined();
    });

    test("09 - sid valid, booking data not well formed (missing uid) - should throw", async () => {
        let sid = mockSpaces[0].sid;
        let bookingData = {
            uid: mockSpaces[0].sid, //It performs only a validation check of the id string
            gid: mockSpaces[0].sid,
            from: "2222-02-24T22:00:00.000Z",
            to: "2222-02-24T23:00:00.000Z",
            type: "attivita",
            eventId: "eventID"
        };
        delete bookingData.uid;

        await expect(createBookingForSpace(sid, bookingData)).rejects.toThrow(ParametersError);
    });

    test("10 - sid valid, booking data not well formed (missing gid) - should throw", async () => {
        let sid = mockSpaces[0].sid;
        let bookingData = {
            uid: mockSpaces[0].sid, //It performs only a validation check of the id string
            gid: mockSpaces[0].sid,
            from: "2222-02-24T22:00:00.000Z",
            to: "2222-02-24T23:00:00.000Z",
            type: "attivita",
            eventId: "eventID"
        };
        delete bookingData.gid;

        await expect(createBookingForSpace(sid, bookingData)).rejects.toThrow(ParametersError);
    });

    test("11 - sid valid, booking data not well formed (interval overlap) - should throw", async () => {
        let sid = mockSpaces[0].sid;

        //It overlaps with the booking inserted in the beforeAll() method
        let bookingData = {
            uid: mockSpaces[0].sid,
            gid: mockSpaces[0].sid,
            from: "2222-02-24T21:00:00.000Z",
            to: "2222-02-24T22:00:00.000Z",
            type: "attivita",
            eventId: "eventID"
        };

        await expect(createBookingForSpace(sid, bookingData)).rejects.toThrow(IntervalOverlapError);
    });

    test("12 - sid valid, booking data valid - should fulfill the request", async () => {
        let sid = mockSpaces[0].sid;
        let bookingData = {
            uid: mockSpaces[1].sid,
            gid: mockSpaces[1].sid,
            from: "2222-03-24T21:00:00.000Z",
            to: "2222-03-24T22:00:00.000Z",
            type: "attivita",
            eventId: "eventID"
        };

        const res = await createBookingForSpace(sid, bookingData);
        expect(res).not.toBeUndefined();
        expect(res.bid).not.toBeUndefined();
        expect(res.uid).toEqual(bookingData.uid);
        expect(res.gid).toEqual(bookingData.gid);
        expect(res.from).toEqual(bookingData.from);
        expect(res.to).toEqual(bookingData.to);
        expect(res.type).toEqual(bookingData.type);
    });
});

describe("Update existing bookings for a space", () => {
    test("01 - sid, bid and booking data not specified - should throw", async () => {
        let sid = undefined;
        let bid = undefined;
        let booking = undefined;

        await expect(modifyBookingForSpace()).rejects.toThrow(ParametersError);
    });

    test("02 - sid and bid not specified - should throw", async () => {
        let sid = undefined;
        let bid = undefined;
        let booking = {
            uid: mockSpaces[0].sid, //It performs only a validation check of the id string
            gid: mockSpaces[0].sid,
            from: "2222-04-24T20:00:00.000Z",
            to: "2222-04-24T23:00:00.000Z",
            type: "attivita",
            eventId: "eventID"
        };

        await expect(modifyBookingForSpace(booking)).rejects.toThrow(ParametersError);
    });

    test("03 - sid not specified - should throw", async () => {
        let sid = undefined;
        let bid = mockSpaces[0].bookings[0].bid;
        let booking = {
            uid: mockSpaces[0].sid, //It performs only a validation check of the id string
            gid: mockSpaces[0].sid,
            from: "2222-04-24T20:00:00.000Z",
            to: "2222-04-24T23:00:00.000Z",
            type: "attivita",
            eventId: "eventID"
        };

        await expect(modifyBookingForSpace(bid, booking)).rejects.toThrow(ParametersError);
    });

    test("04 - sid, bid and booking undefined - should throw", async () => {
        let sid = undefined;
        let bid = undefined;
        let booking = undefined;

        await expect(modifyBookingForSpace(sid, bid, booking)).rejects.toThrow(ParametersError);
    });

    test("05 - bid and booking undefined - should throw", async () => {
        let sid = mockSpaces[0].sid;
        let bid = undefined;
        let booking = undefined;

        expect(sid).not.toBeUndefined();    //It should be inserted in the beforeAll()
        await expect(modifyBookingForSpace(sid, bid, booking)).rejects.toThrow(ParametersError);
    });

    test("06 - sid and booking undefined - should throw", async () => {
        let sid = undefined;
        let bid = mockSpaces[0].bookings[0].bid;
        let booking = undefined;

        expect(bid).not.toBeUndefined();    //It should be inserted in the beforeAll()
        await expect(modifyBookingForSpace(sid, bid, booking)).rejects.toThrow(ParametersError);
    });

    test("07 - booking undefined - should throw", async () => {
        let sid = mockSpaces[0].sid;
        let bid = mockSpaces[0].bookings[0].bid;
        let booking = undefined;

        await expect(modifyBookingForSpace(sid, bid, booking)).rejects.toThrow(ParametersError);
    });

    test("08 - sid not exists - should return undefined", async () => {
        let sid = mockSpaces[0].sid.substring(0, mockSpaces[0].sid.length-5) + "abcde";
        let bid = mockSpaces[0].bookings[0].bid;
        let booking = {
            uid: mockSpaces[0].sid, //It performs only a validation check of the id string
            gid: mockSpaces[0].sid,
            from: "2222-04-24T20:00:00.000Z",
            to: "2222-04-24T23:00:00.000Z",
            type: "attivita",
            eventId: "eventID"
        };

        let res = await modifyBookingForSpace(sid, bid, booking);
        expect(res).toBeUndefined();
    });

    test("09 - bid not exists - should return undefined", async () => {
        let sid = mockSpaces[0].sid;
        let bid = mockSpaces[0].bookings[0].bid.substring(0, mockSpaces[0].bookings[0].bid.length-5) + "abcde";
        let booking = {
            uid: mockSpaces[0].sid, //It performs only a validation check of the id string
            gid: mockSpaces[0].sid,
            from: "2222-04-24T20:00:00.000Z",
            to: "2222-04-24T23:00:00.000Z",
            type: "attivita",
            eventId: "eventID"
        };

        let res = await modifyBookingForSpace(sid, bid, booking);
        expect(res).toBeUndefined();
    });

    test("09 - booking object not well formed (missing 'from' field) - should throw", async () => {
        let sid = mockSpaces[0].sid;
        let bid = mockSpaces[0].bookings[0].bid;
        let booking = {
            uid: mockSpaces[0].sid, //It performs only a validation check of the id string
            gid: mockSpaces[0].sid,
            to: "2222-04-24T23:00:00.000Z",
            type: "attivita",
            eventId: "eventID"
        };

        await expect(modifyBookingForSpace(sid, bid, booking)).rejects.toThrow(ParametersError);
    });

    test("10 - booking object not well formed (interval overlap) - should throw", async () => {
        let sid = mockSpaces[0].sid;
        let bid = mockSpaces[0].bookings[0].bid;
        let booking = {
            uid: mockSpaces[0].sid, //It performs only a validation check of the id string
            gid: mockSpaces[0].sid,
            from: "2222-06-24T21:00:00.000Z",
            to: "2222-06-24T22:00:00.000Z",
            type: "attivita",
            eventId: "eventID"
        };

        await expect(modifyBookingForSpace(sid, bid, booking)).rejects.toThrow(IntervalOverlapError);
    });

    test("11 - sid is an array - should throw", async () => {
        let sid = [];
        let bid = mockSpaces[0].bookings[0].bid;
        let booking = {
            uid: mockSpaces[0].sid, //It performs only a validation check of the id string
            gid: mockSpaces[0].sid,
            from: "2222-07-24T21:00:00.000Z",
            to: "2222-07-24T22:00:00.000Z",
            type: "attivita",
            eventId: "eventID"
        };

        await expect(modifyBookingForSpace(sid, bid, booking)).rejects.toThrow(ParametersError);
    });

    test("12 - bid is an array - should throw", async () => {
        let sid = mockSpaces[0].sid;
        let bid = [];
        let booking = {
            uid: mockSpaces[0].sid, //It performs only a validation check of the id string
            gid: mockSpaces[0].sid,
            from: "2222-07-24T21:00:00.000Z",
            to: "2222-07-24T22:00:00.000Z",
            type: "attivita",
            eventId: "eventID"
        };

        await expect(modifyBookingForSpace(sid, bid, booking)).rejects.toThrow(ParametersError);
    });

    test("13 - correct fields - should fulfill the request", async () => {
        let sid = mockSpaces[0].sid;
        let bid = mockSpaces[0].bookings[1].bid;
        let booking = {
            uid: mockSpaces[0].sid, //It performs only a validation check of the id string
            gid: mockSpaces[0].sid,
            from: "2222-07-24T20:00:00.000Z",
            to: "2222-07-24T23:00:00.000Z",
            type: "attivita",
            eventId: "eventID"
        }

        let res = await modifyBookingForSpace(sid, bid, booking);

        expect(res).not.toBeUndefined();
        expect(res.uid).toEqual(booking.uid);
        expect(res.gid).toEqual(booking.gid);
        expect(res.from).toEqual(booking.from);
        expect(res.to).toEqual(booking.to);
        expect(res.type).toEqual(booking.type);
    });
});

describe("Delete a booking for a space", () => {
    test("01 - sid and bid not specified - should throw", async () => {
        let sid = mockSpaces[0].sid;
        let bid = mockSpaces[0].bookings[0].bid;

        await expect(deleteBookingForSpace()).rejects.toThrow(ParametersError);
    });

    test("02 - sid not specified - should throw", async () => {
        let sid = mockSpaces[0].sid;
        let bid = mockSpaces[0].bookings[0].bid;

        await expect(deleteBookingForSpace(bid)).rejects.toThrow(ParametersError);
    });

    test("03 - sid and bid undefined - should throw", async () => {
        let sid = undefined;
        let bid = undefined;

        await expect(deleteBookingForSpace(sid, bid)).rejects.toThrow(ParametersError);
    });

    test("04 - sid undefined - should throw", async () => {
        let sid = undefined;
        let bid = mockSpaces[0].bookings[0].bid;

        await expect(deleteBookingForSpace(sid, bid)).rejects.toThrow(ParametersError);
    });

    test("05 - bid undefined - should throw", async () => {
        let sid = mockSpaces[0].sid;
        let bid = undefined;

        await expect(deleteBookingForSpace(sid, bid)).rejects.toThrow(ParametersError);
    });

    test("06 - sid is an array - should throw", async () => {
        let sid = [];
        let bid = mockSpaces[0].bookings[0].bid;

        await expect(deleteBookingForSpace(sid, bid)).rejects.toThrow(ParametersError);
    });

    test("07 - invalid sid - should return undefined", async () => {
        let sid = mockSpaces[0].sid.substring(0, mockSpaces[0].sid.length-5) + "abcde";
        let bid = mockSpaces[0].bookings[0].bid;

        let res = await deleteBookingForSpace(sid, bid);
        expect(res).toBeUndefined();
    });

    test("08 - invalid bid - should return undefined", async () => {
        let sid = mockSpaces[0].sid;
        let bid = mockSpaces[0].bookings[0].bid.substring(0, mockSpaces[0].bookings[0].bid.length-5) + "abcde";

        let res = await deleteBookingForSpace(sid, bid);
        expect(res).toBeUndefined();
    });

    test("09 - correct parameters - should fulfill the request", async () => {
        let sid = mockSpaces[0].sid;
        let bid = mockSpaces[0].bookings[2].bid;

        let res = await deleteBookingForSpace(sid, bid);
        expect(res).toBeTruthy();
    });
});