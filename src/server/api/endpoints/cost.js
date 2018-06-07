
import ServiceManager from '../services/SvcManager'
import docxConverter from 'docx-pdf'
import express from 'express'
import path from 'path'
import fs from 'fs'

const saveToDisk = (data, output) => {
  return new Promise((resolve, reject) => {
    const writeStream = fs.createWriteStream(output)
    writeStream.on('finish', () => {  
      resolve()  
    })
    writeStream.write(data)
    writeStream.end()
  })
}

const converToPDF = (input, output) => {
  return new Promise((resolve, reject) => {
    docxConverter(input, output, (err,result) => {
      return err
        ? reject(err)
        : resolve(result)
    })
  })
}


module.exports = function() {

  var router = express.Router()

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  router.get('/token', async (req, res) => {

    try {

      const bimCostSvc = ServiceManager.getService('BIMCostSvc')

      const tokenRes = await bimCostSvc.getAccessToken ()

      const oauthRes = await bimCostSvc.getOAuthToken (
        tokenRes.access_token)

      res.json(oauthRes)

    } catch (ex) {

      res.status(ex.status || 500)
      res.json(ex)
    }
  })

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  router.get('/:containerId/scos', async (req, res) => {

    try {

      const {containerId} = req.params

      const bimCostSvc = ServiceManager.getService('BIMCostSvc')

      const tokenRes = await bimCostSvc.getAccessToken ()

      const oauthRes = await bimCostSvc.getOAuthToken (
        tokenRes.access_token)

      const scosRes = await bimCostSvc.getSCOs (
        oauthRes.token,
        containerId)

      res.json(scosRes)

    } catch (ex) {

      res.status(ex.status || 500)
      res.json(ex)
    }
  })

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  router.get('/:containerId/scos/:scoId/doc', async (req, res) => {

    try {

      const {containerId, scoId} = req.params

      const bimCostSvc = ServiceManager.getService('BIMCostSvc')

      const tokenRes = await bimCostSvc.getAccessToken ()

      const oauthRes = await bimCostSvc.getOAuthToken (
        tokenRes.access_token)

      const scoRes = await bimCostSvc.getDocumentInfo (
        oauthRes.token, 
        containerId, 
        scoId)  

      res.json(scoRes)

    } catch (ex) {

      console.log(ex)

      res.status(ex.status || 500)
      res.json(ex)
    }
  })

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  router.get('/doc/:urn', async (req, res) => {

    try {

      const {urn} = req.params

      const bimCostSvc = ServiceManager.getService('BIMCostSvc')

      const tokenRes = await bimCostSvc.getAccessToken ()

      const oauthRes = await bimCostSvc.getOAuthToken (
        tokenRes.access_token)

      const url = await bimCostSvc.getSignedURL (
        oauthRes.token, 
        urn)  

      const filename = path.join(
        __dirname, '/TMP', 'test.docx')

      bimCostSvc.getDocument (
        oauthRes.token, url)      

      res.end(url)

    } catch (ex) {

      res.status(ex.status || 500)
      res.json(ex)
    }
  })

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  router.post('/sign', async (req, res) => {

    try {

      const {email, urn} = req.body

      const bimCostSvc = ServiceManager.getService('BIMCostSvc')

      const tokenRes = await bimCostSvc.getAccessToken ()

      const oauthRes = await bimCostSvc.getOAuthToken (
        tokenRes.access_token)

      const url = await bimCostSvc.getSignedURL (
        oauthRes.token, 
        urn)  

      const filename = path.join(
        __dirname, 
        '../../../../TMP',
        'doc.docx')

      const data = await bimCostSvc.getDocument (
        oauthRes.token, url) 
        
      await saveToDisk(data, filename) 

      const pdf = path.join(
        __dirname, 
        '../../../../TMP',
        'doc.pdf')

      await converToPDF(filename, pdf)  

      const docuSignSvc = ServiceManager.getService('DocuSignSvc')

      const pdfBytes = fs.readFileSync(pdf)
    
      const pdfBase64 = Buffer.from(pdfBytes).toString('base64')
    
      const name = 'Customer'

      const env = await docuSignSvc.requestSignatureOnDocument(
        name, email, 'doc.pdf', pdfBase64)

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
  router.get('/doc/:envelopeId/:documentId', async (req, res) => {

    try {

      const {envelopeId, documentId} = req.params

      const bimCostSvc = ServiceManager.getService('BIMCostSvc')

      const tokenRes = await bimCostSvc.getAccessToken ()

      const oauthRes = await bimCostSvc.getOAuthToken (
        tokenRes.access_token)

      const docuSignSvc = ServiceManager.getService('DocuSignSvc')

      const data = await docuSignSvc.getDocument(
         envelopeId, documentId)  

      const pdf = path.join(
        __dirname, 
        '../../../../TMP',
        'doc.pdf')  

      await saveToDisk (new Buffer(data, 'binary'), pdf)  

      res.download(pdf)

    } catch (ex) {

      console.log(ex)

      res.status(ex.status || 500)
      res.json(ex)
    }
  })

  return router
}


