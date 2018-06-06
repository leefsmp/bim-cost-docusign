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
  constructor(props) {

    super (props)

    this.onRequestSignature = this.onRequestSignature.bind(this)

    this.onEmailChanged = this.onEmailChanged.bind(this)
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  onRequestSignature () {

    const sco = this.props.sco

    const notification = this.props.notifySvc.add({
      title: 'Requesting signature ...',
      message: `email: bro@gmail.com 
                status: sent`,
      dismissible: false,
      status: 'loading',
      dismissAfter: 0,
      position: 'tl',
      id: sco.id
    })

    const intervalId = setInterval(() => {
      console.log('Check...')
    }, 10000)

    notification.buttons = [{
      name: 'Cancel',
      onClick: () => {
        notification.dismissAfter = 1
        this.notifySvc.update(notification)
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

  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  render () {

    const sco = this.props.sco

    return (
      <div className="sco">
        <label>
          { sco.name }
        </label>
        <EmailInput onChange={this.onEmailChanged}/>
        <button onClick={this.onRequestSignature}>
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

    this.costSvc = ServiceManager.getService('CostSvc')
    
    this.costSvc.getSCOs().then((res) => {
      this.setState({
        scos: res.data
      })
    })

    new ClientAPI('/api/cost')

    this.costAPI.ajax().then(

    this.state= {
      scos: []
    }
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  renderSCOs(scos) {
  
    return scos.map((sco) => {
      return (
        <SCO 
          notifySvc={this.notifySvc} 
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
























































