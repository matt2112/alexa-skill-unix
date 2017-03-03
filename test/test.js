const context = require('aws-lambda-mock-context');
const expect = require('chai').expect;

const index = require('../lambda/index');

const ctx = context();

const testJson = {
  "session": {
    "sessionId": "SessionId.16a942ea-b7fe-410c-a998-cf3a3acdefeb",
    "application": {
      "applicationId": "amzn1.ask.skill.992e39da-abb5-40ae-b54d-a0550567249e"
    },
    "attributes": {},
    "user": {
      "userId": "amzn1.ask.account.AH5AQY4HZJQFVCGUPSHMNYNCRZ4THO3ACOCXF3S54IBHTN7MGQU4KUV73YTJCV75V5UIU344BBNLOFP6IDQCSQMU2X6PYWQ7ZITO6VIPUZ2HRJ3THFJWCS5WG4JXI56KTJ5MJIATYD5UTMKHDMTZ6EYDOWMB3LZ2W4CBJSNN3NEYVLFRPWFQZQLNKOJJMDTS3O7E4PBXZFGV4JA"
    },
    "new": true
  },
  "request": {
    "type": "IntentRequest",
    "requestId": "EdwRequestId.3a9602df-f1ba-4b6d-85a1-d48b7eed9f57",
    "locale": "en-GB",
    "timestamp": "2017-03-03T12:28:44Z",
    "intent": {
      "name": "Unix",
      "slots": {
        "Date": {
          "name": "Date",
          "value": "2017-03-04"
        }
      }
    }
  },
  "version": "1.0"
};

describe('Testing the Unix intent', () => {

  let speechResponse = null;
  let speechError = null;

  before((done) => {
    index.handler(testJson, ctx);
    ctx.Promise
      .then((response) => {
        speechResponse = response;
        console.log(speechResponse);
        done();
      })
      .catch((error) => {
        speechError = error;
        done();
      });
  });

  describe('Is the response structurally correct', () => {
    it('should not have errored', () => {
      expect(speechError).to.be.null;
    });
  });
});
