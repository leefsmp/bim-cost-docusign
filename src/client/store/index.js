import {client as config} from 'c0nfig'
import createStore from './createStore'

//Services
import ServiceManager from 'SvcManager'
import DocusignSvc from 'DocusignSvc'
import StorageSvc from 'StorageSvc'
import NotifySvc from 'NotifySvc'
import DialogSvc from 'DialogSvc'
import SocketSvc from 'SocketSvc'
import CostSvc from 'CostSvc'

// ========================================================
// Services Initialization
// ========================================================

const storageSvc = new StorageSvc({
  storageKey: 'Autodesk.Forge-RCDB.Storage',
  storageVersion: config.storageVersion
})

const socketSvc = new SocketSvc({
  host: config.host,
  port: config.port
})

const notifySvc = new NotifySvc()

const dialogSvc = new DialogSvc()

const docusignSvc = new DocusignSvc({
  apiUrl: '/api/docusign'
})

const costSvc = new CostSvc({
  apiUrl: '/api/cost'
})

// ========================================================
// Services Registration
// ========================================================
ServiceManager.registerService(docusignSvc)
ServiceManager.registerService(storageSvc)
ServiceManager.registerService(socketSvc)
ServiceManager.registerService(dialogSvc)
ServiceManager.registerService(notifySvc)
ServiceManager.registerService(costSvc)

// ========================================================
// Store Instantiation
// ========================================================
const initialState = window.___INITIAL_STATE__

const store = createStore(initialState)

export default store
