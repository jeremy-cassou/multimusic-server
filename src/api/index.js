const SnapState = require('../snap-service/snap-state')
const router = require('express').Router()

router.get('/', async (req, res) =>
  res.json(await SnapState.getState()))

router.use('/clients', require('./clients-api'))
router.use('/groups', require('./groups-api'))

module.exports = router
