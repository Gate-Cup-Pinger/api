const express = require('express')
const router = express.Router()
const nodesController = require('../controllers/nodes')

router.post('/', nodesController.post)

router.get('/status', nodesController.isConnected)



module.exports = router 
