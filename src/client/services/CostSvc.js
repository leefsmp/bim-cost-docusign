
import ClientAPI from 'ClientAPI'
import BaseSvc from './BaseSvc'

export default class CostSvc extends BaseSvc {

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  constructor (config) {

    super (config)

    this.api = new ClientAPI(config.apiUrl)
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  name() {

    return 'CostSvc'
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  getSCOs (containerId = '4fe80261-61b5-11e8-9b9c-8b974249ad4c') {

    return this.api.ajax(`/${containerId}/scos`)
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  getDocInfo (scoId, containerId = '4fe80261-61b5-11e8-9b9c-8b974249ad4c') {

    return this.api.ajax(`/${containerId}/scos/${scoId}/doc`)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  requestSignature (email, urn) {

    const url = `/sign`

    const data = {
      email,
      urn
    }

    return this.api.ajax({
      url: url,
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      data: JSON.stringify(data)
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  updateSignedDocument (
    envelopeId, documentId,
    scoId, containerId = '4fe80261-61b5-11e8-9b9c-8b974249ad4c') {

    const url = `/doc`

    const data = {
      containerId,
      envelopeId, 
      documentId,
      scoId
    }

    return this.api.ajax({
      url: url,
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      data: JSON.stringify(data)
    })
  }
}
