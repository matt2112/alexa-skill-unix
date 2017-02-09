'use strict';

const Alexa = require('alexa-sdk');
const axios = require('axios');

const handlers = {
    LaunchRequest: function () {
        console.log('Launched');
        this.emit('Unix');
    },
    Unix: function () {
        axios.get('https://mdl-timestamp.herokuapp.com/December%2010,%202016')
            .then((response) => {
                const time = response.data.unix;
                const speechOutput = `This is the unix time: ${time}.`;
                this.emit(':tellWithCard', speechOutput, 'Unix time', time);
            })
            .catch((error) => {
                console.log(error);
                this.emit(':tell', 'There was an error from axios.');
            });
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