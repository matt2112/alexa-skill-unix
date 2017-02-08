'use strict';

const Alexa = require('alexa-sdk');

const handlers = {
    LaunchRequest: function () {
        console.log('Launched');
        this.emit('Unix');
    },
    Unix: function () {
        const time = 123;
        const speechOutput = `This is the unix time: ${time}.`;
        this.emit(':tellWithCard', speechOutput, 'Unix time', time);    
    },
    Natural: function () {
        const date = 'a b c';
        const speechOutput = `This is the natural date: ${date}.`;
        this.emit(':tellWithCard', speechOutput, 'Natural date', date);    
    }
};

exports.handler = (event, context) => {
    const alexa = Alexa.handler(event, context);
    alexa.registerHandlers(handlers);
    alexa.execute();
};