var kayfabe = {};

const Sentiment = require('sentiment');
const dotenv = require('dotenv');
const colors = require('colors/safe');
const Twit = require('twit');

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
    return await api.get('search/tweets', {q, count, tweet_mode: 'extended'});
}

kayfabe.getTweets = async function getTweets(q, count) {
    try{
      let knownTexts = new Set();
      let tweets = await kayfabe.getPageOFTweets(q, count);
      return tweets.data.statuses.reduce((uniqueTweets, tweet) => getTextNoDupes(uniqueTweets, tweet), new Set());
    }
    catch(err){
      console.log(`This query triggered an error:  ${q}`);
      console.log(err);
    }
}

function getTextNoDupes(uniqueTweets, oneTweet) {
    let txt = oneTweet.retweeted_status ? oneTweet.retweeted_status.full_text : oneTweet.full_text;
    txt = txt.split(/ |\n/).filter(v => !v.startsWith('http')).join(' ');
    if(oneTweet.user.screen_name == 'WWE'){
      // console.log('filtering out WWE tweet');
    }
    else{
      uniqueTweets.add(txt);
    }
    return uniqueTweets;
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
