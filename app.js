/**
 * app.js
 */
'use strice';

const bodyParser = require('body-parser');
const express = require('express');
const app = new express();
const request = require('request');

// conf
const CONF = require('./conf/config.json');

// parse json body.
app.use(bodyParser.json());
// static contents.
app.use(express.static(__dirname + '/public'));

// execute request
app.post('/rest/request', function(clientReq, clientRes) {
  // リクエストを生成して投げる.
  var resBody = {};
  resBody['requestContent'] = clientReq.body;
  console.log(clientReq.body.body);
  var options = {
    method: clientReq.body.method,
    uri: clientReq.body.uri,
    headers: clientReq.body.headers,
    body: clientReq.body.body
  };

  // User-Agent設定
  var ua = "";
  if (clientReq.body.headers["User-Agent"]) {
    ua = clientReq.body.headers["User-Agent"];
  } else {
    ua = clientReq.headers["user-agent"];
  }
  options.headers["User-Agent"] = ua;

  request(options, function(error, response, body) {
    console.log('Request end.', response);
    if (error) {
      resBody['responsInfo'] = {
        resError : error.toString()
      };
    } else {
      resBody['requestInfo'] = {
        reqRawHeader : response.req._header,
        reqHeaders : response.req._headers,
        reqBody : response.request.body
      };
      resBody['responsInfo'] = {
        resStatus : response.statusCode,
        resHeaders : response.headers,
        resBody : body
      };
    }
    clientRes.send(JSON.stringify(resBody));
  });
});

// 起動
app.listen(CONF.server.port);
console.log(`access to http://localhost:${CONF.server.port}/index.html`);
