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

function get_text(tweet) {
    let txt = tweet.retweeted_status ? tweet.retweeted_status.full_text : tweet.full_text;
    let user = tweet.user.screen_name;
    if(user == 'WWE'){
      console.log(txt);
      console.log('Nice try Vince');
    }
    return txt.split(/ |\n/).filter(v => !v.startsWith('http')).join(' ');
 }

async function get_tweets(q, count) {
    try{
      let tweets = await api.get('search/tweets', {q, count, tweet_mode: 'extended'});
      return tweets.data.statuses.map(get_text);
    }
    catch(err){
      console.log(q);
      console.log(err);
    }
}

async function main(wrestlers) {
  for(let wrestler of wrestlers){
    let sentiment = new Sentiment();
    let count = 100;
    let tweets = await get_tweets(wrestler, count);
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
    message = colorMessage(message, pos - neg);
    //console.log(message);
  }
}

function colorMessage(message, sentiment){
  if(sentiment > 5){
    return colors.green(message);
  }
  else if(sentiment > -5){
    return colors.yellow(message);
  }
  else{
    return colors.red(message);
  }
}

main(['Kevin Owens', 'Sami Zayn', 'Chris Jericho'
,'Shinsuke Nakamura', 'AJ Styles', 'Roman Reigns', 'Triple H', 'Kazuchika Okada'
,'Kenny Omega', 'Curt Hawkins', 'Bludgeon Brothers',
'Velveteen Dream', 'Tommaso Ciampa', 'Carmella', 'Asuka', 'WWEDanielBryan']);
