const express = require('express');
const bodyParser = require('body-parser');
const financeImpl = require('./financesImpl.js');
const apiUtility = require('../../utility.js');
const errors = require('../../errorMsg.js');

process.env["NODE_CONFIG_DIR"] = "../../config/";
const config = require('config');

const PORT = process.env.PORT || config.get('financesPort');
const key = process.env.API_KEY || config.get('API_KEY');
const basePath = process.env.BASE_PATH || config.get("basePath");
const LEVELS = apiUtility.levels;
const app = express();
app.use(bodyParser.json());

//*** ERROR AND AUTH MIDDLEWARE ***/

const mwErrorHandler = require('../../middleware/mwErrorHandler');

const mwAuth = require('../../middleware/mwAuth');
app.use(mwAuth)

//*** FINANCES APIs ***/
app.get('/finances/:id', async function (req, res) {
    const groupId = req.params.id;
    const year = req.query.year || new Date().getFullYear();

    if (apiUtility.validateParamsUndefined(groupId, year))
        return res.status(400).json(errors.PARAMS_UNDEFINED);
    if (apiUtility.validateParamsString(groupId))
        return res.status(400).json(errors.PARAMS_WRONG_TYPE);
    if (apiUtility.validateParamsNumber(year))
        return res.status(400).json(errors.PARAMS_WRONG_TYPE);

    try {
        if (await apiUtility.validateGroupId(groupId) == false)
            return res.status(404).json(errors.ENTITY_NOT_FOUND);

        if (!(apiUtility.validateAuth(req, LEVELS.EDUCATOR, groupId) || apiUtility.validateAuth(req, LEVELS.ADMIN)))
            return res.status(401).json(errors.ACCESS_NOT_GRANTED);

        const finances = await financeImpl.getFinances(groupId, year);

        if (apiUtility.validateParamsUndefined(finances))
            return res.status(404).json(errors.ENTITY_NOT_FOUND);

        return res.status(200).json(finances)
    } catch (err) {
        next(err);
    }
});

app.post('/finances/:id', async function (req, res) {
    const groupId = req.params.id;
    const timestamp = Date.parse(req.body.timestamp);
    const amount = req.body.amount;
    const causal = req.body.causal;

    if (apiUtility.validateParamsUndefined(groupId, timestamp, amount, causal))
        return res.status(400).json(errors.PARAMS_UNDEFINED);
    if (!apiUtility.validateParamsDate(timestamp))
        return res.status(400).json(errors.DATETIME_INVALID);
    if (!apiUtility.validateParamsString(groupId, causal))
        return res.status(400).json(errors.PARAMS_WRONG_TYPE);
    if (!apiUtility.validateParamsNumber(amount))
        return res.status(400).json(errors.PARAMS_WRONG_TYPE);

    try {
        if (!(await apiUtility.validateGroupId(groupId)))
            return res.status(404).json(errors.ENTITY_NOT_FOUND);

        if (!(apiUtility.validateAuth(req, LEVELS.EDUCATOR, groupId) || apiUtility.validateAuth(req, LEVELS.ADMIN)))
            return res.status(401).json(errors.ACCESS_NOT_GRANTED);

        const newFinance = await financeImpl.addNewHistory(groupId,timestamp,amount,causal);

        return res.status(201).json(newFinance);
    }
    catch (err) {
        next(err); 
    }
})

app.put('/finances/:id', async function (req, res) {
    const groupId = req.params.id;
    const timestamp = Date.parse(req.body.timestamp);
    const amount = req.body.amount;
    const causal = req.body.causal;

    if (apiUtility.validateParamsUndefined(groupId, timestamp, amount, causal))
        return res.status(400).json(errors.PARAMS_UNDEFINED);
    if (!apiUtility.validateParamsDate(timestamp))
        return res.status(400).json(errors.DATETIME_INVALID);
    if (!apiUtility.validateParamsString(groupId, causal))
        return res.status(400).json(errors.PARAMS_WRONG_TYPE);
    if (!apiUtility.validateParamsNumber(amount))
        return res.status(400).json(errors.PARAMS_WRONG_TYPE);

    try {
        if (!(await apiUtility.validateGroupId(groupId)))
            return res.status(404).json(errors.ENTITY_NOT_FOUND);

        if (!(apiUtility.validateAuth(req, LEVELS.EDUCATOR, groupId) || apiUtility.validateAuth(req, LEVELS.ADMIN)))
            return res.status(401).json(errors.ACCESS_NOT_GRANTED);

        
        const editedHistory = await financeImpl.editHistory(groupId,timestamp,amount,causal);

        if(editedHistory === undefined)
            return res.status(404).json(errors.ENTITY_NOT_FOUND);

        return res.status(200).json(editedHistory);
    }
    catch (err) {
        next(err); 
    }
})

app.delete('/finances/:groupId', async function (req, res) {
    const groupId = req.params.id;
    const timestamp = Date.parse(req.body.timestamp);
    const amount = req.body.amount;
    const causal = req.body.causal;

    if (apiUtility.validateParamsUndefined(groupId, timestamp, amount, causal))
        return res.status(400).json(errors.PARAMS_UNDEFINED);
    if (!apiUtility.validateParamsDate(timestamp))
        return res.status(400).json(errors.DATETIME_INVALID);
    if (!apiUtility.validateParamsString(groupId, causal))
        return res.status(400).json(errors.PARAMS_WRONG_TYPE);
    if (!apiUtility.validateParamsNumber(amount))
        return res.status(400).json(errors.PARAMS_WRONG_TYPE);

    try {
        if (!(await apiUtility.validateGroupId(groupId)))
            return res.status(404).json(errors.ENTITY_NOT_FOUND);

        if (!(apiUtility.validateAuth(req, LEVELS.EDUCATOR, groupId) || apiUtility.validateAuth(req, LEVELS.ADMIN)))
            return res.status(401).json(errors.ACCESS_NOT_GRANTED);

        const isDeleted = await financeImpl.deleteHistory(groupId,timestamp);

        if(!isDeleted)
            return res.status(404).json(errors.ENTITY_NOT_FOUND);
        else
            return res.status(200).end();
    }
    catch (err) {
        next(err); 
    }
});

app.use(mwErrorHandler);

app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`)
});