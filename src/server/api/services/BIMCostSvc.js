
import BaseSvc from './BaseSvc'
import request from 'request'

const createDMPayload = (folderId, urn, fileName) => {

  return {
    data: {
        type: "commands",
        attributes: {
            extension: {
                type: "commands:autodesk.core:Upload",
                version: "1.0.0"
            }
        },
        relationships: {
            resources: {
                data: [{
                    type: "versions",
                    id: "1"
                }]
            }
        }
    },
    included: [{
        type: "items",
        id: "1",
        attributes: {
            extension: {
                type: "items:autodesk.bim360:File",
                version: "1.0"
            }
        },
        relationships: {
            tip: {
                data: {
                    "type": "versions",
                    "id": "1"
                }
            },
            parent: {
                data: {
                    type: "folders",
                    id: folderId
                }
            }
        }
    }, {
        type: "versions",
        id: "1",
        attributes: {
            name: fileName,
            extension: {
                type: "versions:autodesk.bim360:File",
                version: "1.0"
            }
        },
        relationships: {
            storage: {
                data: {
                    type: "objects",
                    id: urn
                }
            }
        }
    }]
  }
}

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
  //https://wiki.autodesk.com/display/PLMDM/OSS+Workflows
  /////////////////////////////////////////////////////////////////
  getOSSUrn (oauthToken, fileName) {

    //https://developer-stg.api.autodesk.com/wipdata-serv-qa/storage/v3/filestore/urn
    const url =
      `${this._config.API_PORTAL_BASE_URL}` + 
      `/wipdata-serv-qa/storage/v3/filestore/urn`
    
    const headers = {
      Authorization: 'Bearer ' + oauthToken,
      'Content-Type': 'application/json',
    }

    const body = JSON.stringify({
      'storageType': 'OSS',
      'fileName': fileName
    })

    return requestAsync({
      method: 'POST',
      headers,
      body,
      url
    })
  }

  /////////////////////////////////////////////////////////////////
  // 
  //https://wiki.autodesk.com/pages/viewpage.action?pageId=372902120#Attachmentupload/download-Backend(Servicetoservice):
  /////////////////////////////////////////////////////////////////
  getAttachmentFolder (oauthToken, containerId) {

    //https://developer-stg.api.autodesk.com/cost-api-dev/v1/containers/244f5c91-2365-11e8-acb6-31592ee4127d/attachmentFolders
    const url =
    `${this._config.API_PORTAL_BASE_URL}` + 
    `/cost-api-dev/v1/containers/${containerId}/attachmentFolders`
    
    const headers = {
      Authorization: 'Bearer ' + oauthToken,
      'Content-Type': 'application/json',
    }

    const body = {
      scope: 'FormInstance-35e35c10-37ae-11e8-9997-49e2bf0eaae6'
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
  async uploadToOSS (oauthToken, bucketName, objectName, data) {

    //PUT https://developer-stg.api.autodesk.com/oss/v2/buckets/wip.dm.qa/objects/xxxx.docx
     const url =
      `${this._config.API_PORTAL_BASE_URL}` + 
      `/oss/v2/buckets/${bucketName}/objects/${objectName}`
    
    const headers = {
      Authorization: 'Bearer ' + oauthToken
    }

    return requestAsync({
      method: 'PUT',
      body: data,
      headers,
      url
    })
  }

  /////////////////////////////////////////////////////////////////
  // 
  //
  /////////////////////////////////////////////////////////////////
  moveToDocsFolder (oauthToken, projectId, folderId, urn, fileName) {

    //POST https://developer-stg.api.autodesk.com/dm-staging/v1/cmd-dev/projects/{projectId}/commands
    const url =
      `${this._config.API_PORTAL_BASE_URL}` + 
      `/dm-staging/v1/cmd-dev/projects/${projectId}/commands`
    
    const headers = {
      Authorization: 'Bearer ' + oauthToken,
      'Content-Type': 'application/json'
    }

    const body = 
      createDMPayload(
        folderId, urn, fileName)

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
  attachToFolder (oauthToken, containerId, folderId, versionId, fileName) {

    //POST https://developer-stg.api.autodesk.com/cost-api-dev/v1/containers/{containerId}/attachments
     const url =
      `${this._config.API_PORTAL_BASE_URL}` + 
      `/cost-api-dev/v1/containers/${containerId}/attachments`
    
    const headers = {
      Authorization: 'Bearer ' + oauthToken,
      'Content-Type': 'application/json'
    }

    const payload = {
      associationId: "35e35c10-37ae-11e8-9997-49e2bf0eaae6",
      associationType: "Contract",
      urn: versionId,
      name: fileName,
      folderId
    }

    return requestAsync({
      method: 'POST',
      body: payload,
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

  return new Promise((resolve, reject) => {

    const _params = {
      headers: {
        'Authorization': 'Bearer ' + params.token
      },
      method: 'GET',
      ...params
    }

    request(_params, (err, response, body)  =>{

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

          return reject(response.statusMessage)
        }

        return resolve(body)

      } catch(ex){

        return reject(ex)
      }
    })
  })
}

