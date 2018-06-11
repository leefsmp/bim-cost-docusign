
import ServiceManager from './SvcManager'
import BaseSvc from './BaseSvc'
import request from 'request'

export default class BIMCostSvc extends BaseSvc {

  /////////////////////////////////////////////////////////////////
  // DataManagement Service
  //
  /////////////////////////////////////////////////////////////////
  constructor(config) {

    super(config)
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  name() {

    return 'BIMCostSvc'
  }

  /////////////////////////////////////////////////////////////////
  // 
  //
  /////////////////////////////////////////////////////////////////
  getAccessToken () {

    const url = this._config.APP_BASE_URL + `/oauth/token`
   
    const headers = {
      'Content-Type': 'application/json'
    }

    const body = {
      username: this._config.username,
      password: this._config.password,
      grant_type: 'password'
    }

    return requestAsync({
      method: 'POST',
      json: true,
      headers,
      body,
      url
    })
  }

  /////////////////////////////////////////////////////////////////
  // 
  //
  /////////////////////////////////////////////////////////////////
  getOAuthToken (accessToken) {

    const url = this._config.APP_BASE_URL + `/session/token`

    const headers = {
      Authorization: 'Bearer ' + accessToken,
      'Content-Type': 'application/json'
    }

    return requestAsync({
      json: true,
      headers,
      url
    })
  }

  /////////////////////////////////////////////////////////////////
  // 
  //
  /////////////////////////////////////////////////////////////////
  getSCOs (oauthToken, containerId) {

    const url =
      `${this._config.API_BASE_URL}/containers/` + 
      `${containerId}/changeorders/sco`
      
    const headers = {
      Authorization: 'Bearer ' + oauthToken,
      'Content-Type': 'application/vnd.api+json',
    }

    return requestAsync({
      json: true,
      headers,
      url
    })
  }

  /////////////////////////////////////////////////////////////////
  // 
  //
  /////////////////////////////////////////////////////////////////
  getDocumentInfo (oauthToken, containerId, SCOId) {

    const url =
      `${this._config.API_BASE_URL}/containers/` + 
      `${containerId}/documents?latest=true&` + 
      `associationId=${SCOId}&associationType=FormInstance`
      
    const headers = {
      Authorization: 'Bearer ' + oauthToken,
      'Content-Type': 'application/json',
    }

    return requestAsync({
      json: true,
      headers,
      url
    })
  }

  /////////////////////////////////////////////////////////////////
  // 
  //
  /////////////////////////////////////////////////////////////////
  getSignedURL (oauthToken, urn) {

    const url =
    `${this._config.API_PORTAL_BASE_URL}` + 
    `/wipdata-serv-qa/storage/v3/downloadurl` + 
    `/${encodeURIComponent(urn)}?filename=test.docx`

    const headers = {
      Authorization: 'Bearer ' + oauthToken,
      'Content-Type': 'application/json',
    }

    return requestAsync({
      method: 'POST',
      json: true,
      headers,
      url
    })
  }

  /////////////////////////////////////////////////////////////////
  // 
  //
  /////////////////////////////////////////////////////////////////
  getDocument (oauthToken, url) {

    return new Promise((resolve, reject) => {

      request({
        url: url,
        headers: {
          Authorization: 'Bearer ' + oauthToken
        },
        encoding: null
      }, (err, response, data) => {

        return err
          ? reject (err)
          : resolve (data)
      })
    })
  }

  /////////////////////////////////////////////////////////////////
  // 
  //
  /////////////////////////////////////////////////////////////////
  getOSSUrn (oauthToken, filename) {

    const url =
    `${this._config.API_PORTAL_BASE_URL}` + 
    `/wipdata-serv-qa/storage/v3/filestore/urn`
    
    const headers = {
      Authorization: 'Bearer ' + oauthToken,
      'Content-Type': 'application/json',
    }

    return requestAsync({
      method: 'POST',
      json: true,
      headers,
      url
    })
  }
}

/////////////////////////////////////////////////////////////////
// Utils
//
/////////////////////////////////////////////////////////////////
function requestAsync(params) {

  return new Promise( function(resolve, reject) {

    request({

      url: params.url,
      method: params.method || 'GET',
      headers: params.headers || {
        'Authorization': 'Bearer ' + params.token
      },
      json: params.json,
      body: params.body

    }, function (err, response, body) {

      try {

        if (err) {

          console.log('error: ' + params.url)
          console.log(err)

          return reject(err)
        }

        if (body && body.errors) {

          console.log('body error: ' + params.url)
          console.log(body.errors)

          var error = Array.isArray(body.errors) ?
            body.errors[0] :
            body.errors

          return reject(error)
        }

        if (response && [200, 201, 202].indexOf(
            response.statusCode) < 0) {

          console.log('status error: ' +
            response.statusCode)

          console.log(response.statusMessage)

          return reject(response.statusMessage)
        }

        return resolve(body)

      } catch(ex){

        console.log(params.url)
        console.log(ex)

        return reject(ex)
      }
    })
  })
}



