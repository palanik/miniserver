import yargs from 'yargs';
import morgan from 'morgan';
import serveStatic from 'serve-static';
import serveIndex from 'serve-index';
import compression from 'compression';
import cors from 'cors';
import App from './app.js';
import clusterize from './clusterize.js';
import basicAuth from './middleware/basic-auth';
import customHeaders from './middleware/custom-headers';

const env = process.env.NODE_ENV || 'development';
const version = require('../package')
  .version;  // eslint-disable-line import/newline-after-import
const defaults = {
  production: {
    port: 80,
    log: true,
    'morgan.format': 'combined',
    cors: false,
    compress: true,
  },
  development: {
    port: 8080,
    log: true,
    'morgan.format': 'dev',
    cors: true,
    compress: false,
    'serveStatic.options.cacheControl': false,
    // 'serveStatic.options.index': ['index.htm', 'index.html'],
  },
}[env];

let argParser = yargs
  .usage('Usage: $0 [--host hostname] [-port port] DocRootFolder')
  .help('h')
  .epilog(`miniserver ${version}. Copyright 2016`)
  .alias('h', 'help')
  .alias('logformat', 'morgan.format')
  .alias('host', 'hostname')
  .boolean(['log', 'cors', 'compress'])
  .number('port')
  .string('host')
  .coerce('auth', (auth) => {
    const up = auth.split(':');
    if (up.length !== 2 || !up[0] || !up[1]) {
      throw Error('Invalid format for auth. --auth username:password');
    }
    return { username: up[0], password: up[1] };
  })
  .default('compression.options.level', -1)
  .default('morgan.options.immediate', false);

// Add env defaults
Object.keys(defaults).forEach((k) => {
  argParser = argParser.default(k, defaults[k]);
});

const options = argParser.argv;

const serveOptions = {
  index: ['index.html', 'index.htm'],
};

const indexOptions = {
  icons: true,
};

const app = new App();

// settings
app.set('env', process.env.NODE_ENV);
app.set('log', options.log);
if (options.auth) {
  app.set('auth', options.auth);
}
app.set('cors', options.cors);
app.set('compress', options.compress);
app.set('docRoot', options._.length > 0 ? options._[0] : process.cwd());
app.set('morgan.format', options.morgan.format);
app.set('morgan.options', options.morgan.options);
app.set('compression.options', options.compression.options);
app.set('port', options.port);
app.set('hostname', options.hostname);

// middlewares
if (app.get('log')) {
  app.use(morgan(
    app.get('morgan.format'),
    app.get('morgan.options')
  ));
}

if (app.get('auth')) {
  const auth = app.get('auth');
  app.use(basicAuth(auth.username, auth.password));
}

if (app.get('cors')) {
  app.use(cors(app.get('cors.options') || {}));
}

if (app.get('compress')) {
  app.use(compression(app.get('compression.options')));
}

app
  .use(customHeaders('X-Powered-By', `miniserver ${version}`))
  .use(serveStatic(app.get('docRoot'), serveOptions))
  .use(serveIndex(app.get('docRoot'), indexOptions))
;

clusterize((cluster) => {
  const port = app.get('port');
  const hostname = app.get('hostname');
  const docRoot = app.get('docRoot');

  const args = [port];
  if (hostname) {
    args.push(hostname);
  }
  args.push(() => {
    if (app.get('log')) {
      console // eslint-disable-line no-console
        .info(`Server # ${cluster.worker.id} serving ${docRoot} on ${hostname || 'port'}:${port}`);
    }
  });

  app.listen(...args);
});
