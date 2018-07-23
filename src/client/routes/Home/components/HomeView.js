import { IndexLink, Link } from 'react-router'
import ServiceManager from 'SvcManager'
import EmailInput from 'EmailInput'
import ClientAPI from 'ClientAPI' 
import React from 'react'
import './HomeView.scss'

class SCO extends React.Component {

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  constructor (props) {

    super (props)

    this.onRequestSignature = this.onRequestSignature.bind(this)

    this.onEmailChanged = this.onEmailChanged.bind(this)

    this.state = {
      docURN: null,
      email: null
    }
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  async componentDidMount () {

    const scoId = this.props.sco.id

    const res = await this.props.costSvc.getDocInfo(scoId)

    this.setState({
      ...this.state,
      docURN: res.data[0].urn,
    })
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  async onDocumentSigned (envelopeId) {

    const scoId = this.props.sco.id

    const res = 
      await this.props.docusignSvc.getDocuments(
        envelopeId)

    const documentId = res.envelopeDocuments[0].documentId

    this.props.costSvc.updateSignedDocument(
      envelopeId, documentId, scoId)
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  async downloadDocument (envelopeId) {

    const res = 
      await this.props.docusignSvc.getDocuments(
        envelopeId)

    const documentId = res.envelopeDocuments[0].documentId

    const url = this.props.docusignSvc.getSignedDocumentURL(
      envelopeId, documentId)

    const link = document.createElement('a')

    link.download = 'doc.pdf'
    link.href = url
    link.click()  
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  async onRequestSignature () {

    const sco = this.props.sco

    const notification = this.props.notifySvc.add({
      title: 'Connecting to Docusign ...',
      message: 'Please wait',
      dismissible: false,
      status: 'loading',
      dismissAfter: 0,
      position: 'tl',
      id: sco.id
    })

    this.props.notifySvc.update(notification)

    const signRes = await this.props.costSvc.requestSignature(
      this.state.email,
      this.state.docURN)

    const intervalId = setInterval(() => {
      this.props.docusignSvc.getEnvelope(
        signRes.envelopeId).then((envRes) => {
          if (envRes.status === "completed") {
            this.onDocumentSigned(signRes.envelopeId)
            clearInterval(intervalId)
            notification.title = 'Signature completed !'
            notification.message = ''
            notification.buttons = [{
              name: 'Download',
              onClick: () => {
                notification.dismissAfter = 1
                this.props.notifySvc.update(notification)
                this.downloadDocument(signRes.envelopeId)
              }
            }, {
              name: 'Close',
              onClick: () => {
                notification.dismissAfter = 1
                this.props.notifySvc.update(notification)
              }
            }]
            this.props.notifySvc.update(notification)
          }
      })
    }, 10000)

    notification.title = 'Signature requested ...'
    notification.message = 'Waiting for customer'
    notification.buttons = [{
      name: 'Cancel',
      onClick: () => {
        notification.dismissAfter = 1
        this.props.notifySvc.update(notification)
        clearInterval(intervalId)
      }
    }]

    this.props.notifySvc.update(notification)
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  onEmailChanged (email) {

    this.setState({
      ...this.state,
      email
    })
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  render () {

    const email = this.state.email

    const urn = this.state.docURN
  
    const sco = this.props.sco

    return (
      <div className="sco">
        <label>
          { sco.name }
        </label>
        <EmailInput onChange={this.onEmailChanged}/>
        <button onClick={this.onRequestSignature} disabled={!urn || !email}>
            Request Signature
        </button>  
      </div>  
    )
  }
}

class HomeView extends React.Component {

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  constructor(props) {

    super(props)

    this.notifySvc = ServiceManager.getService('NotifySvc')   

    this.docusignSvc = ServiceManager.getService('DocusignSvc')

    this.costSvc = ServiceManager.getService('CostSvc')
    
    this.costSvc.getSCOs().then((res) => {
      this.setState({
        scos: res.data
      })
    })

    this.state = {
      scos: null
    }
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  renderSCOs(scos) {
  
    if (!scos) {
      return (
        <div> Loading ... </div>
      )
    }

    return scos.map((sco) => {
      return (
        <SCO 
          docusignSvc={this.docusignSvc}
          notifySvc={this.notifySvc} 
          costSvc={this.costSvc}
          key={sco.id}
          sco={sco} 
        />
      )
    })  
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  render() {

    return (
      <div className="home">
        <img className="logo-hero"/>
        <div className="scos">
        { this.renderSCOs(this.state.scos)} 
        </div>
      </div>
    )
  }
}

export default HomeView
























































