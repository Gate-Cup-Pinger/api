const express = require('express')
const config = require('./config')
const path = require('path')
const node_ssh = require('node-ssh')
const Client = require('ssh2').Client
const fs = require('fs')
const { Ping, validate } = require('./models/ping')
const { PingLog } = require('./models/pinglog')
const pinger = require('ping')
const moment = require('moment')
require('moment-timezone')

const app = express()
require('./startup/routes')(app)
require('./startup/db')()
require('./startup/config')()
require('./startup/validation')()

const booleanStatus = s => s === 'online'
const alive = async station => {
	// console.log('===/////////======////////===')
	// console.log(station)
	pinger.sys.probe(station.ip, async function(status){
	   let onChange = false		
		let $set = {}
		if (booleanStatus(station.last_status) !== status) {
			onChange = true
			$set.last_status = status ? 'online' : 'offline'
			$set.first_record = moment.tz('UTC').toDate()
		}
		$set.last_check = moment.tz('UTC').toDate()
		const updated = await Ping.findOneAndUpdate({ ip: station.ip }, { $set }, { new: true })
		if (onChange) {
			const log = new PingLog({
				ip: updated.ip,
				name: updated.name,
				status: updated.last_status
			})
			await log.save()
		}
	})
}

async function pingOnLoop() {
	const allHosts = await Ping.find({})
	let i
	for (i = 0; i < allHosts.length; i += 1) {
		alive(allHosts[i])
	}
	setTimeout(()=>{
		pingOnLoop()
	}, 20000)
}


const server = app.listen(config.port, () => console.log(`Listening on port ${config.port}...`))
pingOnLoop()
module.exports = server