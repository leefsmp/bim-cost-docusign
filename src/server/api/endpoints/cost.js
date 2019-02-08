
import ServiceManager from '../services/SvcManager'
import docxConverter from 'docx-pdf'
import {Router} from 'express'
import mzfs from 'mz/fs'
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

const parseUrn = (urn) => {
  const tmp = urn.replace('urn:adsk.objects:os.object:', '')
  const res = tmp.split('/')
  return {
    bucketName: res[0],
    objectName: res[1]
  }
}

const guid = (format='xxxxxxxxxxxx') => {

  var d = new Date().getTime()

  var guid = format.replace(
    /[xy]/g,
    function (c) {
      var r = (d + Math.random() * 16) % 16 | 0
      d = Math.floor(d / 16)
      return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16)
    })

  return guid
}

module.exports = function() {

  var router = Router()

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
      
      const {email, urn, authCode} = req.body
      
      const bimCostSvc = ServiceManager.getService('BIMCostSvc')

      const tokenRes = await bimCostSvc.getAccessToken ()
      const docuSignSvc = ServiceManager.getService('DocuSignSvc')
      const dsToken = await docuSignSvc.getAccessToken(authCode)

      const oauthRes = await bimCostSvc.getOAuthToken (
        tokenRes.access_token)

      const url = await bimCostSvc.getSignedURL (
        oauthRes.token, 
        urn)  

      const filename = path.join(
        __dirname, 
        '../../../../TMP',
        `${guid()}.docx`)

      const data = await bimCostSvc.getDocument (
        oauthRes.token, url) 
        
      await saveToDisk(data, filename) 

      const pdf = path.join(
        __dirname, 
        '../../../../TMP',
        `${guid()}.pdf`)

      await converToPDF(filename, pdf)  


      const pdfBytes = fs.readFileSync(pdf)
    
      const pdfBase64 = Buffer.from(pdfBytes).toString('base64')
    
      const name = 'Customer'
    
      const env = await docuSignSvc.requestSignatureOnDocument(
        name, email, 'doc.pdf', pdfBase64, dsToken)

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

      const docuSignSvc = ServiceManager.getService('DocuSignSvc')

      const data = await docuSignSvc.getDocument(
         envelopeId, documentId)  

      const pdf = path.join(
        __dirname, 
        '../../../../TMP',
        `${guid()}.pdf`)  

      await saveToDisk (new Buffer(data, 'binary'), pdf)  

      res.download(pdf)

    } catch (ex) {

      res.status(ex.status || 500)
      res.json(ex)
    }
  })

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  router.post('/doc', async (req, res) => {

    try {

      res.json('pending ...')

      const {
        containerId, 
        documentId,
        envelopeId
      } = req.body

      const bimCostSvc = ServiceManager.getService('BIMCostSvc')

      const tokenRes = await bimCostSvc.getAccessToken ()

      const oauthRes = await bimCostSvc.getOAuthToken (
        tokenRes.access_token)

      const docuSignSvc = ServiceManager.getService('DocuSignSvc')

      const data = await docuSignSvc.getDocument(
         envelopeId, documentId)  

      // No need to save to disk 

      // const pdf = path.join(__dirname, '../../../../TMP', `${guid()}.pdf`)  

      // await saveToDisk (new Buffer(data, 'binary'), pdf) 

      const fileName = 'signedDocument.pdf'

      const urn = await bimCostSvc.getOSSUrn (
        oauthRes.token, fileName)

      const parsedUrn = parseUrn(urn) 

      const binaryData = new Buffer(data, 'binary')

      const oss = await bimCostSvc.uploadToOSS (
        oauthRes.token, 
        parsedUrn.bucketName, 
        parsedUrn.objectName, 
        binaryData)  

      const folder = await bimCostSvc.getAttachmentFolder (
        oauthRes.token, containerId)

      const projectId = '2ea5c688-74d1-43e7-a79f-c9ea60a9ad52'

      const move = await bimCostSvc.moveToDocsFolder (
        oauthRes.token, 
        projectId, 
        folder.data.urn, 
        urn, fileName) 

      const versionId = move.data.relationships.created.data[1].id

      const folderId = folder.data.id
       
      const attach = await bimCostSvc.attachToFolder (
        oauthRes.token, 
        containerId, 
        folderId, 
        versionId, 
        fileName)

      console.log(attach)  

    } catch (ex) {

      console.log('EX:')
      console.log(ex)

      res.status(ex.status || 500)
      res.json(ex)
    }
  })

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  // router.get('/test', async (req, res) => {

  //   try {

  //     const containerId = '4fe80261-61b5-11e8-9b9c-8b974249ad4c'

  //     const bimCostSvc = ServiceManager.getService('BIMCostSvc')

  //     const tokenRes = await bimCostSvc.getAccessToken ()

  //     const oauthRes = await bimCostSvc.getOAuthToken (
  //       tokenRes.access_token)

  //     const folder = await bimCostSvc.getAttachmentFolder (
  //       oauthRes.token, containerId)
        
  //     //console.log(folder)

  //     const urn = await bimCostSvc.getOSSUrn (
  //        oauthRes.token, 'test.pdf')

  //     const parsedUrn = parseUrn(urn)   

  //     const data = await mzfs.readFile(path.join(
  //       __dirname, '../../../../TMP', `6f677f16a751.pdf`))  

  //     const fileName = 'test.pdf' 

  //     const oss = await bimCostSvc.uploadToOSS (
  //       oauthRes.token, 
  //       parsedUrn.bucketName, 
  //       parsedUrn.objectName, 
  //       data)  

  //     const move = await bimCostSvc.moveToDocsFolder (
  //       oauthRes.token, 
  //       '2ea5c688-74d1-43e7-a79f-c9ea60a9ad52', 
  //       folder.data.urn, 
  //       urn, fileName) 

  //     const versionId = move.data.relationships.created.data[1].id
  //     const folderId = folder.data.id
     
  //     console.log('folderId: ' + folderId)
  //     console.log('versionId: ' + versionId)

  //     const attach = await bimCostSvc.attachToFolder (
  //       oauthRes.token, 
  //       containerId, 
  //       folderId, 
  //       versionId, 
  //       fileName)

  //     console.log(attach)

  //     res.json('ok')
      
  //   } catch (ex) {

  //     console.log('EX: ', ex)

  //     res.status(ex.status || 500)
  //     res.json(ex)
  //   }
  // })

  return router
}


