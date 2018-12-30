const https = require('https');
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const bodyParser = require('body-parser');
const request = require('request');
const logger = require('./logger.js');

const config = require('./config');

const subsonic = require('./subsonic');
const subsonicSkill = require('./skills/subsonic/index');
const remoteSkill = require('./skills/remote/index');

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
    subsonicSkill
        .invoke(req.body)
        .then(function(responseBody) {
            res.json(responseBody);
        })
        .catch(function(error) {
            console.log(error);
            res.status(500).send('Error during the request');
        });
});

app.post('/remote', (req, res) => {
    remoteSkill
        .invoke(req.body)
        .then(function(responseBody) {
            res.json(responseBody);
        })
        .catch(function(error) {
            console.log(error);
            res.status(500).send('Error during the request');
        });
});

subsonic.open(config.SUBSONICSERVER, config.SUBSONICUSERNAME, config.SUBSONICPASSWORD);

// app.listen(444, () => {
//     logger.info('Server started');
// });

https
    .createServer(
        {
            //ca: fs.readFileSync(config.SSLCERTIFICATECA),
            cert: fs.readFileSync(config.SSLCERTIFICATECHAIN),
            key: fs.readFileSync(config.SSLCERTIFICATEKEY)
        },
        app
    )
    .listen(443, () => {
        logger.info('Skill started');
    });
