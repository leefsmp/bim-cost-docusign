import { IndexLink, Link } from 'react-router'
import ServiceManager from 'SvcManager'
import EmailInput from 'EmailInput'
import ClientAPI from 'ClientAPI' 
import React from 'react'
import './HomeView.scss'
import queryString from 'query-string';

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
    // const email = sessionStorage.getItem('email');
    this.setState({
      ...this.state,
      docURN: res[0].urn,
      // email: email,
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
    const parsed = queryString.parse(location.search);
    const authCode = parsed.code    
    if(authCode){
      console.log('fire the gun')
      this.onDocusignOAuth(authCode)
    } else {      
      sessionStorage.setItem("email", this.state.email);
      sessionStorage.setItem("urn", this.state.docURN);
      window.location = "https://account-d.docusign.com/oauth/auth?response_type=code&scope=signature%20impersonation&client_id=dd177b57-e769-4ef2-9092-00fe27c266cf&redirect_uri=http://localhost:3000";
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
    }
  }
  async onDocusignOAuth(authCode) {
    const email = sessionStorage.getItem('email');
    const urn = sessionStorage.getItem('urn');
    const sco = this.props.sco
    const notification = this.props.notifySvc.add({
      title: 'Requesting signature ...',
      message: 'Please wait',
      dismissible: false,
      status: 'loading',
      dismissAfter: 0,
      position: 'tl',
      id: sco.id
    })
    const signRes = await this.props.costSvc.requestSignature(
      email,
      urn,
      authCode)

    const intervalId = setInterval(() => {
      this.props.docusignSvc.getEnvelope(
        signRes.envelopeId).then((envRes) => {
          if (envRes.status === "completed") {
            this.onDocumentSigned(signRes.envelopeId)
            clearInterval(intervalId)
            notification.title = 'Signature completed !'
            notification.status = 'success'
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
        scos: res.results
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
























































