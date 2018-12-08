const next = require('next');
const http = require('http');
const routes = require('./routes');

const app = next({ dev: process.env.NODE_ENV !== 'production' });
const handler = routes.getRequestHandler(app);

app.prepare().then(() => {
    http.createServer(handler).listen(3000, () => {
        console.log('server started on port: 3000');
    });
});
