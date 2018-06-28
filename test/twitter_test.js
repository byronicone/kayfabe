var assert = require('chai').assert;
var expect = require('chai').expect;
var sinon = require('sinon');
var kf = require('../kayfabe');
var fs = require('fs');

const page = require('./fixtures/page_1.json');
const testTweets = require('./fixtures/two_tweets.json');
const opts = {q:'Roman Reigns', count:5, tweet_mode: 'extended', include_entities: false};

describe('sentiment analysis of wrestling-relating tweets', () =>{
  it('gets one page of tweets about Roman Reigns', async () => {
    let callback = sinon.fake.returns(page);
    let getPage = kf.getPageOfTweets(callback, 'search/tweets', opts);
    let tweets =  await getPage();
    assert(callback.calledOnce,'API was not called exactly once.');
    assert(callback.calledOn('search/tweets'), 'Wrong twitter endpoint was called');
    assert(callback.calledWith(opts), 'Options invalid for node_twitter call');
    expect(tweets.length).to.equal(2);
    tweets.map( (tweet) => {
      expect(tweet).to.be.an('object')
        .that.includes.all.keys('full_text');
    })
  })
  it('analyzes the sentiment of tweets', async () => {
      let stub = sinon.stub(kf, "getTweets");
      stub.returns(testTweets);
      let sentiments = await kf.getSentiment(['RomanReigns']);
      assert(stub.calledOnce, 'getTweets was not called exactly once');
      expect(sentiments.positive.length).to.equal(1);
      expect(sentiments.negative.length).to.equal(1);
  })
})
