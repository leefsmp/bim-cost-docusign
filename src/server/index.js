// async support
import 'babel-polyfill'

//Server stuff
import cookieParser from 'cookie-parser'
import compression from 'compression'
import session from 'express-session'
import bodyParser from 'body-parser'
import express from 'express'
import helmet from 'helmet'
import debug from 'debug'
import util from 'util'
import path from 'path'

//Endpoints
import DocusignAPI from './api/endpoints/docusign'
import CostAPI from './api/endpoints/cost'

//Services

import ServiceManager from './api/services/SvcManager'
import DocuSignSvc from './api/services/DocuSignSvc'
import BIMCostSvc from './api/services/BIMCostSvc'
import SocketSvc from './api/services/SocketSvc'
import FileSvc from './api/services/FileSvc'

//Config (NODE_ENV dependant)
import config from'c0nfig'

/////////////////////////////////////////////////////////////////////
// App initialization
//
/////////////////////////////////////////////////////////////////////
const app = express()

if (process.env.NODE_ENV === 'development') {

  app.use(session({
    secret: 'bim-cost-docusign',
    cookie: {
      secure: false,
      maxAge: 1000 * 60 * 60 * 24 // 24h session
    },
    resave: false,
    saveUninitialized: true
  }))

} else {

  // Use another kind of session storage in a real app
  // database typically
  app.use(session({
    secret: 'bim-cost-docusign',
    cookie: {
      secure: false,
      maxAge: 1000 * 60 * 60 * 24 // 24h session
    },
    resave: false,
    saveUninitialized: true
  }))
}

app.use('/resources', express.static(__dirname + '/../../resources'))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.set('trust proxy', 1)
app.use(cookieParser())
app.use(helmet())

///////////////////////////////////////////////////////////
// Services setup
//
///////////////////////////////////////////////////////////
const docuSignSvc = new DocuSignSvc({
  credentials: {
    IntegratorKey: process.env.DOCUSIGN_CLIENTID,
    Username:  process.env.DOCUSIGN_USERNAME,
    Password:  process.env.DOCUSIGN_PASSWORD
  },
  basePath: 'https://demo.docusign.net/restapi',
  accountId:  process.env.DOCUSIGN_ACCOUNTID
})

const bimCostSvc = new BIMCostSvc({
  API_BASE_URL: 'https://developer-stg.api.autodesk.com/cost-api-dev/v1',
  API_PORTAL_BASE_URL: 'https://developer-stg.api.autodesk.com',
  APP_BASE_URL: 'https://docs.b360-dev.autodesk.com',
  username: process.env.BIM_USERNAME,
  password: process.env.BIM_PASSWORD
})

const fileSvc = new FileSvc({
  tempStorage: path.join(__dirname, '/../../TMP')
})

ServiceManager.registerService(docuSignSvc)
ServiceManager.registerService(bimCostSvc)
ServiceManager.registerService(fileSvc)

///////////////////////////////////////////////////////////
// API Routes setup - Disabled except socket by default
//
///////////////////////////////////////////////////////////
app.use('/api/docusign', DocusignAPI())
app.use('/api/cost', CostAPI())

/////////////////////////////////////////////////////////////////////
// This rewrites all routes requests to the root /index.html file
// (ignoring file requests). If you want to implement universal
// rendering, you'll want to remove this middleware
//
/////////////////////////////////////////////////////////////////////
app.use(require('connect-history-api-fallback')())

/////////////////////////////////////////////////////////////////////
// Static routes
//
/////////////////////////////////////////////////////////////////////
if (process.env.HOT_RELOADING) {

  // dynamically require webpack dependencies
  // to them in devDependencies (package.json)
  const webpackConfig = require('../../webpack/development.webpack.config')
  const webpackDevMiddleware = require('webpack-dev-middleware')
  const webpackHotMiddleware = require('webpack-hot-middleware')
  const webpack = require('webpack')

  const compiler = webpack(webpackConfig)

  app.use(webpackDevMiddleware(compiler, {
    publicPath: webpackConfig.output.publicPath,
    stats: webpackConfig.stats,
    progress: true,
    hot: true
  }))

  app.use(webpackHotMiddleware(compiler))

} else {

  // compression middleware compresses your server responses
  // which makes them smaller (applies also to assets).
  // You can read more about that technique and other good
  // practices on official Express.js docs http://mxs.is/googmy
  app.use(compression())

  app.use(express.static(path.resolve(process.cwd(), './dist')))
}

app.get('*', express.static(path.resolve(process.cwd(), './dist')))

/////////////////////////////////////////////////////////////////////
//
//
/////////////////////////////////////////////////////////////////////
function runServer(app) {

  try {

    process.on('exit', () => {

    })

    process.on('uncaughtException', (err) => {

      console.log('uncaughtException')
      console.log(err)
      console.error(err.stack)
    })

    process.on('unhandledRejection', (reason, p) => {

      console.log('Unhandled Rejection at: Promise ', p,
        ' reason: ', reason)
    })

    const server = app.listen(
      process.env.PORT || config.server_port || 3000, () => {

        const socketSvc = new SocketSvc({
          session,
          server
        })

        ServiceManager.registerService(socketSvc)

        console.log('Server listening on: ')
        console.log(server.address())
        console.log('ENV: ' + process.env.NODE_ENV)
      })

  } catch (ex) {

    console.log('Failed to run server... ')
    console.log(ex)
  }
}

/////////////////////////////////////////////////////////////////////
//
//
/////////////////////////////////////////////////////////////////////
runServer(app)

