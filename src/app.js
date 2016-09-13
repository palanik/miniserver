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

  use(...mws) {
    if (mws.length === 1) {
      const mw = mws[0];
      if (Array.isArray(mw)) {
        return this.use(...mw);
      }
      this.middlewares.push(mw);
      return this;
    }

    mws.forEach((mw) => {
      this.use(mw);
    });

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
