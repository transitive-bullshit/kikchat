module.exports = KikChat

// external
var debug = require('debug')('kikchat')
var request = require('request')

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
  get: function () { return this._username && this._apiToken }
})

/**
 * Kik developer API key associated with the active user.
 *
 * @name KikChat#apiToken
 * @property {string}
 */
Object.defineProperty(KikChat.prototype, 'apiToken', {
  get: function () { return this._apiToken }
})

/**
 * Signs into KikChat.
 *
 * Note that username and apiToken are optional only if their environment
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
}
