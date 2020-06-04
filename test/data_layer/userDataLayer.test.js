const mockUsers = require("../data/users.js");

process.env.MOCK_USERS = JSON.stringify(mockUsers);
const userDL = require("../../data_layer/user_data_layer/userDataLayer");

//Data layer APIs
const getAllUsers = userDL.getAllUsers;
const getUser = userDL.getUser;
const createUser = userDL.createUser;
const modifyUser = userDL.modifyUser;
const login = userDL.login;

//Errors
const ParametersError = require("../../errors/parametersError");

beforeAll(async () => {
    await userDL.init();

    //Retrive id of the inserted mocked data
    let data = await getAllUsers();
    if (data == undefined)
        process.exit(1);

    for (var i=0; i<mockUsers.length; i++)
        mockUsers[i].uid = data[i].uid;
});

describe("Get all users", () => {
    test("01 - Retrieve all users - should return a list", () => {
        getAllUsers().then(data => {
            expect(data).not.toBeNull();
            expect(data.length).toBe(mockUsers.length);
        })
    });
});

describe("Get user by id", () => {
    test("01 - uid not specified - should throw", async () => {
        await expect(getUser()).rejects.toThrow(ParametersError);
    });

    test("02 - uid undefined - should throw", async () => {
        const uid = undefined;

        await expect(getUser(uid)).rejects.toThrow(ParametersError);
    });

    test("03 - uid is an array - should throw", async () => {
        const uid = [];

        await expect(getUser(uid)).rejects.toThrow(ParametersError);
    });

    test("04 - uid not exists - should return null", async () => {
        const uid = mockUsers[0].uid.substring(0, mockUsers[0].uid.length-5) + "abcde";
        const res = await getUser(uid);

        expect(res).toBeUndefined();
    });

    test("05 - uid valid - should return the user", async () => {
        const uid = mockUsers[0].uid;
        const res = await getUser(uid);

        expect(res).not.toBeUndefined();
    });
});

describe("Create a new user", () => {
    test("01 - User info not specified - should throw", async () => {
        await expect(createUser()).rejects.toThrow(ParametersError);
    });

    test("02 - User info undefined - should throw", async () => {
        let userInfo = undefined;
        await expect(createUser(userInfo)).rejects.toThrow(ParametersError);
    });

    test("03 - User info is not an object - should throw", async () => {
        let userInfo = [];
        await expect(createUser(userInfo)).rejects.toThrow(ParametersError);
    });

    test("04 - User info contains not well-formed fields (mail) - should throw", async () => {
        let userInfo = {
            name: "User",
            surname: "From_tests",
            mail: "name.surname@mail",
            password: "testPassword"
        };

        await expect(createUser(userInfo)).rejects.toThrow(ParametersError);
    });

    test("05 - Valid user data - should return the new user", async () => {
        let userInfo = {
            name: "User",
            surname: "From_tests",
            mail: "name.surname@mail.com",
            password: "testPassword"
        };

        const res = await createUser(userInfo);
        expect(res).not.toBeUndefined();
    });
});

describe("Modify user data", () => {
    test("01 - uid and data not specified - should throw", async () => {
        let uid = undefined;
        let data = undefined;

        expect(modifyUser()).rejects.toThrow(ParametersError);
    });

    test("02 - uid not specified - should throw", async () => {
        let uid = undefined;
        let data = undefined;

        expect(modifyUser(data)).rejects.toThrow(ParametersError);
    });

    test("03 - data not specified - should throw", async () => {
        let uid = undefined;
        let data = undefined;

        expect(modifyUser(uid)).rejects.toThrow(ParametersError);
    });

    test("04 - uid and data undefined - should throw", async () => {
        let uid = undefined;
        let data = undefined;

        expect(modifyUser(uid, data)).rejects.toThrow(ParametersError);
    });

    test("05 - data undefined - should throw", async () => {
        let uid = mockUsers[0].uid;
        let data = undefined;

        expect(modifyUser(uid, data)).rejects.toThrow(ParametersError);
    });

    test("06 - uid undefined - should throw", async () => {
        let uid = undefined;
        let data = {
            educatorIn: [mockUsers[0].uid],
            collaboratorIn: [mockUsers[1].uid]
        };

        expect(modifyUser(uid, data)).rejects.toThrow(ParametersError);
    });

    test("07 - uid is not a string - should throw", async () => {
        let uid = [];
        let data = {
            educatorIn: [mockUsers[0].uid],
            collaboratorIn: [mockUsers[1].uid]
        };

        expect(modifyUser(uid, data)).rejects.toThrow(ParametersError);
    });

    test("08 - uid not exists - should return undefined", async () => {
        let uid = mockUsers[0].uid.substring(0, mockUsers[0].uid.length-5) + "abcde";;
        let data = {
            educatorIn: [mockUsers[0].uid],
            collaboratorIn: [mockUsers[1].uid]
        };

        let result = await modifyUser(uid, data);
        expect(result).toBeUndefined();
    });

    test("09 - data object not well formed (contains strings) - should throw", async () => {
        let uid = mockUsers[0].uid;
        let data = {
            educatorIn: mockUsers[0].uid,
            collaboratorIn: [mockUsers[1].uid]
        };

        expect(modifyUser(uid, data)).rejects.toThrow(ParametersError);
    });

    test("10 - correct request - should fulfill the request", async () => {
        let uid = mockUsers[0].uid;
        let data = {
            educatorIn: [mockUsers[0].uid],
            collaboratorIn: [mockUsers[1].uid]
        };

        let result = await modifyUser(uid, data);
        expect(result).not.toBeUndefined();
        expect(result.educatorIn).toEqual(data.educatorIn);
        expect(result.collaboratorIn).toEqual(data.collaboratorIn);
        expect(result.uid).toEqual(uid);
    });
});

describe("User login", () => {
    test("01 - mail and password not specified - should throw", async () => {
        let mail = undefined;
        let password = undefined;

        expect(login()).rejects.toThrow(ParametersError);
    });

    test("02 - mail not specified - should throw", async () => {
        let mail = undefined;
        let password = mockUsers[0].password;

        expect(login(password)).rejects.toThrow(ParametersError);
    });

    test("03 - password not specified - should throw", async () => {
        let mail = mockUsers[0].mail;
        let password = undefined;

        expect(login(mail)).rejects.toThrow(ParametersError);
    });

    test("04 - mail and password undefined - should throw", async () => {
        let mail = undefined;
        let password = undefined;

        expect(login(mail, password)).rejects.toThrow(ParametersError);
    });

    test("05 - mail undefined - should throw", async () => {
        let mail = undefined;
        let password = mockUsers[0].password;

        expect(login(mail, password)).rejects.toThrow(ParametersError);
    });

    test("06 - password undefined - should throw", async () => {
        let mail = mockUsers[0].mail;
        let password = undefined;

        expect(login(mail, password)).rejects.toThrow(ParametersError);
    });

    test("07 - mail is not a string - should throw", async () => {
        let mail = [];
        let password = mockUsers[0].password;

        expect(login(mail, password)).rejects.toThrow(ParametersError);
    });

    test("08 - password is not a string - should throw", async () => {
        let mail = mockUsers[0].mail;
        let password = [];

        expect(login(mail, password)).rejects.toThrow(ParametersError);
    });

    test("09 - mail not exists - should return undefined", async () => {
        let mail = "ifhasdf.dfasdf@gfsdfs.com";
        let password = mockUsers[0].password;

        let res = await login(mail, password);
        expect(res).toBeUndefined();
    });

    test("10 - password does not match - should return undefined", async () => {
        let mail = mockUsers[0].mail;
        let password = "kdhasudfhasd";

        let res = await login(mail, password);
        expect(res).toBeUndefined();
    });

    test("11 - mail and password correct - should fulfill the request", async () => {
        let mail = mockUsers[0].mail;
        let password = mockUsers[0].password;

        let res = await login(mail, password);
        expect(res).not.toBeUndefined();
        expect(res.uid).not.toBeUndefined();
        expect(res.role).not.toBeUndefined();
        expect(res.educatorIn).not.toBeUndefined();
        expect(res.collaboratorIn).not.toBeUndefined();
    });
});