let lastSearch;

let lastPlaybackStart;
let lastPlaybackStop;

let repeatEnabled = false;
const config = require('./config');
const querystring = require('querystring');

const handlers = {
    LaunchRequest: function() {
        this.emit(':tell', 'I can play your local music hosted on Subsonic');
    },
    SearchIntent: function() {
        let query = this.event.request.intent.slots.SearchQuery.value;
        console.log('Searching ... ' + query);

        lastSearch = config.STREAMURL + querystring.escape(query);
        lastPlaybackStart = new Date().getTime();
        this.response.speak('Playing song').audioPlayerPlay('REPLACE_ALL', lastSearch, 'myMusic', undefined, 0);
        this.emit(':responseReady');
    },
    PlaybackStarted: function() {
        console.log('Alexa begins playing the audio stream');
    },
    PlaybackFinished: function() {
        console.log('The stream comes to an end');
        if (repeatEnabled && lastSearch) {
            console.log('Repeat was enabled. Playing ' + lastSearch + ' again ...');
            this.response.audioPlayerPlay('REPLACE_ALL', lastSearch, 'myMusic', undefined, 0);
            lastPlaybackStart = new Date().getTime();
            this.emit(':responseReady');
        }
    },
    PlaybackStopped: function() {
        console.log('Alexa stops playing the audio stream');
    },
    PlaybackNearlyFinished: function() {
        console.log('The currently playing stream is nearly complate and the device is ready to receive a new stream');
    },
    PlaybackFailed: function() {
        console.log('Alexa encounters an error when attempting to play a stream');
        console.log(this.event);
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
        console.log('Repeat enabled.');
        repeatEnabled = true;
        this.emit(':tell', 'Repeat enabled');
    },
    'AMAZON.LoopOffIntent': function() {
        console.log('Repeat disabled.');
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
        console.log('session ended!');
    },
    Unhandled: function() {
        this.response.speak("Sorry, I didn't get that");
        this.emit(':responseReady');
    }
};

module.exports = { handlers };
