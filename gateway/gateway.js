var express = require('express');
const axios = require('axios');

if (process.env.PROD == undefined) process.env["NODE_CONFIG_DIR"] = "../config";
const config = require('config');

const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json());
const BASE_URL = config.get('baseURL');
const SPACES_PORT = config.get('spacesPort');
const GROUPS_PORT = config.get('groupsPort');
const USERS_PORT = config.get('usersPort');
const TOKEN_PORT = config.get('tokenPort');
const PORT = config.get('gatewayPort');
const SPACES_ENDPOINT = `${BASE_URL}:${SPACES_PORT}`;
const GROUPS_ENDPOINT = `${BASE_URL}:${GROUPS_PORT}`;
const USERS_ENDPOINT = `${BASE_URL}:${USERS_PORT}`;
const TOKEN_ENDPOINT = `${BASE_URL}:${TOKEN_PORT}`;

/*** UTILS ***/ 
function unless(middleware, ...excludedUrl){
  return function(req, res, next){
      const match = excludedUrl.some(url => ((req.path == url.path || req.path.slice(0,req.path.length-1) == url.path) && url.method == req.method));
      match ? next() : middleware(req, res, next);           
  }
}

function errorHandler(error, req, res) {
  if(error.response)
    res.status(error.response.status).json(error.response.data)
  else
    res.status(500).send(`<html><body><h2>Sorry, we encuntered an error with your request to ${req.path}, our staff will fix it soon</h2><img src='https://cdn.dribbble.com/users/15084/screenshots/1368807/suchgif.gif'></body></html>`)
}

/** MIDDLEWARES **/
const mwAuth = (!process.env.PROD) ? require('../middleware/mwAuth') : require('./middleware/mwAuth.js');
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