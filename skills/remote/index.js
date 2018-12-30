const Alexa = require('ask-sdk-core');
const logger = require('winston');
const config = require('../../config');
const BroadlinkJS = require('broadlinkjs-rm');
const convertProntoCode = require('./convertProntoCode');

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder.speak('Welcome to the Alexa Local Skills!').getResponse();
    }
};

const TurnOnIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest' && handlerInput.requestEnvelope.request.intent.name === 'TurnOnIntent';
    },
    handle(handlerInput) {
        let device = handlerInput.requestEnvelope.request.intent.slots.device.value;

        logger.info('Turning on ' + device);

        let broadlink = new BroadlinkJS();
        broadlink.discover();

        broadlink.on('deviceReady', device => {
            // const macAddressParts = device.mac.toString('hex').match(/[\s\S]{1,2}/g) || [];
            // const macAddress = macAddressParts.join(':');
            // device.host.macAddress = macAddress;

            let hexData =
                '0000 006C 0022 0002 015B 00AD 0016 0016 0016 0016 0016 0041 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0041 0016 0041 0016 0016 0016 0041 0016 0041 0016 0041 0016 0041 0016 0041 0016 0016 0016 0016 0016 0016 0016 0041 0016 0016 0016 0016 0016 0016 0016 0016 0016 0041 0016 0041 0016 0041 0016 0016 0016 0041 0016 0041 0016 0041 0016 0041 0016 05F7 015B 0057 0016 0E6C';
            if (hexData.substring(0, 4) === '0000') {
                hexData = convertProntoCode(hexData);
            }

            const hexDataBuffer = new Buffer(hexData, 'hex');
            device.sendData(hexDataBuffer, false, hexData);
        });

        return handlerInput.responseBuilder.speak(`Turning on ${device}`).getResponse();
    }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest' && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder.speak(`You can say 'Turn On TV'`).getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return (
            handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent' ||
                handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent')
        );
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder.speak('Goodbye!').getResponse();
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
    .addRequestHandlers(LaunchRequestHandler, TurnOnIntentHandler, HelpIntentHandler, CancelAndStopIntentHandler, SessionEndedRequestHandler)
    .addErrorHandlers(ErrorHandler)
    .withSkillId(config.REMOTE_SKILL_ID)
    .create();
