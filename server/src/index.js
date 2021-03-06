var express = require('express');
var app = express();

var handlers = require('./handlers');

var GitHubAPI = require('github');

var bodyParser = require('body-parser');

app.exposeEndpoints = function() {

    app.get('/', function(req, res) {
        res.end('GitRunner Backend!');
    });

    /*
    app.get(_ENDPOINT_, handlers._MyHandlerMethod_)

    e.g.
    */
    app.get('/version', handlers.version);

    app.get('/health', handlers.health);

    //app.get('/player/:playerId/level/:level?', handlers.level);

    app.get('/game/start/:playerID', handlers.startLevel);

    app.get('/game/next/:gameID/:playerID', handlers.nextLevel);

    app.post('/score', handlers.score);

    app.get('/leaderboard/:playerID', handlers.leaderboard);
};

app.initGitHub = function() {
    var github = new GitHubAPI({
        version: '3.0.0',
        debug: app.locals.github.debug,
        protocol: app.locals.github.protocol,
        timeout: app.locals.github.timeout || 30000,
        headers: {
            'user-agent': app.locals.github.userAgent + ' v' + app.locals.appVersion
        }
    });

    github.authenticate({
        type: 'basic',
        username: process.env.GITHUB_USERNAME,
        password: process.env.GITHUB_OAUTH_TOKEN
    });

    handlers.setGitHub(github);
};

exports.boot = function(config) {
    app.locals.httpServer = config.httpServer;
    app.locals.github = config.github;
    app.locals.appVersion = config.appVersion;

    // TODO: Used only for cross-origin, it should be removed
    app.use(function(req, res, next) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Content-Type');
        next();
    });

    app.use(bodyParser.json());
    app.exposeEndpoints();
    app.initGitHub();

    app.listen(config.httpServer.port, function() {
        console.log('httpServer started at ' + config.httpServer.port);
    });
};