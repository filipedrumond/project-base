'use strict';

var express = require('express');
var routes = require('./routes');
var http = require('http');
var MODE = 'dev';

var app = express();

app.use('/build', express.static('./html/build'));
app.use('/assets', express.static('./html/assets'));
app.use('/fonts', express.static('./html/fonts'));
app.use('/node_modules', express.static('./html/node_modules'));
app.use('/.well-known/pki-validation', express.static('./ssl'));

/* NO ROUTES HERE TRATAMENTO PARA O VUE GERENCIAR MAS CUIDADO FUTURO PARA CASO DE POSTS OU TRATAMENTO DE FOTOS ETC */
app.use('*', routes);

var PORT = '';
var HOST = '';
var SAFE_PORT = '';
if (MODE == 'prod') {
    require('dotenv').config({ path: './production.env' });
    PORT = process.env.APLICATION_PORT;
    HOST = process.env.APLICATION_HOST;
    SAFE_PORT = process.env.APLICATION_SAFE_PORT;

    var proxyRouter = express.Router();
    var proxy = express();
    proxyRouter.get('*', (req, res) => {
        res.redirect('https://' + req.headers.host + req.url);
    });
    proxy.use('*', proxyRouter);
    var proxyServer = http.createServer(proxy);
    proxyServer.listen(PORT);
    console.log(`PROXY -- Running on \x1b[33mhttp://${HOST}:${PORT}\x1b[0m`);
} else {
    require('dotenv').config();
    PORT = process.env.APLICATION_PORT;
    HOST = process.env.APLICATION_HOST;
    SAFE_PORT = process.env.APLICATION_SAFE_PORT;

    var httpServer = http.createServer(app);
    httpServer.listen(PORT);
    console.log(`Running on \x1b[33mhttp://${HOST}:${PORT}\x1b[0m`);
}

var fs = require('fs');
var https = require('https');
var privateKey = fs.readFileSync('./ssl/YOUR.private.key', 'utf8');
var certificate = fs.readFileSync('./ssl/YOUR.certificate.crt', 'utf8');
var credentials = { key: privateKey, cert: certificate };
var httpsServer = https.createServer(credentials, app);

httpsServer.listen(SAFE_PORT);
console.log(`Safe Runnning on \x1b[33mhttps://${HOST}:${SAFE_PORT}\x1b[0m`);
