const AuthenticationRequest = require('spotify-web-api-node/src/authentication-request')
const HttpManager = require('spotify-web-api-node/src/http-manager')

// This module contains a bunch of spotify authentication methods based on
// the authentication methods in spotify-web-api-node. The methods in this
// module provide "Authorization Code Flow with Proof Key for Code Exchange (PKCE)"
// support (https://developer.spotify.com/documentation/general/guides/authorization-guide/#authorization-code-flow-with-proof-key-for-code-exchange-pkce)
// which is the authentication method used by this app, but not supported
// by spotify-web-api-node. There is an open PR that adds PKCE auth flow support
// to spotify-web-api-node here: https://github.com/thelinmichael/spotify-web-api-node/pull/384
// but it has not had any activity since first being opened.

// https://github.com/thelinmichael/spotify-web-api-node/blob/master/src/server-methods.js#L16
function createAuthorizationURL ({
  redirectUri,
  clientId,
  scopes,
  state,
  codeChallenge
}) {
  return AuthenticationRequest.builder()
    .withPath('/authorize')
    .withQueryParameters({
      client_id: clientId,
      response_type: 'code',
      redirect_uri: redirectUri,
      scope: scopes.join('%20'),
      state: state,
      show_dialog: false,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256'
    })
    .build()
    .getURL()
}

// https://github.com/thelinmichael/spotify-web-api-node/blob/master/src/server-methods.js#L65
function getAccessToken ({
  redirectUri,
  clientId,
  code,
  codeVerifier
}, callback) {
  return AuthenticationRequest.builder()
    .withPath('/api/token')
    .withBodyParameters({
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
      code,
      client_id: clientId,
      code_verifier: codeVerifier
    })
    .withHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    })
    .build()
    .execute(HttpManager.post, callback)
}

// https://github.com/thelinmichael/spotify-web-api-node/blob/master/src/server-methods.js#L88
function getRefreshedAccessToken ({
  refreshToken,
  clientId
}, callback) {
  return AuthenticationRequest.builder()
    .withPath('/api/token')
    .withBodyParameters({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId
    })
    .withHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    })
    .build()
    .execute(HttpManager.post, callback)
}

module.exports = {
  createAuthorizationURL,
  getAccessToken,
  getRefreshedAccessToken
}
