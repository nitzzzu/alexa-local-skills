# alexa-subsonic-skill

This makes your Echo play music from your local Subsonic/Airsonic server.
To make it work you need the following:

*   [Airsonic](https://github.com/airsonic/airsonic/releases) installed on your server
*   HTTPS certificate (letsencrypt.org)
*   `DuckDns.org` account or public host

## HTTPS and DNS configuration

### Setup DuckDns.org

*   Create account, set domain name and get the token
*   Install [duckdns updater C#](https://github.com/XWolfOverride/DuckDNS) (to automatically refresh duckdns domain)

### Setup letsencrypt.org certificates on Windows

*   Download [win-acme](https://github.com/PKISharp/win-acme)
*   Download [curl](https://curl.haxx.se/download.html)
*   Create `duckdns-setdns.bat`:

```
@echo off
set arg3=%3
curl -k "https://www.duckdns.org/update?domains={yourdomain}&token={token}&txt=%arg3%"
```

*   create `duckdns-cleardns.bat`:

```
@echo off
curl -k "https://www.duckdns.org/update?domains={yourdomain}&token={token}&clear=true"
```

*   Run `letsencrypt.exe` and follow the steps: manual, choose dns validation, set dns scripts, skip installation scripts
*   The certificates will be placed in `C:\ProgramData\letsencrypt-win-simple\httpsacme-v01.api.letsencrypt.org`
*   `{domain}-key.pem` and `{domain}-crt.pem` are needed in the steps that follow

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
