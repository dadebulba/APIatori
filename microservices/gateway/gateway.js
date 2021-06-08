var express = require('express');
const axios = require('axios');

let config = {}
if (process.env.PROD || process.env.TESTING) {
    config = require('./config/default.json');
}
else {
    config = require('../../config/default.json');
}

const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json());

const SPACES_PORT = config.spacesPort;
const GROUPS_PORT = config.groupsPort;
const USERS_PORT =  config.usersPort;
const TOKEN_PORT =  config.tokenPort;
const SPACES_BASE = config.spacesEndpoint;
const GROUPS_BASE = config.groupsEndpoint;
const USERS_BASE =  config.usersEndpoint;
const TOKEN_BASE =  config.tokenEndpoint;
const PORT = config.gatewayPort;

let SPACES_ENDPOINT = "";
let GROUPS_ENDPOINT = "";
let USERS_ENDPOINT = "";
let TOKEN_ENDPOINT = "";
if (process.env.TESTING) {
  SPACES_ENDPOINT = `${SPACES_BASE}:1${SPACES_PORT}`;
  GROUPS_ENDPOINT = `${GROUPS_BASE}:1${GROUPS_PORT}`;
  USERS_ENDPOINT = `${USERS_BASE}:1${USERS_PORT}`;
  TOKEN_ENDPOINT = `${TOKEN_BASE}:1${TOKEN_PORT}`; 
} else{
  SPACES_ENDPOINT = `${SPACES_BASE}:${SPACES_PORT}`;
  GROUPS_ENDPOINT = `${GROUPS_BASE}:${GROUPS_PORT}`;
  USERS_ENDPOINT = `${USERS_BASE}:${USERS_PORT}`;
  TOKEN_ENDPOINT = `${TOKEN_BASE}:${TOKEN_PORT}`;
}
/*** UTILS ***/ 
function unless(middleware, ...excludedUrl){
  return function(req, res, next){
      const match = excludedUrl.some(url => ((req.path == url.path || req.path.slice(0,req.path.length-1) == url.path) && url.method == req.method));
      match ? next() : middleware(req, res, next);           
  }
}

function errorHandler(error, req, res) {
  console.log("Error:" + error);
  console.log(req.path);
  if(error.response)
    res.status(error.response.status).json(error.response.data)
  else
    res.status(500).send(`<html><body><h2>Sorry, we encuntered an error with your request to ${req.path}, our staff will fix it soon</h2><img src='https://cdn.dribbble.com/users/15084/screenshots/1368807/suchgif.gif'></body></html>`)
}

/** MIDDLEWARES **/
const mwAuth = (process.env.PROD || process.env.TESTING) ?  require('./middleware/mwAuth.js') : require('../../middleware/mwAuth');
app.use(unless(mwAuth, {path: "/spaces", method: "GET"}, {path: "/users", method: "POST"}, {path: "/token", method: "POST"}));

/** ROUTING **/

//GROUPS
app.get('/groups', (req, res) => {
  axios.defaults.baseURL = GROUPS_ENDPOINT;
  axios.get(req.path, {headers: req.headers}).then(resp => {
    res.send(resp.data)
  }, error => errorHandler(error, req, res))
})

app.get('/groups/:id', (req, res) => {
  axios.defaults.baseURL = GROUPS_ENDPOINT;
  axios.get(req.path, {headers: req.headers}).then(resp => {
    res.send(resp.data)
  }, error => errorHandler(error, req, res))
})

app.post('/groups', (req, res) => {
  axios.defaults.baseURL = GROUPS_ENDPOINT;
  axios.post(req.path, req.body, {headers: req.headers}).then(resp => {
    res.send(resp.data)
  }, error => errorHandler(error, req, res))
})

app.put('/groups/:id', (req, res) => {
  axios.defaults.baseURL = GROUPS_ENDPOINT;
  axios.put(req.path, req.body, {headers: req.headers}).then(resp => {
    res.send(resp.data)
  }, error => errorHandler(error, req, res))
})

app.delete('/groups/:id', (req, res) => {
  axios.defaults.baseURL = GROUPS_ENDPOINT;
  axios.delete(req.path, {headers: req.headers}).then(resp => {
    res.send(resp.data)
  }, error => errorHandler(error, req, res))
})

//USERS
app.get('/users', (req, res) => {
  axios.defaults.baseURL = USERS_ENDPOINT;
  axios.get(req.path, {headers: req.headers}).then(resp => {
    res.send(resp.data)
  }, error => errorHandler(error, req, res))
})

app.get('/users/:id', (req, res) => {
  axios.defaults.baseURL = USERS_ENDPOINT;
  axios.get(req.path, {headers: req.headers}).then(resp => {
    res.send(resp.data)
  }, error => errorHandler(error, req, res))
})

app.post('/users', (req, res) => {
  axios.defaults.baseURL = USERS_ENDPOINT;
  console.log(req.body);
  axios.post(req.path, req.body, {headers: req.headers}).then(resp => {
    res.send(resp.data)
  }, error => errorHandler(error, req, res))
})

app.put('/users/:id', (req, res) => {
  axios.defaults.baseURL = USERS_ENDPOINT;
  axios.put(req.path, req.body, {headers: req.headers}).then(resp => {
    res.send(resp.data)
  }, error => errorHandler(error, req, res))
})

app.delete('/users/:id', (req, res) => {
  axios.defaults.baseURL = USERS_ENDPOINT;
  axios.delete(req.path, {headers: req.headers}).then(resp => {
    res.send(resp.data)
  }, error => errorHandler(error, req, res))
})

//SPACES
app.get('/spaces', (req, res) => {
  axios.defaults.baseURL = SPACES_ENDPOINT;
  axios.get(req.path, {headers: req.headers}).then(resp => {
    res.send(resp.data)
  }, error => errorHandler(error, req, res))
})

app.get('/spaces/:id', (req, res) => {
  axios.defaults.baseURL = SPACES_ENDPOINT;
  axios.get(req.path, {headers: req.headers}).then(resp => {
    res.send(resp.data)
  }, error => errorHandler(error, req, res))
})

app.post('/spaces', (req, res) => {
  axios.defaults.baseURL = SPACES_ENDPOINT;
  axios.post(req.path, req.body, {headers: req.headers}).then(resp => {
    res.send(resp.data)
  }, error => errorHandler(error, req, res))
})

app.put('/spaces/:id', (req, res) => {
  axios.defaults.baseURL = SPACES_ENDPOINT;
  axios.put(req.path, req.body, {headers: req.headers}).then(resp => {
    res.send(resp.data)
  }, error => errorHandler(error, req, res))
})

app.delete('/spaces/:id', (req, res) => {
  axios.defaults.baseURL = SPACES_ENDPOINT;
  axios.delete(req.path, {headers: req.headers}).then(resp => {
    res.send(resp.data)
  }, error => errorHandler(error, req, res))
})

app.get('/spaces/:spaceId/bookings', (req, res) => {
  axios.defaults.baseURL = SPACES_ENDPOINT;
  axios.get(req.path, {headers: req.headers}).then(resp => {
    res.send(resp.data)
  }, error => errorHandler(error, req, res))
})

app.get('/spaces/:spaceId/bookings/:bookingId', (req, res) => {
  axios.defaults.baseURL = SPACES_ENDPOINT;
  axios.get(req.path, {headers: req.headers}).then(resp => {
    res.send(resp.data)
  }, error => errorHandler(error, req, res))
})

app.post('/spaces/:spaceId/bookings', (req, res) => {
  axios.defaults.baseURL = SPACES_ENDPOINT;
  axios.post(req.path, req.body, {headers: req.headers}).then(resp => {
    res.send(resp.data)
  }, error => errorHandler(error, req, res))
})

app.put('/spaces/:spaceId/bookings/:bookingId', (req, res) => {
  axios.defaults.baseURL = SPACES_ENDPOINT;
  axios.put(req.path, req.body, {headers: req.headers}).then(resp => {
    res.send(resp.data)
  }, error => errorHandler(error, req, res))
})

app.delete('/spaces/:spaceId/bookings/:bookingId', (req, res) => {
  axios.defaults.baseURL = SPACES_ENDPOINT;
  axios.delete(req.path, {headers: req.headers}).then(resp => {
    res.send(resp.data)
  }, error => errorHandler(error, req, res))
})

//TOKEN
app.post('/token', (req, res) => {
  axios.defaults.baseURL = TOKEN_ENDPOINT;
  axios.post(req.path, req.body, {headers: req.headers}).then(resp => {
    res.send(resp.data)
  }, error => errorHandler(error, req, res))
});


app.listen(PORT);
