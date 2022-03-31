const each = (object, cb) => Object.keys(object).forEach(key => cb(key, object[key]));

module.exports = each;
