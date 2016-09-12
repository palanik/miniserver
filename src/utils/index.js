export default {
  createError: (msg, errObj) => {
    const err = new Error(msg);
    Object.keys(errObj).forEach((e) => {
      err[e] = errObj[e];
    });

    return err;
  },
};
