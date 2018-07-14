# Alexa local skills

This is a collection of alexa self hosted skills:

- subsonic skill: makes your Echo play music from your local Subsonic/Airsonic server.
- remote skill: user Broadlink RM PRO remote to control your IR devices (TV..)

To make it work you need the following:

- Server with NodeJs 8+ installed and [Airsonic](https://github.com/airsonic/airsonic/releases)
- Port 443 (HTTPS) forwarded and not firewalled
- `duckdns.org` account or public host with HTTPS certificate (letsencrypt.org)

## HTTPS and DNS configuration

### Setup duckdns.org

- Create account, set domain name and get the token
- Install [duckdns updater](https://github.com/nitzzzu/duckdns-updater)

### Setup letsencrypt.org certificates on Windows

- Download [Simple ACME Client for Windows](https://github.com/PKISharp/win-acme)
- Download [curl](https://curl.haxx.se/download.html)
- Create `duckdns-setdns.bat`:

```
@echo off
set arg3=%3
curl -k "https://www.duckdns.org/update?domains={yourdomain}&token={token}&txt=%arg3%"
```

- Create `duckdns-cleardns.bat`:

```
@echo off
curl -k "https://www.duckdns.org/update?domains={yourdomain}&token={token}&clear=true"
```

- Run `letsencrypt.exe` and follow the steps:
    - Choose `Create new Certificate with advanced options` (M)
    - Choose `Manually input host names` (4)
    - Choose `[dns-01] run external program/script` as validation step (2)
    - Set create/clear dns scripts (`duckdns-setdns.bat` and `duckdns-cleardns.bat`)
    - Skip installation scripts
    
- The certificates will be placed in `C:\ProgramData\letsencrypt-win-simple\httpsacme-v01.api.letsencrypt.org`:

```
CA: 'ca-xxx.duckdns.org-crt.pem'
CERT: 'xxx.duckdns.org-crt.pem'
KEY: 'xxx.duckdns.org-key.pem'
```

The certificates expire after 90 days but they are automatically renewed by Scheduled Task.
Once they are renewed you have to recopy them and restart the server.

## Installation and configuration

- Clone source: `git clone https://github.com/nitzzzu/alexa-subsonic-skill`
- Copy the SSL certificates (CA, CERT, KEY) in `./sslcert` folder
- Create configuration file `config.js`:

```
module.exports = {
    REMOTE_SKILL_ID: '[SKILL_ID]',
    SUBSONIC_SKILL_ID: '[SKILL_ID]',
    SUBSONICSERVER: 'http://192.168.1.1:4040',
    SUBSONICUSERNAME: '',
    SUBSONICPASSWORD: '',
    SSLCERTIFICATECA: './sslcert/ca-xxx.duckdns.org-crt.pem',
    SSLCERTIFICATECERT: './sslcert/xxx.duckdns.org-crt.pem',
    SSLCERTIFICATEKEY: './sslcert/xxx.duckdns.org-key.pem',
    STREAMURL: 'https://xxx.duckdns.org/stream?q='
};
```

- Install: `npm install`
- (OPTIONAL) Install as windows service: `node winservice install`
- Start the service OR `node server.js`

## Skill configuration on Amazon

- It is required to have an Amazon developer account: [Alexa console](https://developer.amazon.com/alexa/console/ask)
- Install Alexa CLI: 'npm install -g ask-cli'
- Link to your developer account: `ask init` (choose: `No. Skip AWS credentials association step.` when asked)
- Deloy skills:
    - Skills schemas are places in `schemas` folder
    - Change url in skill manifest file `skill.json` (replace `https://xxx.duckdns.org/remote` with your duckdns account)
    - To deploy them run `deploy.bat` in each folder from `schemas`.
    - Adapt skill ids in `config.js` (skill ids can be found in `.ask` folder)

- Enable skill in alexa app
- Enjoy

## Skill usage

> Alexa, ask subsonic to play eminem  
> Alexa, ask remote turn on TV
