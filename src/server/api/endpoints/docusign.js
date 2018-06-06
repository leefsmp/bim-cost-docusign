import ServiceManager from '../services/SvcManager'
import docusign from 'docusign-esign'
import express from 'express'
import path from 'path'
import fs from 'fs'

//EnvelopeSummary: {"envelopeId":"745ae112-a2b3-4f1f-a747-7dbc1f1d6935","uri":"/envelopes/745ae112-a2b3-4f1f-a747-7dbc1f1d6935","statusDateTime":"2018-05-31T08:28:51.8100000Z","status":"sent"}

module.exports = function() {

  var router = express.Router()

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  router.get('/accounts', async (req, res) => {

    try {

      const docuSignSvc = ServiceManager.getService('DocuSignSvc')

      const loginInfo = await docuSignSvc.doLogin()

      const loginAccounts = loginInfo.getLoginAccounts()

      res.json(loginAccounts)

    } catch (ex) {

      res.status(ex.status || 500)
      res.json(ex)
    }
  })

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  router.get('/envelopes/:envelopeId', async (req, res) => {

    try {

      const {envelopeId} = req.params

      const docuSignSvc = ServiceManager.getService('DocuSignSvc')

      const env = await docuSignSvc.getEnvelope(envelopeId)

      res.json(env)
     
    } catch (ex) {

      res.status(ex.status || 500)
      res.json(ex)
    }
  })

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  router.get('/envelopes/:envelopeId/documents', async (req, res) => {

    try {

      const {envelopeId} = req.params

      const docuSignSvc = ServiceManager.getService('DocuSignSvc')

      const docs = await docuSignSvc.listEnvelopeDocuments(envelopeId)

      res.json(docs)

    } catch (ex) {

      res.status(ex.status || 500)
      res.json(ex)
    }
  })

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  router.get('/envelopes/:envelopeId/documents/:documentId', async (req, res) => {

    try {

      const {envelopeId, documentId} = req.params

      const docuSignSvc = ServiceManager.getService('DocuSignSvc')

      const doc = await docuSignSvc.getDocument(
        envelopeId, documentId)

      const filename = `${envelopeId}_${documentId}.pdf`

      const tempFile = path.resolve(__dirname, filename)

      fs.writeFile(tempFile, new Buffer(doc, 'binary'), (err) => {

        res.json('done')
      })

    } catch (ex) {

      res.status(ex.status || 500)
      res.json(ex)
    }
  })

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  router.get('/send', async (req, res) => {

    try {

      const docuSignSvc = ServiceManager.getService('DocuSignSvc')

      const signerEmail = 'philippe.leefsma@gmail.com'
      const signerName = 'Felipe'
 
      const fileBytes = fs.readFileSync(path.resolve(__dirname, 'doc.pdf'))
    
      const docBase64 = Buffer.from(fileBytes).toString('base64')
    
      const env = await docuSignSvc.requestSignatureOnDocument(
        signerName, signerEmail, 'doc.pdf', docBase64)

      res.json(env)

    } catch (ex) {

      res.status(ex.status || 500)
      res.json(ex)
    }
  })

  return router
}