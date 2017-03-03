'use strict';

const Alexa = require('alexa-sdk');
const axios = require('axios');
const OpearloAnalytics = require('opearlo-analytics');

const REPROMPT = 'What would you like me to do?';

const handlers = {

  'LaunchRequest': function () {
    // Alexa stresses 'Time' too much when followed by 'Unix', so use IPA throughout to remove stress.
    // Also puts a pause before 'date' when followed by 'language'.
    this.emit(':ask', `Welcome to Unix <phoneme alphabet="ipa" ph="taɪm">Time</phoneme>. Ask me to convert between the
              Unix <phoneme alphabet="ipa" ph="taɪm">time</phoneme> and the natural language <phoneme alphabet="ipa" ph="deɪt">deɪt</phoneme>.`,
              REPROMPT);
  },

  'Unix': function () {
    const dateSlot = this.event.request.intent.slots.Date.value;
    const date = new Date(dateSlot);
    // If no date given or not able to parse, then ask the user to try again.
    if (date.toString() === 'Invalid Date') {
      this.emit(':ask', 'I didn\'t understand that, please try again.', REPROMPT);
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
        const speechOutput = `The Unix time for ${dateString} is ${time}.`;
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
    const time = this.event.request.intent.slots.Time.value;
    console.log(`The time you requested is ${time}.`);
    // If no time given or not a number, then ask the user to try again.
    if (isNaN(parseInt(time, 10))) {
      this.emit(':ask', 'I didn\'t understand that, please try again.', REPROMPT);
    }

    axios.get(`http://timestamp-microservice-dev.eu-west-2.elasticbeanstalk.com/${time}`)
      .then((response) => {
        const date = response.data.natural;
        const speechOutput = `The natural language date for ${time} seconds is ${date}.`;
        OpearloAnalytics.recordAnalytics(this.event.session.user.userId, process.env.OPEARLO_API_KEY, () => {
          this.emit(':tellWithCard', speechOutput, 'Natural language date', date);
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
    this.emit(':ask', `Ask me to convert between the Unix <phoneme alphabet="ipa" ph="taɪm">time</phoneme> and the natural
                      language <phoneme alphabet="ipa" ph="deɪt">deɪt</phoneme>. The Unix <phoneme alphabet="ipa" ph="taɪm">time</phoneme>
                      is defined as the number of seconds that have elapsed since Thursday 1st January 1970.`, REPROMPT);
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
    console.log('Initializing Opearlo Analytics');
    const ID = process.env.OPEARLO_USER_ID || '';
    OpearloAnalytics.initializeAnalytics(ID, 'unix-time', event.session);
    console.log(`Initialized with user ID: ${ID}`);
  }

  if (event.request.type === 'LaunchRequest') {
    OpearloAnalytics.registerVoiceEvent(event.session.user.userId, 'LaunchRequest');
  }

  if (event.request.type === 'IntentRequest') {
    OpearloAnalytics.registerVoiceEvent(event.session.user.userId, 'IntentRequest', event.request.intent);
  }

  alexa.execute();
};
