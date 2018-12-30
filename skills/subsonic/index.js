// based on https://github.com/alexa/skill-sample-nodejs-audio-player/blob/mainline/multiple-streams/lambda/src/index.js
const Alexa = require('ask-sdk-core');
const querystring = require('querystring');
const logger = require('winston');
const config = require('../../config');

let lastSearch;
let lastPlaybackStart;
let lastPlaybackStop;
let repeatEnabled = false;

const SearchIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest' && handlerInput.requestEnvelope.request.intent.name === 'SearchIntent';
    },
    handle(handlerInput) {
        let query = handlerInput.requestEnvelope.request.intent.slots.SearchQuery.value;

        logger.info('Searching ... ' + query);

        lastSearch = config.STREAMURL + querystring.escape(query);
        lastPlaybackStart = new Date().getTime();
        return handlerInput.responseBuilder
            .speak('Playing song')
            .addAudioPlayerPlayDirective('REPLACE_ALL', lastSearch, 'myMusic', undefined, 0)
            .getResponse();
    }
};

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder.speak('I can play your local music hosted on Subsonic').getResponse();
    }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest' && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder.speak('I can play your local music hosted on Subsonic').getResponse();
    }
};

const AudioPlayerHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type.startsWith('AudioPlayer.');
    },
    async handle(handlerInput) {
        const { requestEnvelope, responseBuilder } = handlerInput;

        switch (requestEnvelope.request.type) {
            case 'AudioPlayer.PlaybackStarted':
                logger.info('Alexa begins playing the audio stream');
                break;

            case 'AudioPlayer.PlaybackFinished':
                logger.info('The stream comes to an end');
                if (repeatEnabled && lastSearch) {
                    logger.info('Repeat was enabled. Playing ' + lastSearch + ' again ...');
                    lastPlaybackStart = new Date().getTime();
                    responseBuilder.addAudioPlayerPlayDirective('REPLACE_ALL', lastSearch, 'myMusic', undefined, 0);
                }
                break;

            case 'AudioPlayer.PlaybackStopped':
                logger.info('Alexa stops playing the audio stream');
                break;

            case 'AudioPlayer.PlaybackNearlyFinished':
                logger.info('The currently playing stream is nearly complate and the device is ready to receive a new stream');
                break;

            case 'AudioPlayer.PlaybackFailed':
                logger.info('Alexa encounters an error when attempting to play a stream');
                break;

            default:
                throw new Error('Should never reach here!');
        }

        return responseBuilder.getResponse();
    }
};

const PauseIntentHandler = {
    async canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest' && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.PauseIntent';
    },
    handle(handlerInput) {
        lastPlaybackStop = new Date().getTime();
        return handlerInput.responseBuilder.addAudioPlayerStopDirective().getResponse();
    }
};

const ResumeIntentHandler = {
    async canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest' && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.ResumeIntent';
    },
    handle(handlerInput) {
        if (lastSearch === undefined) {
            return handlerInput.responseBuilder.speak('Nothing to resume!').getResponse();
        } else {
            return handlerInput.responseBuilder.addAudioPlayerPlayDirective(
                'REPLACE_ALL',
                lastSearch,
                'myMusic',
                undefined,
                lastPlaybackStop - lastPlaybackStart
            );
        }
    }
};

const RepeatIntentHandler = {
    async canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest' && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.RepeatIntent';
    },
    handle(handlerInput) {
        if (lastSearch === undefined) {
            return handlerInput.responseBuilder.speak('Nothing to repeat!').getResponse();
        } else {
            lastPlaybackStart = new Date().getTime();
            return handlerInput.responseBuilder.addAudioPlayerPlayDirective('REPLACE_ALL', lastSearch, 'myMusic', undefined, 0);
        }
    }
};

const LoopOnIntentHandler = {
    async canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest' && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.LoopOnIntent';
    },
    handle(handlerInput) {
        logger.info('Repeat enabled.');
        repeatEnabled = true;
        return handlerInput.responseBuilder.speak('Repeat enabled').getResponse();
    }
};

const LoopOffIntentHandler = {
    async canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest' && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.LoopOffIntent';
    },
    handle(handlerInput) {
        logger.info('Repeat disabled.');
        repeatEnabled = false;
        return handlerInput.responseBuilder.speak('Repeat disabled').getResponse();
    }
};

const StopIntentHandler = {
    async canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest' && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent';
    },
    handle(handlerInput) {
        lastSearch = undefined;
        return handlerInput.responseBuilder.addAudioPlayerStopDirective().getResponse();
    }
};

const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

        return handlerInput.responseBuilder.getResponse();
    }
};

const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`Error handled: ${error.message}`);

        return handlerInput.responseBuilder.speak("Sorry, I can't understand the command. Please say again.").getResponse();
    }
};

module.exports = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        SearchIntentHandler,
        HelpIntentHandler,
        AudioPlayerHandler,
        PauseIntentHandler,
        ResumeIntentHandler,
        RepeatIntentHandler,
        LoopOnIntentHandler,
        LoopOffIntentHandler,
        StopIntentHandler,
        SessionEndedRequestHandler
    )
    .addErrorHandlers(ErrorHandler)
    .withSkillId(config.SUBSONIC_SKILL_ID)
    .create();
