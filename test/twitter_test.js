var kf = require('../kayfabe');
var fs = require('fs');

describe('sentiment analysis of wrestling-relating tweets', () =>{
  it('gets one page of tweets about Roman Reigns', () => {
    kf.getPageOfTweets('Roman Reigns', 100).then( (tweets) => {
    })
  })
})
