module.exports = KikChat

var debug = require('debug')('kikchat')
var request = require('request')
var zlib = require('zlib')
var uuid = require('node-uuid')
var qs = require('querystring')

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
 * Kik developer API key associated with the active user.
 *
 * @name KikChat#apiKey
 * @property {string}
 */
Object.defineProperty(KikChat.prototype, 'apiKey', {
  get: function () { return this._apiKey }
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

/**
 * Sends a message to a single recipient. Note that the message may be any of several different types.
 *
 * Message types:
 * - text A simple text message.
 * - link A message containing a url to an arbitrary web address. May also be a Kik.js enabled webpage.
 * - picture A message containing a url to an image.
 * - video A message containing a url to a video, as well as some playback configurations.
 * - app-link A message that is delivered to your webhook when a user performs the link action on a Kik.js-enabled webpage.
 * - viral A message that is delivered to your webhook when a user performs a viral action on a Kik.js-enabled webpage.
 * - sticker A message containing information required to display a sticker.  native-platform Y N A message containing an appId that links to another native application.
 * - is-typing A message to indicate that the sender is in the process of typing a message. You dont have to explicitly send these messages. The typeTime parameter is provided as a shortcut to avoid sending these. See Text for more information.
 * - delivery-receipt A message to indicate that you have received a message from a user.
 * - push-receipt A message to indicate that a user has received the push notification for a message.
 * - read-receipt A message to indicate that a user has read a message that you sent them.
 *
 * @param {Object} message
 * @param {Function} cb
 */
KikChat.prototype.sendMessage = function (message, cb) {
  var self = this

  self.sendMessages([ message ], cb)
}

/**
 * Sends multiple messages.
 * @see KikChat#sendMessage for details on individual message parameters.
 *
 * @param {Array<Object>} messages
 * @param {Function} cb
 */
KikChat.prototype.sendMessages = function (messages, cb) {
  var self = this

  // validate each message
  messages.forEach(function (message) {
    if (!message.type) {
      throw new Error('message is missing required \'type\' field')
    }

    if (!message.to) {
      throw new Error('message is missing required \'to\' field')
    }

    if (message.type === 'text' && !message.body) {
      throw new Error('message of type text is missing required \'body\' field')
    }

    if (!message.id) {
      message.id = uuid.v4()
    }
  })

  self._post('/message', { messages: messages }, cb)
}

/**
 * Shuts down this client and invalidates it from further use.
 */
KikChat.prototype.destroy = function (cb) {
  process.nextTick(cb)
}

KikChat.prototype._post = function (endpoint, params, cb) {
  var self = this
  debug('KikChat._post %s %j', endpoint, params)

  if (!self.isSignedIn) {
    throw new Error('KikChat._post requires signin')
  }

  request.post({
    url: self.baseURL + endpoint,
    auth: {
      username: self._username,
      password: self._apiToken
    },
    json: params,
    encoding: null
  }, httpResponseWrapper(endpoint, cb))
}

KikChat.prototype._get = function (endpoint, params, cb) {
  var self = this
  debug('KikChat._get %s %j', endpoint, params)

  if (!self.isSignedIn) {
    throw new Error('KikChat._get requires signin')
  }

  if (typeof params === 'function') {
    cb = params
    params = null
  }

  var query = (params ? '?' + qs.stringify(params) : '')

  request.get({
    url: self.baseURL + endpoint + query,
    auth: {
      username: self._username,
      password: self._apiToken
    },
    encoding: null
  }, httpResponseWrapper(endpoint, cb))
}

function httpResponseWrapper (endpoint, cb) {
  return function (err, response, body) {
    if (err) return cb(err, body)

    if (response && (response.statusCode < 200 || response.statusCode >= 300)) {
      debug('KikChat API error: %d (%s) \nendpoint: %s \nheaders: %j \nrequest: %s\nresponse: %s',
            response.statusCode,
            response.statusMessage,
            endpoint,
            response.request.headers,
            (response.request.body || '').toString().substr(0, 300),
            (body || '').toString().substr(0, 300))

      return cb('KikChat API error ' + response.statusCode + ' (' + response.statusMessage + ')', (body || '').toString())
    }

    var contentType = response.headers['content-type']
    var encoding = response.headers['content-encoding']

    function contentTypeWrapper (err, body) {
      if (err) {
        return cb(err, body)
      } else if (contentType.indexOf('application/json') >= 0) {
        return cb(err, StringUtils.tryParseJSON(body.toString()))
      } else if (contentType.indexOf('text/plain') >= 0) {
        return cb(err, body.toString())
      } else {
        return cb(err, body)
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
  }
}
