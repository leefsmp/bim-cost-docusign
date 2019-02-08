
import docusign from 'docusign-esign'
import BaseSvc from './BaseSvc'
import request from 'request'

export default class DocuSignSvc extends BaseSvc {

  /////////////////////////////////////////////////////////////////
  //
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

    return 'DocuSignSvc'
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  doLogin (dsToken) {

    return new Promise((resolve, reject) => {
  
      const apiClient = new docusign.ApiClient()
      const token = JSON.parse(dsToken)
      apiClient.setBasePath(this._config.basePath)

         apiClient.addDefaultHeader('Authorization', 'Bearer ' + token.access_token);
        //  apiClient.addDefaultHeader(
        //      'X-DocuSign-Authentication', 
        //      JSON.stringify(this._config.credentials))
           
           docusign.Configuration.default.setDefaultApiClient(apiClient)
           
           const authApi = new docusign.AuthenticationApi()
           
           const loginOps = new authApi.LoginOptions()
           
           loginOps.setApiPassword('true')
           loginOps.setIncludeAccountIdGuid('true')
           
           authApi.login(loginOps, (err, loginInfo, response) => {
             
             return err 
             ? reject(err) 
             : resolve (loginInfo)
            })
    })
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  getAccessToken (authCode) {

    const options = { method: 'POST',
    url: 'https://account-d.docusign.com/oauth/token',
    headers:
     { authorization:
        'Basic ZGQxNzdiNTctZTc2OS00ZWYyLTkwOTItMDBmZTI3YzI2NmNmOmU2N2EwZmIzLTdiNzktNGE2MS04ZDQ3LWM1OGUyZDM5ZDQxZA==',
       'content-type': 'application/x-www-form-URLencoded' },
    form:
     { grant_type: 'authorization_code',
       code: authCode
      }
    }
    return requestAsync(options)
  }
  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  getEnvelope (envelopeId) {

    return new Promise(async(resolve, reject) => {
  
      try {

        // await this.doLogin()

        const envelopesApi = new docusign.EnvelopesApi()

        envelopesApi.getEnvelope(
          this._config.accountId, envelopeId, null, 
          (err, env, response) => {
  
            return err 
              ? reject (err) 
              : resolve (env)
        })

      } catch (ex) {

        reject (ex)
      }
    })
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  listEnvelopeDocuments (envelopeId) {

    return new Promise(async(resolve, reject) => {
  
      try {

        // await this.doLogin()

        const envelopesApi = new docusign.EnvelopesApi()

        envelopesApi.listDocuments(
          this._config.accountId, envelopeId, 
          (err, docsList, response) => {

            return err 
              ? reject (err) 
              : resolve (docsList)
        })

      } catch (ex) {

        console.log(ex)
        reject (ex)
      }
    })
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  getDocument (envelopeId, documentId) {

    return new Promise(async(resolve, reject) => {
  
      try {

        // await this.doLogin()

        const envelopesApi = new docusign.EnvelopesApi()

        envelopesApi.getDocument(
          this._config.accountId, 
          envelopeId, documentId, 
          (err, document, response) => {
          
            return err 
              ? reject (err) 
              : resolve (document)
        })

      } catch (ex) {

        console.log(ex)
        reject (ex)
      }
    })
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  requestSignatureOnDocument (signerName, signerEmail, docName, docBase64, dsToken) {

    return new Promise(async(resolve, reject) => {

      try {

        await this.doLogin(dsToken)

        const doc = new docusign.Document()
      
        doc.setDocumentBase64(docBase64)
        doc.setDocumentId('1')
        doc.setName(docName)
        
        // create an envelope that will store the document(s), field(s), and recipient(s)
        const envDef = new docusign.EnvelopeDefinition()
      
        envDef.setEmailSubject('Please sign this document')
        envDef.setDocuments([doc])
      
        // add a recipient to sign the document
        const signer = new docusign.Signer()
        signer.setEmail(signerEmail)
        signer.setName(signerName)
        signer.setRecipientId('1')
      
        // create a signHere tab somewhere on the document
        // default unit of measurement is pixels
        // can be mms, cms, inches also
        const signHere = new docusign.SignHere()

        signHere.setDocumentId('1')
        signHere.setPageNumber('1')
        signHere.setRecipientId('1')
        signHere.setXPosition('450')
        signHere.setYPosition('700')
      
        // can have multiple tabs
        const tabs = new docusign.Tabs()
      
        tabs.setSignHereTabs([signHere])
      
        signer.setTabs(tabs)
      
        // add recipients (in this case a single signer) to the envelope
        envDef.setRecipients(new docusign.Recipients())
        envDef.getRecipients().setSigners([])
        envDef.getRecipients().getSigners().push(signer)
      
        // send the envelope by setting |status| to "sent"
        // To save as a draft set to "created"
        envDef.setStatus('sent')
      
        // instantiate a new EnvelopesApi object
        const envelopesApi = new docusign.EnvelopesApi()
    
        // call the createEnvelope() API
        envelopesApi.createEnvelope(
          this._config.accountId, envDef, null, 
          (err, envelopeSummary, response) => {
            
            return err 
              ? reject(err) 
              : resolve (envelopeSummary)
        })

      } catch (ex) {

        reject(ex) 
      }
    })
  }
}
/////////////////////////////////////////////////////////////////
// Utils
//
/////////////////////////////////////////////////////////////////
function requestAsync(params) {

  return new Promise((resolve, reject) => {

    request(params, (err, response, body)  =>{

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

