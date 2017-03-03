'use strict';

const Alexa = require('alexa-sdk');
const axios = require('axios');
const OpearloAnalytics = require('opearlo-analytics');

const REPROMPT = 'What would you like to do?';

const handlers = {

  'LaunchRequest': function () {
    // If no intent given, will call Unix function by default.
    this.emit(':ask', 'Welcome to Unix Time.', REPROMPT);
  },

  'Unix': function () {
    const dateSlot = this.event.request.intent.slots.Date.value;
    let date = new Date(dateSlot);
    // If no date given or not able to parse, then use today's date as default.
    if (date.toString() === 'Invalid Date') {
      date = new Date();
    }
    console.log(`The date you requested is ${date}`);

    const months = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    // getMonth returns a number. Use as index for array above to get word required for API.
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    const dateString = `${month} ${day}, ${year}`;
    console.log(`The datestring has been parsed to ${dateString}`);

    axios.get(`http://timestamp-microservice-dev.eu-west-2.elasticbeanstalk.com/${dateString}`)
      .then((response) => {
        const time = response.data.unix;
        const speechOutput = `The unix time for ${dateString} is ${time}.`;
        OpearloAnalytics.recordAnalytics(this.event.session.user.userId, process.env.OPEARLO_API_KEY, () => {
          this.emit(':tellWithCard', speechOutput, 'Unix time', time);
        });
      })
      .catch((error) => {
        console.log(error);
        OpearloAnalytics.recordAnalytics(this.event.session.user.userId, process.env.OPEARLO_API_KEY, () => {
          this.emit(':tell', 'There was an error when attempting to access the timestamp API.');
        });
      });
  },

  'Natural': function () {
    let time = this.event.request.intent.slots.Time.value;
    console.log(`The time you requested is ${time}.`);
    // If undefined, set time to 0 seconds i.e. January 1st, 1970.
    if (!time) {
      time = 0;
    }

    axios.get(`http://timestamp-microservice-dev.eu-west-2.elasticbeanstalk.com/${time}`)
      .then((response) => {
        const date = response.data.natural;
        const speechOutput = `The natural date for ${time} seconds is ${date}.`;
        OpearloAnalytics.recordAnalytics(this.event.session.user.userId, process.env.OPEARLO_API_KEY, () => {
          this.emit(':tellWithCard', speechOutput, 'Natural date', date);
        });
      })
      .catch((error) => {
        console.log(error);
        OpearloAnalytics.recordAnalytics(this.event.session.user.userId, process.env.OPEARLO_API_KEY, () => {
          this.emit(':tell', 'There was an error when attempting to access the timestamp API.');
        });
      });
  },

  'AMAZON.CancelIntent': function () {
    OpearloAnalytics.recordAnalytics(this.event.session.user.userId, process.env.OPEARLO_API_KEY, () => {
      this.emit(':tell', 'Goodbye!');
    });
  },

  'AMAZON.HelpIntent': function () {
    this.emit(':ask', 'Ask me to convert between unix time and the natural date according to the Gregorian calendar.', REPROMPT);
  },

  'AMAZON.StopIntent': function () {
    OpearloAnalytics.recordAnalytics(this.event.session.user.userId, process.env.OPEARLO_API_KEY, () => {
      this.emit(':tell', 'Goodbye!');
    });
  },

  'Unhandled': function () {
    this.emit(':ask', 'Sorry, I didn\'t understand that request!', REPROMPT);
  },
};

exports.handler = (event, context) => {
  const alexa = Alexa.handler(event, context);
  alexa.appId = process.env.APP_ID || '';
  alexa.registerHandlers(handlers);

  if (event.session.new) {
    console.log('initializing analytics');
    const ID = process.env.OPEARLO_USER_ID || '';
    OpearloAnalytics.initializeAnalytics(ID, 'unix-time', event.session);
    console.log(`activated with ${ID}`);
  }

  if (event.request.type === 'LaunchRequest') {
    console.log('Register Voice Event');
    OpearloAnalytics.registerVoiceEvent(event.session.user.userId, 'LaunchRequest');
  }

  if (event.request.type === 'IntentRequest') {
    OpearloAnalytics.registerVoiceEvent(event.session.user.userId, 'IntentRequest', event.request.intent);
  }

  alexa.execute();
};
