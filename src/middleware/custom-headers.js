
export default function customHeaders(hfield, ...hvals) {
  return ((req, res, next) => {
    function header(field, ...vals) {
      if ((typeof field) !== 'string') {
        for (const key of Object.keys(field)) {
          header((key, field[key]));
        }
      } else {
        let val = (vals.length === 1) ? vals[0] : vals;
        if (Array.isArray(val)) {
          val = val.map(String);
        } else if (typeof val === 'function') {
          // async callback
          if (val.length > 2) {
            setImmediate(() => {
              val(req, res, (asyncVal) => {
                res.setHeader(field, asyncVal);
              });
            });
            return;
          }
          val = val(req, res);
        }

        res.setHeader(field, val);
      }
    }

    header(hfield, ...hvals);
    return next();
  });
}
