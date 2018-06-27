var expect = require('chai').expect;
var kf = require('../kayfabe');
var fs = require('fs');

describe('sentiment analysis of wrestling-relating tweets', () =>{
  before( () => {
  })
  it('gets one page of tweets about Roman Reigns', async () => {
    let tweets = await kf.getPageOfTweets('Roman Reigns', 100);
    expect(tweets).to.have.length;
    tweets.map( (tweet) => {
      expect(tweet).to.be.an('object')
        .that.includes.all.keys('full_text');
    })
  })
  it('gets the text from a non-duplicate tweet by a valid user', () => {
  })
})
