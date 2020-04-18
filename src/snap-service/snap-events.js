const SnapState = require('./snap-state')
const SnapAction = require('./snap-actions')

async function onClientConnect ({ client }) {
  return SnapAction.ensureMasterStream(client.id)
}

async function onEventReceived ({ method, params }) {
  await SnapState.refreshState()
  switch (method) {
    case 'Client.OnConnect':
      return onClientConnect(params)
  }
}

module.exports = async function () {
  require('../json-rcp').addEventsHandler(onEventReceived)
}
