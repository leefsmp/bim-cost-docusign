
import ContentEditable from 'react-contenteditable'
import './EmailInput.scss'
import React from 'react'


export default class EmailInput extends React.Component {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor (props) {

    super(props)

    this.state = {
      email: ''
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onKeyDown (e, type) {

    switch (type) {

      case 'Double': {

        //backspace, ENTER, ->, <-, delete, '.', '-', ',',
        const allowed = [8, 13, 37, 39, 46, 188, 189, 190]

        if (allowed.indexOf(e.keyCode) > -1 ||
          (e.keyCode > 47 && e.keyCode < 58)) {

          return
        }

        e.stopPropagation()
        e.preventDefault()
        break
      }

      case 'Int': {

        //backspace, ENTER, ->, <-, delete, '-'
        const allowed = [8, 13, 37, 39, 46, 189]

        if (allowed.indexOf(e.keyCode) > -1 ||
          (e.keyCode > 47 && e.keyCode < 58)) {

          return
        }

        e.stopPropagation()
        e.preventDefault()
        break
      }

      case 'Text': {

        if (e.keyCode === 13) {

          e.stopPropagation()
          e.preventDefault()
        }

        break
      }
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onInputChanged (e) {

    const email = !!e.target.value
      ? e.target.value.replace(/&nbsp;/g, '')
      : e.target.value

    this.setState({
      email
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  render() {

    return (
      <ContentEditable
      onKeyDown={(e) => this.onKeyDown(e, 'Text')}
        onChange={(e) => this.onInputChanged(e)}
        data-placeholder="Enter recipient's email ..."
        className="input email"
        html={this.state.email}
      />
    )
  } 
}
