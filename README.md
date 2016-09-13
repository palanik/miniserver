# miniserver
Mini http server, serving static files.

> A server for developers and by developers.

[![NPM version](https://img.shields.io/npm/v/miniserver.svg?style=flat)](https://www.npmjs.org/package/miniserver)

## Installation
```
$ npm install miniserver -g
```

## Quick Start
To serve current directory:
```
$ miniserver
```

To serve specific folder:
```
$ miniserver projects/dream
```

To run on production mode:
```
$ NODE_ENV=production miniserver projects/dream
```


## Features
* Runs in cluster of processes to take advantage of multi-core systems
* Directory listing as html/json/text (`HTTP Accept`) via [serve-index](https://npmjs.org/package/serve-index)
* Access logs via [morgan](https://npmjs.org/package/morgan)
* [cors](https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS) support via [cors](https://nodei.co/npm/cors/)
* [basic authentication](https://en.wikipedia.org/wiki/Basic_access_authentication) via [basic-auth
](https://npmjs.org/package/basic-auth)
* gzip compression via [compression](https://npmjs.org/package/compression)
* Customizable via command line options
* Development & Production modes via `NODE_ENV` environment variable - `development` or `production`

## Options
* `--port` Port to use. Default is 8080 on `development` mode and 80 on `production` mode
* `--log` or `--no-log` Enable or disable logging
* `--logformat` morgan log [format](https://github.com/expressjs/morgan#predefined-formats). Default is `dev` on `development` mode and `compact` on `production` mode.
* `--cors` or `--no-cors` Enable or disable cors. Enabled in `development` mode
* `--compress` or `--no-compress` Enable or disable compression. Disabled in `development` mode

## License

  [MIT](LICENSE)
