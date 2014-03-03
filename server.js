var express = require('express'),
    http = require('http');

var app = express();

// Configure server
app.configure(function() {
    app.set('views', __dirname + '/');
    app.engine('html', require('ejs').renderFile);
    app.use(express.bodyParser());
    app.use(express.static(__dirname + '/'));
    // app.use(express.logger());
    app.use(express.methodOverride());
    app.use(app.router);
    app.locals.pretty = true;
    //Show all errors in development
    // app.use(express.errorHandler({dumpExceptions: true, showStack: true}));
});

// ROUTING
app.get('/', function (req, res) {
    res.render('index.html');
});

function startKeepAlive() {
    setInterval(function() {
        var options = {
            host: 'social-insights.herokuapp.com',
            port: 80,
            path: '/'
        };
        http.get(options, function(res) {
            res.on('data', function(chunk) {
                try {
                    // optional logging... disable after it's working
                    // console.log("HEROKU RESPONSE: " + chunk);
                } catch (err) {
                    console.log(err.message);
                }
            });
        }).on('error', function(err) {
            console.log("Error: " + err.message);
        });
    }, 60 * 30 * 1000); // load every 30 minutes
}

startKeepAlive();

var port = process.env.PORT || 5000;
app.listen(port, function() {
    console.log("Listening on " + port);
});