module.exports = KikChat

var debug = require('debug')('kikchat')
var request = require('request')
var zlib = require('zlib')

var StringUtils = require('./lib/string-utils')

/**
 * KikChat Client
 *
 * @class
 * @param {Object} opts (currently unused)
 */
function KikChat (opts) {
  var self = this
  if (!(self instanceof KikChat)) return new KikChat(opts)
  if (!opts) opts = {}

  debug('new kikchat client')

  self.baseURL = 'https://engine.apikik.com/api/v1'
}

/**
 * The username of the user currently signed in.
 *
 * @name KikChat#username
 * @property {string}
 * @readonly
 */
Object.defineProperty(KikChat.prototype, 'username', {
  get: function () { return this._username }
})

/**
 * Whether or not this client is signed in.
 *
 * @name KikChat#isSignedIn
 * @property {boolean}
 */
Object.defineProperty(KikChat.prototype, 'isSignedIn', {
  get: function () { return this._username && this._apiKey }
})

/**
 * Kik developer API key associated with the active user.
 *
 * @name KikChat#apiKey
 * @property {string}
 */
Object.defineProperty(KikChat.prototype, 'apiKey', {
  get: function () { return this._apiKey }
})

/**
 * Signs into KikChat.
 *
 * Note that username and apiKey are optional only if their environment
 * variable equivalents exist. E.g.,
 *
 * KIKCHAT_USERNAME
 * KIKCHAT_API_KEY
 *
 * @param {string=} Optional username The kik username to sign in with.
 * @param {string=} Optional apiKey The kik developer API key to use.
 * @param {function} cb
 */
KikChat.prototype.signIn = function (username, apiKey, cb) {
  var self = this

  if (typeof username === 'function') {
    cb = username
    username = process.env.KIKCHAT_USERNAME
    apiKey = process.env.KIKCHAT_API_KEY
  }

  if (!(username && apiKey)) {
    throw new Error('missing required login credentials')
  }

  debug('KikChat.signIn (username %s)', username)

  self._username = username
  self._apiKey = apiKey

  process.nextTick(cb)
}

KikChat.prototype.startUpdatesWebhook = function (opts, cb) {
  throw new Error('TODO', opts, cb)
}

KikChat.prototype.stopUpdates = function (opts, cb) {
  throw new Error('TODO', opts, cb)
}

KikChat.prototype.subscribe = function (payload, username, host, cb) {
  var self = this

  if (!(payload && username && host)) {
    throw new Error('KikChat.subscribe invalid params')
  }

  self._post('/subscribe', {
    payload: payload,
    username: username,
    host: host
  }, cb)
}

KikChat.prototype._post = function (endpoint, params, cb) {
  var self = this
  debug('KikChat._post %s %j', endpoint, params)

  if (!self.isSignedIn) {
    throw new Error('KikChat._post requires signin')
  }

  var headers = {
    'Content-Type': 'application/x-www-form-urlencoded'
  }

  request.post({
    url: self.baseURL + endpoint,
    auth: self._username + ':' + self._apiToken,
    headers: headers,
    form: params,
    encoding: null
  }, function (err, response, body) {
    if (err) return cb(err, response, body)

    var contentType = response.headers['content-type']
    var encoding = response.headers['content-encoding']

    function contentTypeWrapper (err, body) {
      if (err) {
        return cb(err, response, body)
      } else if (contentType.indexOf('application/json') >= 0) {
        return cb(err, response, StringUtils.tryParseJSON(body.toString()))
      } else if (contentType.indexOf('text/plain') >= 0) {
        return cb(err, response, body.toString())
      } else {
        return cb(err, response, body)
      }
    }

    if (encoding === 'gzip') {
      zlib.gunzip(body, function (err, dezipped) {
        contentTypeWrapper(err, dezipped && dezipped.toString())
      })
    } else if (encoding === 'deflate') {
      zlib.inflate(body, function (err, decoded) {
        contentTypeWrapper(err, decoded && decoded.toString())
      })
    } else {
      contentTypeWrapper(err, body)
    }
  })
}
