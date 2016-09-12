import finalhandler from 'finalhandler';
import http from 'http';

export default class App {
  constructor() {
    this.settings = new Map();
    this.middlewares = [];
  }

  get(key) {
    return this.settings.get(key);
  }

  set(key, value) {
    this.settings.set(key, value);
    return this;
  }

  use(mw) {
    this.middlewares.push(mw);
    return this;
  }

  serve(req, res) {
    const middlewares = this.middlewares;
    let idx = 0;

    function next(err) {
      if (err || idx >= middlewares.length) {
        setImmediate(() => {
          const done = finalhandler(req, res);
          done(err);
        });
        return;
      }

      const mw = middlewares[idx];
      idx += 1;
      mw(req, res, next);
    }

    try {
      next();
    } catch (e) {
      finalhandler(req, res)(e);
    }
  }

  listen(...args) {
    const server = http.createServer(this.serve.bind(this));
    server.listen(...args);

    return server;
  }
}
