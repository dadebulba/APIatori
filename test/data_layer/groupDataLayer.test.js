const mockGroups = require("../data/groups.js");

process.env.MOCK_GROUPS = JSON.stringify(mockGroups);
const groupDL = require("../../data_layer/group_data_layer/groupDataLayer");

//Data layer APIs
const getAllGroups = groupDL.getAllGroups;
const getGroup = groupDL.getGroup;
const createGroup = groupDL.createGroup;
const modifyGroup = groupDL.modifyGroup;
const deleteGroup = groupDL.deleteGroup;

//Errors
const ParametersError = require("../../errors/parametersError");
const GroupAlreadyExistsError = require("../../errors/groupAlreadyExistsError");

beforeAll(async () => {
    await groupDL.init();

    //Retrieve the gid for all the mocked groups
    let res = await getAllGroups();
    if (res == undefined || res.length == 0 || res[0].gid == undefined)
        process.exit(1);

    for (var i=0; i<res.length; i++)
        mockGroups[i].gid = res[i].gid;
});

describe("Get all groups", () => {
    test("01 - correct invocation - should return the mocked groups", async () => {
        let res = await getAllGroups();

        expect(res).not.toBeUndefined();
        expect(res.length).toEqual(mockGroups.length);
    });
});

describe("Get single group", () => {
    test("01 - gid not specified - should throw", async () => {
        let gid = undefined;

        await expect(getGroup()).rejects.toThrow(ParametersError);
    });

    test("02 - gid undefined - should throw", async () => {
        let gid = undefined;

        await expect(getGroup(gid)).rejects.toThrow(ParametersError);
    });

    test("03 - gid is an array - should throw", async () => {
        let gid = [];

        await expect(getGroup(gid)).rejects.toThrow(ParametersError);
    });

    test("04 - gid not exists - should return undefined", async () => {
        let gid = mockGroups[0].gid.substring(0, mockGroups[0].gid.length-5) + "abcde";

        let res = await getGroup(gid);
        expect(res).toBeUndefined();
    });

    test("05 - gid correct - should fulfill the request", async () => {
        let gid = mockGroups[0].gid;

        let res = await getGroup(gid);
        expect(res).not.toBeUndefined();
        expect(res.gid).toEqual(gid);
        expect(res.educators).toEqual(mockGroups[0].educators);
        expect(res.guys).toEqual(mockGroups[0].guys);
        expect(res.balance).toEqual(0);
        expect(res.transactions).not.toBeUndefined();
        expect(res.transactions.length).toEqual(0);
        expect(res.collaborators).not.toBeUndefined();
        expect(res.collaborators.length).toEqual(0);
    });
});

describe("Create a new group", () => {
    test("01 - group data not specified - should throw", async () => {
        let groupData = undefined;

        await expect(createGroup()).rejects.toThrow(ParametersError);
    });

    test("02 - group data is undefined - should throw", async () => {
        let groupData = undefined;

        await expect(createGroup(groupData)).rejects.toThrow(ParametersError);
    });

    test("03 - group data is an array - should throw", async () => {
        let groupData = [];

        await expect(createGroup(groupData)).rejects.toThrow(ParametersError);
    });

    test("04 - the group already exists - should throw", async () => {
        let groupData = {
            name: mockGroups[0].name,
            educators: ["5e5d3df10cdd901037a15175"],
            guys: ["5e5d3df10cdd901037a15175", "5e5d3df10cdd901037a15175"]
        };

        await expect(createGroup(groupData)).rejects.toThrow(GroupAlreadyExistsError);
    });

    test("05 - educator uid not valid - should throw", async () => {
        let groupData = {
            name: "MOCK_Group3_FromTest",
            educators: ["5e5d3df10cdd901037aaaaa"],
            guys: ["5e5d3df10cdd901037a15175", "5e5d3df10cdd901037a15175"]
        };

        await expect(createGroup(groupData)).rejects.toThrow(ParametersError);
    });

    test("06 - guy uid not valid - should throw", async () => {
        let groupData = {
            name: "MOCK_Group3_FromTest",
            educators: ["5e5d3df10cdd901037a15175"],
            guys: ["5e5d3df10cdd901037aaaaa", "5e5d3df10cdd901037a15175"]
        };

        await expect(createGroup(groupData)).rejects.toThrow(ParametersError);
    });

    test("07 - valid group data - should fulfill the request", async () => {
        let groupData = {
            name: "MOCK_Group3_FromTest",
            educators: ["5e5d3df10cdd901037a15175"],
            guys: ["5e5d3df10cdd901037a15175", "5e5d3df10cdd901037a15175"]
        };

        let res = await createGroup(groupData);
        expect(res).not.toBeUndefined();
        expect(res.gid).not.toBeUndefined();
        expect(res.name).toEqual(groupData.name);
        expect(res.educators).toEqual(groupData.educators);
        expect(res.guys).toEqual(groupData.guys);
        expect(res.balance).toEqual(0);
        expect(res.transactions).not.toBeUndefined();
        expect(res.transactions.length).toEqual(0);
        expect(res.collaborators).not.toBeUndefined();
        expect(res.collaborators.length).toEqual(0);
    });
});

describe("Modify an existing group", () => {
    test("01 - gid and group data not specified - should throw", async () => {
        let gid = undefined;
        let groupData = undefined;

        await expect(modifyGroup()).rejects.toThrow(ParametersError);
    });

    test("02 - group data not specified - should throw", async () => {
        let gid = mockGroups[0].gid;
        let groupData = undefined;

        await expect(modifyGroup(gid)).rejects.toThrow(ParametersError);
    });

    test("03 - gid and group data undefined - should throw", async () => {
        let gid = undefined;
        let groupData = undefined;

        await expect(modifyGroup(gid, groupData)).rejects.toThrow(ParametersError);
    });

    test("04 - group data undefined - should throw", async () => {
        let gid = mockGroups[0].gid;
        let groupData = undefined;

        await expect(modifyGroup(gid, groupData)).rejects.toThrow(ParametersError);
    });

    test("05 - gid undefined - should throw", async () => {
        let gid = undefined;
        let groupData = {
            name: mockGroups[0].name + "_Modified",
            educators: mockGroups[0].educators,
            guys: mockGroups[0].guys
        };

        await expect(modifyGroup(gid, groupData)).rejects.toThrow(ParametersError);
    });

    test("06 - gid is an array - should throw", async () => {
        let gid = [];
        let groupData = {
            name: mockGroups[0].name + "_Modified",
            educators: mockGroups[0].educators,
            guys: mockGroups[0].guys
        };

        await expect(modifyGroup(gid, groupData)).rejects.toThrow(ParametersError);
    });

    test("07 - group data is an array - should throw", async () => {
        let gid = mockGroups[0].gid;
        let groupData = [];

        await expect(modifyGroup(gid, groupData)).rejects.toThrow(ParametersError);
    });

    test("08 - gid not exists - should return undefined", async () => {
        let gid = mockGroups[0].gid.substring(0, mockGroups[0].gid.length-5) + "abcde";
        let groupData = {
            name: mockGroups[0].name + "_Modified",
            educators: mockGroups[0].educators,
            guys: mockGroups[0].guys,
            balance: 0
        };

        let res = await modifyGroup(gid, groupData);
        expect(res).toBeUndefined();
    });

    test("09 - correct query - should fulfill the request", async () => {
        let gid = mockGroups[0].gid;
        let groupData = {
            name: mockGroups[0].name + "_Modified",
            educators: mockGroups[0].educators,
            guys: mockGroups[0].guys,
            balance: 0
        };

        let res = await modifyGroup(gid, groupData);
        expect(res).not.toBeUndefined();
        expect(res.name).toEqual(mockGroups[0].name + "_Modified");
    });
});

describe("Delete a group", () => {
    test("01 - gid not specified - should throw", async () => {
        let gid = undefined;

        await expect(deleteGroup()).rejects.toThrow(ParametersError);
    });

    test("02 - gid is undefined - should throw", async () => {
        let gid = undefined;

        await expect(deleteGroup(gid)).rejects.toThrow(ParametersError);
    });

    test("03 - gid is an array - should throw", async () => {
        let gid = [];

        await expect(deleteGroup(gid)).rejects.toThrow(ParametersError);
    });

    test("04 - gid is malformed - should throw", async () => {
        let gid = "asdas43sd";

        await expect(deleteGroup(gid)).rejects.toThrow(ParametersError);
    });

    test("05 - gid not exists - should return undefined", async () => {
        let gid = mockGroups[0].gid.substring(0, mockGroups[0].gid.length-5) + "abcde";

        let res = await deleteGroup(gid);
        expect(res).toBeUndefined();
    });

    test("06 - correct gid - should fulfill the request", async () => {
        let gid = mockGroups[1].gid;

        let res = await deleteGroup(gid);
        expect(res).not.toBeUndefined();
        expect(res.gid).toEqual(mockGroups[1].gid);
    });
});