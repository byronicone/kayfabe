const Sentiment = require('sentiment');
const dotenv = require('dotenv');
const colors = require('colors/safe');
const Twit = require('twit');
const R = require('ramda');

dotenv.config();

const { CONSUMER_KEY
      , CONSUMER_SECRET
      , ACCESS_TOKEN
      , ACCESS_TOKEN_SECRET
      } = process.env;

const config_twitter = {
    consumer_key: CONSUMER_KEY,
    consumer_secret: CONSUMER_SECRET,
    access_token: ACCESS_TOKEN,
    access_token_secret: ACCESS_TOKEN_SECRET,
    timeout_ms: 60*1000
};

let api = new Twit(config_twitter);
String.prototype.color = function(sentiment){
  if(sentiment > 5){
    return colors.green(this);
  }
  else if(sentiment > -5){
    return colors.yellow(this);
  }
  else{
   return colors.red(this);
  }
}

module.exports = {
  getSentiment: async function(wrestlers) {
    let result = {positive:[], negative:[]};

    for(let wrestler of wrestlers){
      let sentiment = new Sentiment();
      let count = 100;
      let tweets = await this.getTweets(wrestler, count);
      let overallSentiment = 0;
      for (tweet of tweets) {
          let score = sentiment.analyze(tweet.full_text).comparative;
          if (score > 0) {
            result.positive.push(tweet);
          } else if (score < 0) {
            result.negative.push(tweet);
          }
      }
    }

    return result;
  },

  getPageOfTweets: function(fn, endpoint, options){
    return async function(){
        let tweets = await fn.call(endpoint, options);
        return tweets.data.statuses.reduce((uniqueTweets, oneTweet) => {
          if(oneTweet.retweeted_status == null){
            uniqueTweets.push(R.pick(['full_text'], oneTweet));
          }
          return uniqueTweets;
        }, []);
    }
  },

  getTweets: async function(q, count) {
      try{
        let page = 1;
        let tweets = [];
        let getPage = this.getPageOfTweets(api.get, 'search/tweets', {q, count, tweet_mode: 'extended', include_entities: false})
        while(page){
          tweets.concat(await getPage());
          page = tweets.page;
        }
        return tweets;
      }
      catch(err){
        console.log(`This query triggered an error:  ${q}`);
        console.log(err);
      }
  }
}
