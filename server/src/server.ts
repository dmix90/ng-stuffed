import "reflect-metadata";
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as graphqlHTTP from 'express-graphql';
import * as cors from 'cors';
import * as compression from 'compression';
import * as path from 'path';
import * as favicon from 'serve-favicon';
import { readFileSync } from 'fs';
import { createServer } from 'spdy';
import { createConnection } from 'typeorm';
import schema from '@data/schema';
import prerenderRoutes from '@routes/prerender';

const environment = process.env.NODE_ENV.trim();

const bootstrap = async () => {
    await createConnection().then(res => {
        if (res.isConnected) {
            console.log(`:::Succcessfully connected to the ${res.options.type} <${res.options.database}> database:::`);
        }
    }).catch(err => {
        console.log(`:::Database error -> ${err} :::`);
    })

    const port = process.env.PORT || 80;
    const httpServer = express();
    const httpsServer = express();
    const httpsOptions = {}

    if (environment === 'production' || environment === 'prerender') {
        httpsOptions['key'] = readFileSync('certificate/server.key');
        httpsOptions['cert'] = readFileSync('certificate/server.crt');
        httpServer.use(favicon(path.join(__dirname, '../client', 'favicon.ico')));
        httpsServer.use(favicon(path.join(__dirname, '../client', 'favicon.ico')));
    }

    httpServer.use(compression());
    httpServer.get('*', (req, res, next) => {
        req.secure ? next() : res.redirect('https://' + req.headers.host + req.url);
    })

    httpsServer.use(bodyParser.json());
    httpsServer.use(compression());

    httpsServer.use(express.static('client'));
    httpsServer.use('/api', cors(), graphqlHTTP({
        schema: schema,
        graphiql: true,
    }))

    environment === 'prerender' ? httpsServer.use('/', prerenderRoutes) : null;

    const http2Server = createServer(httpsOptions, httpsServer);

    httpServer.listen(port, () => {
        console.log(`:::Express-HTTP Server is listening on port: ${port}:::`);
    })
    http2Server.listen(443, (err) => {
        if (err) {
            throw new Error(err);
        }
        console.log(`:::Express-HTTP2 Server is listening on port: 443:::`);
    })
}
bootstrap();