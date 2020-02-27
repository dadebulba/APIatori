module.exports = function(err, req, res, next) {
    // console.log('Request: ' + JSON.stringify(req));
    // console.log('Response: ' + JSON.stringify(res));
    console.log(err);
    return res.status(500).json(err.message);
};