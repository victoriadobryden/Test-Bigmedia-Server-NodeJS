const express = require('express')
const service = require('../services/monitoring')
const {asyncMW} = require('../utils/async')

const router = express.Router()
router.get('/', asyncMW(async (req, res) => {
  const props = req.body
      // allProps = Object.assign(props, {
      //   clientId: req.user.orgId ,
      //   ownerId: req.user.id,
      // })
  res.json(await service.list())
}))

router.get('/data', asyncMW(async (req, res) => {
  const props = req.body,
      allProps = Object.assign(props, {
        clientId: req.user.orgId,
        ownerId: req.user.id,
        // ownerId: req.user.id,
      });
  //console.warn(allProps)
  res.json(await service.dataFull())
}))
router.get('/:id/data', asyncMW(async (req, res) => {
  const id = req.params.id;
  res.json(await service.dataById(id))
  // res.json(proposal)
}))
module.exports = router
