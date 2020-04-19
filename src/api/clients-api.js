const SnapState = require('../snap-service/snap-state')
const SnapActions = require('../snap-service/snap-actions')
const router = require('express').Router()

router.get('/', async (req, res) => {
  return res.json(await SnapState.getClients())
})

router.get('/:clientId', async (req, res) => {
  const { clientId } = req.params
  return res.json(await SnapState.getClient(clientId))
})

router.put('/:clientId/volume/:volume', async (req, res) => {
  const { clientId, volume } = req.params
  await SnapActions.setVolume(clientId, volume)
  return res.json(await SnapState.getClient(clientId))
})

router.put('/:clientId/name/:name', async (req, res) => {
  const { clientId, name } = req.params
  await SnapActions.setName(clientId, name)
  return res.json(await SnapState.getClient(clientId))
})

module.exports = router
