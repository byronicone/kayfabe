var kayfabe = {};

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

async function getWrestlerSentiments(wrestlers) {
  for(let wrestler of wrestlers){
    let sentiment = new Sentiment();
    let count = 100;
    let tweets = await getTweets(wrestler, count);
    let pos = 0;
    let neg = 0;
    for (tweet of tweets) {
        let score = sentiment.analyze(tweet).comparative;
        tweet = `${tweet}\n`;
        if (score > 0) {
          pos++;
        } else if (score < 0) {
          neg++;
        }
    }

    let message = `${wrestler}: ${pos} positive vs. ${neg} negative.\n`;
    console.log(message.color(pos-neg));
  }
}

kayfabe.getPageOfTweets = async function getPageOfTweets(q, count){
    try{
      let tweets = await api.get('search/tweets', {q, count, tweet_mode: 'extended', include_entities: false});
      return tweets.data.statuses.reduce((uniqueTweets, oneTweet) => {
        if(oneTweet.retweeted_status == null){
          uniqueTweets.push(R.pick(['full_text'], oneTweet));
        }
        return uniqueTweets;
      }, []);
    }
    catch(e){
      console.log('Could not get page of tweets');
      return e;
    }
}

kayfabe.getTweets = async function getTweets(q, count) {
    try{
      let tweets = await kayfabe.getPageOFTweets(q, count);
    }
    catch(err){
      console.log(`This query triggered an error:  ${q}`);
      console.log(err);
    }
}

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

for(prop in kayfabe) {
   if(kayfabe.hasOwnProperty(prop)) {
     module.exports[prop] = kayfabe[prop];
   }
}
