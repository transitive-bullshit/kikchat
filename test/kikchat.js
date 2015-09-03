#!/usr/bin/env node

require('dotenv').load()

var test = require('tape')
var KikChat = require('../')

var KIKCHAT_TEST_USERNAME = process.env.KIKCHAT_TEST_USERNAME

if (!KIKCHAT_TEST_USERNAME) {
  throw new Error('missing required environment variables')
}

var client = new KikChat()

test('KikChat.signIn', function (t) {
  t.notOk(client.isSignedIn)

  client.signIn(function (err) {
    t.notOk(err)
    t.ok(client.isSignedIn)
    t.equal(client.username, process.env.KIKCHAT_USERNAME)
    t.equal(client.apiKey, process.env.KIKCHAT_API_KEY)
    t.end()
  })
})

test('KikChat.sendMessage', function (t) {
  client.sendMessage({
    to: KIKCHAT_TEST_USERNAME,
    type: 'text',
    body: 'test message'
  }, function (err, message) {
    t.notOk(err)
    console.log(err, message)
    t.end()
  })
})

test('KikChat.destroy', function (t) {
  client.destroy(function () {
    t.end()
  })
})
