const net = require('net')

// Client pour la connexion au serveur de requête
const clientRequest = new net.Socket()

// Liste des requêtes en attente de leur réponse
const pendingRequests = {}

// Liste des handlers de notification
const eventsHandlers = []

function addEventsHandler (handler) {
  if (!eventsHandlers.includes(handler)) {
    eventsHandlers.push(handler)
  }
}

function removeEventsHandler (handler) {
  const index = eventsHandlers.indexOf(handler)
  if (index !== 1) {
    eventsHandlers.splice(index, 1)
  }
}

// Check si c'est une réponse d'une requête précendente
function tryResolveRequest ({ id: requestId, result }) {
  if (pendingRequests[requestId]) {
    console.log('RESPONSE', { requestId, result })
    pendingRequests[requestId].resolve(result)
    pendingRequests[requestId] = undefined
    return true
  }
}

function tryResolveEvent ({ method, params }) {
  if (method.search(/\w+\.On\w+/) !== -1) {
    console.log('EVENT', JSON.stringify({ method, params }))
    eventsHandlers.forEach(handler => handler({ method, params }))
    return true
  }
}

function tryResolveResponse (response) {
  console.log('UNKNOW RESPONSE', JSON.stringify(response))
}

// Enregistre une nouvelle requête en attente de sa réponse
function registerRequest (requestId, resolve, reject) {
  if (pendingRequests[requestId]) {
    console.warn('Request id already exist. Reject automatically previous request')
    pendingRequests[requestId].reject()
    pendingRequests[requestId] = undefined
  }
  pendingRequests[requestId] = { resolve, reject }
}

// Identifiant de la prochaine requête
let nextRequestId = 1

// Envoi d'une requête au serveur
async function sendRequest (method, params) {
  return new Promise((resolve, reject) => {
    console.log('SEND REQUEST', { method, params })
    const requestId = nextRequestId++
    registerRequest(requestId, resolve, reject)
    clientRequest.write(JSON.stringify({
      id: requestId,
      jsonrpc: '2.0',
      method,
      params,
    }) + '\r\n')
  })
}

// Promesse pour attendre la connexion au serveur avant l'envoi des requêtes
let connectionResolve
const connectionPromise = new Promise(resolve => {
  connectionResolve = resolve
})

let partialResponse = ''

function buildFullResponse (endResponse) {
  const json = partialResponse + endResponse
    try {
      return JSON.parse(json)
    } catch (error) {
      console.log('ERROR ON RECEIVED DATA', json)
    } finally {
      partialResponse = ''
    }
}

function appendResponse (partResponse) {
  partialResponse += partResponse
}

function hasEndOfLine (str) {
  return str.slice(-2) === '\r\n'
}

function onDataReceived (buffer) {
  const str = buffer.toString()
  if (hasEndOfLine(str)) { // Fin de ligne
    const response = buildFullResponse(str)
    return tryResolveRequest(response)
      || tryResolveEvent(response)
      || tryResolveResponse(response)
  }

  appendResponse(str)
}

// Permet d'initialiser la connexion au serveur
async function connect (host, port) {
  try {
    clientRequest.on('data', onDataReceived)
    clientRequest.connect(port, host, connectionResolve)
  } catch (error) {
    console.log('Failed to connect on JSON RPC API')
  }
  return connectionPromise
}

module.exports = {
  connect,
  sendRequest: async (...args) => connectionPromise.then(() => sendRequest(...args)),
  addEventsHandler,
  removeEventsHandler,
}
