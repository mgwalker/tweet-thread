const path = require('path');
const getTweetStream = require('./getTweetStream');
const express = require('express');
const mustacheExpress = require('mustache-express');
require('dotenv').config();

const app = express();
app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', path.join(__dirname, '/views'));

app.get('/:screenName/:tweetID', (req, res) => {
  getTweetStream(req.params.screenName, req.params.tweetID)
    .then(stream => res.render('tweet-stream', stream));
});

app.get(/.*/, (req, res) => {
  res.render('index', { });
});

app.listen(process.env.PORT || 8000);
