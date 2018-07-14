const querystring = require('querystring');
const logger = require('winston');
const config = require('../../config');

let lastSearch;
let lastPlaybackStart;
let lastPlaybackStop;
let repeatEnabled = false;

const handlers = {
    LaunchRequest: function() {
        this.emit(':tell', 'I can play your local music hosted on Subsonic');
    },
    SearchIntent: function() {
        let query = this.event.request.intent.slots.SearchQuery.value;

        logger.info('Searching ... ' + query);

        lastSearch = config.STREAMURL + querystring.escape(query);
        lastPlaybackStart = new Date().getTime();
        this.response.speak('Playing song').audioPlayerPlay('REPLACE_ALL', lastSearch, 'myMusic', undefined, 0);
        this.emit(':responseReady');
    },
    PlaybackStarted: function() {
        logger.info('Alexa begins playing the audio stream');
    },
    PlaybackFinished: function() {
        logger.info('The stream comes to an end');
        if (repeatEnabled && lastSearch) {
            logger.info('Repeat was enabled. Playing ' + lastSearch + ' again ...');
            this.response.audioPlayerPlay('REPLACE_ALL', lastSearch, 'myMusic', undefined, 0);
            lastPlaybackStart = new Date().getTime();
            this.emit(':responseReady');
        }
    },
    PlaybackStopped: function() {
        logger.info('Alexa stops playing the audio stream');
    },
    PlaybackNearlyFinished: function() {
        logger.info('The currently playing stream is nearly complate and the device is ready to receive a new stream');
    },
    PlaybackFailed: function() {
        logger.info('Alexa encounters an error when attempting to play a stream');
        logger.info(this.event);
    },
    'AMAZON.PauseIntent': function() {
        this.response.audioPlayerStop();
        lastPlaybackStop = new Date().getTime();
        this.emit(':responseReady');
    },
    'AMAZON.ResumeIntent': function() {
        if (lastSearch === undefined) {
            this.emit(':tell', 'Nothing to resume!');
        } else {
            this.response.audioPlayerPlay('REPLACE_ALL', lastSearch, 'myMusic', undefined, lastPlaybackStop - lastPlaybackStart);
            this.emit(':responseReady');
        }
    },
    'AMAZON.RepeatIntent': function() {
        if (lastSearch === undefined) {
            this.emit(':tell', 'Nothing to repeat!');
        } else {
            this.response.audioPlayerPlay('REPLACE_ALL', lastSearch, 'myMusic', undefined, 0);
            lastPlaybackStart = new Date().getTime();
            this.emit(':responseReady');
        }
    },
    'AMAZON.LoopOnIntent': function() {
        logger.info('Repeat enabled.');
        repeatEnabled = true;
        this.emit(':tell', 'Repeat enabled');
    },
    'AMAZON.LoopOffIntent': function() {
        logger.info('Repeat disabled.');
        repeatEnabled = false;
        this.emit(':tell', 'Repeat disabled');
    },
    'AMAZON.StopIntent': function() {
        lastSearch = undefined;
        this.response.audioPlayerStop();
        this.response.audioPlayerClearQueue();
        this.emit(':responseReady');
    },
    'AMAZON.HelpIntent': function() {
        this.response.speak('I can play your local music hosted on Subsonic');
        this.emit(':responseReady');
    },
    SessionEndedRequest: function() {
        logger.info('session ended!');
    },
    Unhandled: function() {
        this.response.speak("Sorry, I didn't get that");
        this.emit(':responseReady');
    }
};

module.exports = { handlers };
