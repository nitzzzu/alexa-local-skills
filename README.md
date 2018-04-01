# alexa-subsonic-skill

This makes your Echo play music from your local subsonic/airsonic server.
To make it work you need the following:

*   [Airsonic](https://github.com/airsonic/airsonic/releases) installed on your server
*   HTTPS certificate (LetsEncrypt)
*   `duckdns.org` account or public host

## HTTPS and DNS configuration

[TODO]

## Installation and configuration

*   `git clone https://github.com/nitzzzu/alexa-subsonic-skill`

-   Place all `ssl` certificates in `./sslcert` folder.
-   Create `config.js` with the following:

```
module.exports = {
    ALEXA_APPLICATION_ID: [ALEXA SKILL ID],
    SUBSONICSERVER: 'http://192.168.1.1:4040',
    SUBSONICUSERNAME: '',
    SUBSONICPASSWORD: '',
    SSLCERTIFICATECA: './sslcert/ca-xxx.duckdns.org-crt.pem',
    SSLCERTIFICATECERT: './sslcert/xxx.duckdns.org-crt.pem',
    SSLCERTIFICATEKEY: './sslcert/xxx.duckdns.org-key.pem',
    STREAMURL: 'https://xxx.duckdns.org/stream?q='
};
```

*   Install as windows service: `node winservice install`
*   Start the service

## Skill configuration on Amazon

*   Open [alexa console](https://developer.amazon.com/alexa/console)

[TODO]

## Skill usage

> Alexa, tell subsonic to play humpty dumpty
