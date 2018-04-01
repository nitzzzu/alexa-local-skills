const https = require('https');
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const bodyParser = require('body-parser');
const Alexa = require('alexa-sdk');
const request = require('request');
const logger = require('./logger.js');

const config = require('./config');

const subsonic = require('./subsonic');
const subsonicSkillHandlers = require('./skills/subsonic-skill').handlers;

const app = express();
app.use(cors());
app.options('*', cors());
app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
        extended: true
    })
);

// app.get('/', (req, res) => res.sendStatus(200));

app.get('/stream', async (req, res) => {
    let options = await subsonic.streamUrl(req.query.q);

    let r = request(options);
    r.on('response', function(res1) {
        res1.pipe(res);
    });
});

app.post('/subsonic', (req, res) => {
    const context = {
        fail: () => {
            res.sendStatus(500);
        },
        succeed: data => {
            res.send(data);
        }
    };

    const alexa = Alexa.handler(req.body, context);
    alexa.appId = config.ALEXA_APPLICATION_ID;
    alexa.registerHandlers(subsonicSkillHandlers);
    alexa.execute();
});

subsonic.open(config.SUBSONICSERVER, config.SUBSONICUSERNAME, config.SUBSONICPASSWORD);

// app.listen(80, () => {
//     logger.info('Server started');
// });

https
    .createServer(
        {
            ca: fs.readFileSync(config.SSLCERTIFICATECA),
            cert: fs.readFileSync(config.SSLCERTIFICATECERT),
            key: fs.readFileSync(config.SSLCERTIFICATEKEY)
        },
        app
    )
    .listen(443, () => {
        logger.info('Skill started');
    });
