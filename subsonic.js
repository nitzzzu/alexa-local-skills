// http://www.subsonic.org/pages/api.jsp

const rp = require('request-promise-native');
const md5 = require('md5');

let subsonic = {
    server: '',
    username: '',
    salt: '',
    authtoken: '',

    getOptions: function(uri, params) {
        let qs = Object.assign(params || {}, {
            v: '1.15.0',
            f: 'json',
            c: 'alexa',
            u: this.username,
            s: this.salt,
            t: this.authtoken
        });

        let options = {
            uri,
            qs,
            json: true
        };
        return options;
    },

    execute: function(method, params) {
        let uri = `${this.server}/rest/${method}.view`;

        try {
            return rp(this.getOptions(uri, params));
        } catch (e) {}
    },

    open: function(server, username, password) {
        this.server = server;
        this.username = username;

        this.salt = Math.random()
            .toString(36)
            .replace(/[^a-z]+/g, '');
        this.authtoken = md5(password + this.salt);
    },

    ping: async function() {
        return await this.execute('ping');
    },

    search: async function(search, useID3, params) {
        let method = useID3 ? 'search3' : 'search2';
        if (!params) {
            params = {};
        }
        params.query = search;
        return await this.execute(method, params);
    },

    streamUrl: async function(search) {
        let response = await subsonic.search(search, true);
        if (response['subsonic-response'] && response['subsonic-response'].searchResult3) {
            let uri = `${this.server}/rest/stream?id=${response['subsonic-response'].searchResult3.song[0].id}`;
            return this.getOptions(uri);
        }
        return '';
    }
};

module.exports = subsonic;
