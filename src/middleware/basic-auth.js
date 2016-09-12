import auth from 'basic-auth';
import utils from '../utils/';

export default function basicAuth(username, password) {
  return ((req, res, next) => {
    const credentials = auth(req);
    if (!credentials ||
      credentials.name !== username ||
      credentials.pass !== password) {
      const err = {
        statusCode: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Requires Authorization"',
        },
      };
      next(utils.createError('Authentication Failed', err));
    } else {
      next();
    }
  });
}
