import yargs from 'yargs';
import App from './app.js';
import clusterize from './clusterize.js';

import build from './build';

const env = process.env.NODE_ENV || 'development';
const version = require('../package')
  .version;  // eslint-disable-line import/newline-after-import
const serverName = require('../package')
  .name;  // eslint-disable-line import/newline-after-import
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
  .epilog(`${serverName} ${version}. Copyright (c) 2016 palanik`)
  .alias('h', 'help')
  .alias('logformat', 'morgan.format')
  .alias('host', 'hostname')
  .alias('addtype', 'AddType')
  .alias('addType', 'AddType')
  .boolean(['log', 'cors', 'compress'])
  .number('port')
  .string('host')
  .coerce('AddType', (addType) => {
    const at = addType.split(' ');
    if (at.length < 2) {
      throw Error('Invalid format for AddType. --AddType "media-type extension [extension] ..."');
    }
    const mediaType = at.shift();
    const extensions = at;
    return { mediaType, extensions };
  })
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

// The app
const app = new App();

// App settings
app.set('name', serverName);
app.set('version', version);
app.set('env', process.env.NODE_ENV);

app.set('log', options.log);
if (options.auth) {
  app.set('auth', options.auth);
}
app.set('cors', options.cors);
app.set('compress', options.compress);
app.set('docRoot', options._.length > 0 ? options._[0] : process.cwd());
app.set('AddType', options.AddType);
app.set('morgan.format', options.morgan.format);
app.set('morgan.options', options.morgan.options);
app.set('compression.options', options.compression.options);
app.set('port', options.port);
app.set('hostname', options.hostname);

build(app);

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
        .info(`${serverName} # ${cluster.worker.id} serving ${docRoot} on ${hostname || 'port'}:${port}`);
    }
  });

  app.listen(...args);
});
