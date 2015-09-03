module.exports = StringUtils

/**
 * @namespace
 * @static
 */
function StringUtils () {
  // static class
}

/**
 * @return {string} milliseconds for current time from epoch as a string
 */
StringUtils.timestamp = function () {
  return StringUtils.timestampFrom(new Date())
}

/**
 * @param {Date} date
 * @return {string} milliseconds date is from epoch as a string
 */
StringUtils.timestampFrom = function (date) {
  return '' + date.getTime()
}

/**
 * Attempts to parse the given string as JSON, returning null upon parse error.
 *
 * @param {string} input
 * @return {Object}
 */
StringUtils.tryParseJSON = function (input) {
  try {
    return JSON.parse(input)
  } catch (e) {
    return null
  }
}
