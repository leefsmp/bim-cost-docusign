import ServiceManager from '../services/SvcManager'
import docusign from 'docusign-esign'
import express from 'express'
import path from 'path'
import fs from 'fs'

module.exports = function() {

  var router = express.Router()

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  // router.get('/account', async (req, res) => {

  //   try {

  //     const docuSignSvc = ServiceManager.getService('DocuSignSvc')

  //     const info = await docuSignSvc.doLogin()

  //     res.json(info)
     
  //   } catch (ex) {

  //     res.status(ex.status || 500)
  //     res.json(ex)
  //   }
  // })

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

      const data = await docuSignSvc.getDocument(
        envelopeId, documentId)

      const buffer = new Buffer(data, 'binary') 

      res.end(buffer)  

    } catch (ex) {

      res.status(ex.status || 500)
      res.json(ex)
    }
  })

  return router
}