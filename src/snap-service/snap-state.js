const SnapAPI = require('../json-rcp')

let cacheState = null
let promiseState = Promise.resolve()

async function refreshState () {
  promiseState = new Promise(async resolve => {
    const response = await SnapAPI.sendRequest('Server.GetStatus')
    cacheState = response.server
    resolve(cacheState)
  })
  await promiseState
}

async function getState () {
  if (!cacheState) { refreshState() }
  await promiseState
  return cacheState
}

async function getGroups () {
  const state = await getState()
  return state.groups
}

async function getGroup (groupId) {
  const groups = await getGroups()
  return groups.find(group =>group.id === groupId)
}

async function getClients () {
  const groups = await getGroups()
  return groups.map(group => group.clients).flat()
}

async function getClient (clientId) {
  const clients = await getClients()
  return clients.find(client => client.id === clientId)
}

async function getClientsId () {
  const clients = await getClients()
  return clients.map(client => client.id)
}

async function getGroupClients (groupId) {
  const group = await getGroup(groupId)
  return group.clients
}

async function getGroupClientsId (groupId) {
  const clients = await getGroupClients(groupId)
  return clients.map(client => client.id)
}

async function getStreams () {
  const state = await getState()
  return state.streams
}

async function getStream (streamId) {
  const streams = await getStreams()
  return streams.find(stream => stream.id === streamId)
}

module.exports = {
  refreshState,
  getState,
  getGroups,
  getGroup,
  getClients,
  getClient,
  getClientsId,
  getGroupClients,
  getGroupClientsId,
  getStreams,
  getStream,
}
