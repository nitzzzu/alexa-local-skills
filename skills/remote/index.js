const logger = require('winston');
const config = require('../../config');
const BroadlinkJS = require('broadlinkjs-rm');
const convertProntoCode = require('./convertProntoCode');

const handlers = {
    TurnOnIntent: function() {
        let device = this.event.request.intent.slots.device.value;

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
        this.emit(':responseReady');
    },
    'AMAZON.StopIntent': function() {},
    'AMAZON.HelpIntent': function() {},
    SessionEndedRequest: function() {},
    Unhandled: function() {
        this.response.speak("Sorry, I didn't get that");
        this.emit(':responseReady');
    }
};

module.exports = { handlers };
