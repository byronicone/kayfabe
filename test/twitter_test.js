var expect = require('chai').expect;
var kf = require('../kayfabe');
var fs = require('fs');

describe('sentiment analysis of wrestling-relating tweets', () =>{
  it('gets one page of tweets about Roman Reigns', async () => {
    let tweets = await kf.getPageOfTweets('Roman Reigns', 100);
    expect(tweets).to.have.length;
    tweets.data.statuses.map( (tweet) => {
      expect(tweet).to.be.an('object')
        .that.includes.all.keys('retweeted','full_text');
    })
  })
})
