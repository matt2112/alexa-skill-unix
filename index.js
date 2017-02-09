'use strict';

const Alexa = require('alexa-sdk');
const axios = require('axios');

const APP_ID = 43;

const handlers = {
    LaunchRequest: function () {
        // If no intent given, will call Unix function by default.
        this.emit('Unix');
    },
    Unix: function () {
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

        axios.get(`https://mdl-timestamp.herokuapp.com/${dateString}`)
            .then((response) => {
                const time = response.data.unix;
                const speechOutput = `The unix time for ${dateString} is ${time}.`;
                this.emit(':tellWithCard', speechOutput, 'Unix time', time);
            })
            .catch((error) => {
                console.log(error);
                this.emit(':tell', 'There was an error when attempting to access the timestamp API.');
            });
    },
    Natural: function () {
        const date = '10th December, 2016';
        const speechOutput = `This is the natural date: ${date}.`;
        this.emit(':tellWithCard', speechOutput, 'Natural date', date);    
    }
};

exports.handler = (event, context) => {
    const alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};