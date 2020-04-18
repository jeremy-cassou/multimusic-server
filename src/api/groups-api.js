const SnapState = require('../snap-service/snap-state')
const SnapActions = require('../snap-service/snap-actions')
const snapState = require('../snap-service/snap-state')
const router = require('express').Router()

router.get('/', async (req, res) => {
  return res.json(await SnapState.getGroups())
})

router.get('/:groupId', async (req, res) => {
  const { groupId } = req.params
  return res.json(await SnapState.getGroup(groupId))
})

router.put('/:groupId/add/:clientId', async (req, res) => {
  const { groupId, clientId } = req.params
  await SnapActions.addTo(groupId, clientId)
  return res.json(await snapState.getGroup(groupId))
})

router.put('/:groupId/remove/:clientId', async (req, res) => {
  const { groupId, clientId } = req.params
  await SnapActions.removeFrom(groupId, clientId)
  return res.json(await snapState.getGroup(groupId))
})

router.put('/:groupId/play', async (req, res) => {
  const { groupId } = req.params
  await SnapActions.startPlaying(groupId)
  return res.json(await snapState.getGroup(groupId))
})

router.put('/:groupId/pause', async (req, res) => {
  const { groupId } = req.params
  await SnapActions.stopPlaying(groupId)
  return res.json(await snapState.getGroup(groupId))
})

module.exports = router
