import { extname as pathExtname } from 'path';

import morgan from 'morgan';
import serveStatic from 'serve-static';
import serveIndex from 'serve-index';
import compression from 'compression';
import cors from 'cors';

import basicAuth from './middleware/basic-auth';
import customHeaders from './middleware/custom-headers';

export default function build(app) {
  // serve-static
  const serveOptions = {
    index: ['index.html', 'index.htm'],
  };
  if (app.get('AddType')) {
    let addTypes = app.get('AddType');
    if (!Array.isArray(addTypes)) {
      addTypes = [addTypes];
    }

    const mimeTypes = addTypes.reduce((acc, at) => {
      at.extensions.reduce((atAcc, extension) => {
        const ext = (extension[0] === '.') ? extension : (`.${extension}`);
        atAcc[ext] = at.mediaType;  // eslint-disable-line no-param-reassign
        return atAcc;
      }, acc);

      return acc;
    }, {});

    serveOptions.setHeaders = ((res, path) => {
      const ext = pathExtname(path);
      if (mimeTypes[ext]) {
        res.setHeader('Content-Type', mimeTypes[ext]);
      }
    });
  }

  // serve-index
  const indexOptions = {
    icons: true,
  };

  // morgan
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
    .use(customHeaders('Server', `${app.get('name')}/${app.get('version')}`))
    .use(serveStatic(app.get('docRoot'), serveOptions))
    .use(serveIndex(app.get('docRoot'), indexOptions))
  ;

  return app;
}
