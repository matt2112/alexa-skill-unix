const context = require('aws-lambda-mock-context');
const expect = require('chai').expect;

const index = require('../lambda/index');

const ctx = context();

const testJson = require('./requests/unix-1.json');

describe('Testing the Unix intent', () => {

  let speechResponse = null;
  let speechError = null;

  before((done) => {
    index.handler(testJson, ctx);
    ctx.Promise
      .then((response) => {
        speechResponse = response;
        done();
      })
      .catch((error) => {
        speechError = error;
        done();
      });
  });

  describe('Testing for March 4, 2017', () => {
    it('should not have errored', () => expect(speechError).to.be.null);
    it('should equal 1488585600', () => expect(speechResponse.response.outputSpeech.ssml)
                                          .to.equal('<speak> The unix time for March 4, 2017 is 1488585600. </speak>'));
  });
});
