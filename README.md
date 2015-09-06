# kikchat

### NodeJS client for the Kik Chat API

This project provides an easy-to-use client interface to Kik's chat API, allowing Javascript developers to script Kik bots. Note that currently the Kik Chat API is in private beta testing for preferred Kik developer partners only.

### Install

```bash
npm install kikchat
```

### Usage

The main entrypoint is the KikChat class. You can see a detailed API reference by viewing the auto-generated documentation with `npm run docs`.

KikChat defaults to using required signin credentials stored in environment variables:

- `KIKCHAT_USERNAME` The Kik Chat username to sign in with.
- `KIKCHAT_API_KEY`  The API key associated with your Kik developer account.

```javascript
var KikChat = require('kikchat')

var client = new KikChat()
// note the signIn will default to credentials stored in environment variables
client.signIn(function (err) {
  if (!err) {
    console.log('signed in', client.username)
  }
})
```

Or with explicit credentials:

```javascript
var KikChat = require('kikchat')

var client = new KikChat()
client.signIn('myusername', 'mytoken', function (err, session) {
  if (!err) {
    console.log('signed in', client.username)
  }
})
```

### Contribute

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

See [CONTRIBUTING](https://github.com/fisch0920/kikchat/blob/master/CONTRIBUTING.md).

### Debugging

You can enable [debug](https://www.npmjs.com/package/debug) logs by setting the `DEBUG` environment variable:

```bash
DEBUG=kikchat;
```

### Author

<table><tbody>
<tr><th align="left">Travis Fischer</th><td><a href="https://github.com/fisch0920">GitHub/fisch0920</a></td><td><a href="http://twitter.com/fisch0920">Twitter/@fisch0920</a></td></tr>
</tbody></table>

### Links

- [Kik Chrome Developer Plugin](https://chrome.google.com/webstore/detail/kik-developer-tools/occbnccdhakfaomkhhdkmmknjbghmllm)
- [Public Kik API Reference](http://dev.kik.com/docs) (different than the Kik Chat API).

### License

MIT. Copyright (c) [Travis Fischer](https://github.com/fisch0920).
