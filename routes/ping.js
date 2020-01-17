const express = require('express')
const router = express.Router()
const nodesController = require('../controllers/ping')

router.get('/:host', nodesController.getOne)

router.get('/', nodesController.getAll)

router.post('/', nodesController.post)

router.get('/host/alive', nodesController.alive)

router.get('/host/logs', nodesController.logs)

router.delete('/:id' ,nodesController.deleteHost)

module.exports = router 
