const BigInt = require('big.js');
const request = require('request');

function getTweets(screenName, tweetID) {
  return new Promise((resolve, reject) => {
    request.get(
      {
        url: `https://api.twitter.com/1.1/statuses/user_timeline.json?screen_name=${screenName}&since_id=${BigInt(tweetID).minus(1).toString()}`,
        auth: { bearer: process.env.TWITTER_BEARER },
        json: true
      }, (err, response, body) => {
      if (err) {
        return reject(err);
      }
      return resolve(body);
    });
  });
}

function sortTweetsOldestToNewest(tweets) {
  return Promise.resolve(tweets.sort((a, b) => a.id - b.id));
}

function getMessageObject(tweet) {
  return {
    text: tweet.text.replace('’', '\''),
    link: `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`
  };
}

function buildStream(initialTweetID, tweets) {
  const stream = { messages: [] };
  const replyIDs = [initialTweetID];

  for (const tweet of tweets) {
    if (tweet.id_str === initialTweetID) {
      stream.user = {
        name: tweet.user.name,
        screen_name: tweet.user.screen_name,
        icon: tweet.user.profile_image_url_https
      };
      stream.messages.push(getMessageObject(tweet));
      replyIDs.push(tweet.id_str);
    } else if (replyIDs.includes(tweet.in_reply_to_status_id_str)) {
      stream.messages.push(getMessageObject(tweet));
      replyIDs.push(tweet.id_str);
    }
  }

  return stream;
}

module.exports = function getTweetStream(screenName, tweetID) {
  return getTweets(screenName, tweetID)
    .then(sortTweetsOldestToNewest)
    .then(tweets => buildStream(tweetID, tweets));
};
