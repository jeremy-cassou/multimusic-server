const SnapAPI = require('../json-rcp')
const SnapState = require('./snap-state')
const SpotifyStream = require('../spotify-stream')

async function setVolume (clientId, volume) {
  await SnapAPI.sendRequest('Client.SetVolume', {
    id: clientId,
    volume: { percent: parseInt(volume), mute: false },
  })
  await SnapState.refreshState()
}

async function setName (clientId, name) {
  await SnapAPI.sendRequest('Client.SetName', {
    id: clientId,
    name: name,
  })
  await SnapState.refreshState()
}

async function startPlaying (groupId) {
  await SnapAPI.sendRequest('Group.SetMute', {
    id: groupId,
    mute: false,
  })
  await SnapState.refreshState()
}

async function stopPlaying (groupId) {
  await SnapAPI.sendRequest('Group.SetMute', {
    id: groupId,
    mute: true,
  })
  await SnapState.refreshState()
}

async function addTo (groupId, clientId) {
  const clientsId = await SnapState.getGroupClientsId(groupId)
  if (!clientsId.includes(clientId)) {
    await SnapAPI.sendRequest('Group.SetClients', {
      id: groupId,
      clients: [ ...clientsId, clientId ],
    })
    await SnapState.refreshState()

    await removeStream(SpotifyStream.buildStreamId({ id: clientId }))
  }
}

async function removeFrom (groupId, clientId) {
  const clientsId = await SnapState.getGroupClientsId(groupId)
  const [ masterClient, ...slaveClients ] = clientsId
  if (slaveClients.includes(clientId)) {
    await SnapAPI.sendRequest('Group.SetClients', {
      id: groupId,
      clients: clientsId.filter(id => id !== clientId),
    })
    await SnapState.refreshState()

    await ensureMasterStream(clientId)
  }
}

async function addStream (streamUri) {
  await SnapAPI.sendRequest('Stream.AddStream', { streamUri })
  await SnapState.refreshState()
}

async function removeStream (streamId) {
  await SnapAPI.sendRequest('Stream.RemoveStream', { id: streamId })
  await SnapState.refreshState()
}

async function setStream (groupId, streamId) {
  await SnapAPI.sendRequest('Group.SetStream', {
    id: groupId,
    stream_id: streamId,
  })
  await SnapState.refreshState()
}

async function ensureMasterStream (clientId) {
  const client = await SnapState.getClient(clientId)
  const streamId = SpotifyStream.buildStreamId(client)
  const stream = await SnapState.getStream(streamId)
  const groups = await SnapState.getGroups()

  // S'assure que le stream Spotify du client existe
  if (!stream) {
    await addStream(SpotifyStream.buildSpotifyStream({
      streamId: streamId,
      devicename: client.config.name || client.host.name,
    }))
  }

  // Cherche le groupe dont le client est maitre
  const group = groups.find(group =>
    group.clients.length && group.clients[0].id === client.id)

  // Si son groupe existe, utilise son stream Spotify
  if (group) {
    await setStream(group.id, streamId)
  }
}

async function init () {
  const groups = await SnapState.getGroups()

  return groups.reduce(async (promise, group) => {
    return promise.then(() => ensureMasterStream(group.clients[0].id))
  }, Promise.resolve())
}

module.exports = {
  setVolume,
  setName,
  startPlaying,
  stopPlaying,
  addTo,
  removeFrom,
  addStream,
  removeStream,
  setStream,
  ensureMasterStream,
  init,
}
