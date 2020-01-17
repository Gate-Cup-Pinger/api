const _ = require('lodash')
const config = require('../config')
const fs = require('fs')
const path = require('path')
const { Ping, validate } = require('../models/ping')
const { PingLog } = require('../models/pinglog')
const pinger = require('ping')
const moment = require('moment')
require('moment-timezone')
const controller = {
	async getAll(req, res) {
		const allHosts = await Ping.find({})
		return res.send(allHosts)
	},
	async logs(req, res) {
		const page = req.query.page ? parseInt(req.query.page, 10) : 0
		const sort = req.query.sort || '_id'
		const limit = req.query.limit ? parseInt(req.query.limit, 10) : 5
		const desc = req.query.desc && req.query.desc !== 'yes' ? 1 : -1
		const date = req.query.date && typeof req.query.date === 'string' && req.query.date.length
      ? req.query.date.split(',').map(d => (d && d.length ? d : null))
      : null
		const name = req.query.name || null
		const status = req.query.status || null
		const stats = !!(req.query.stats && req.query.stats === 'yes')
		const sorter = {}
		sorter[sort] = desc
		const filters = {}
		// Name
		if (name && name.length)
			filters.name = name
		// Status
		if (status && status.length)
			filters.status = status
		// Date
		if (date) {
		    if (date.length === 2) {
		      if (date[0]) filters.created_at = { $gte: new Date(date[0]) }
		      if (date[1])
		        filters.created_at = date[0]
		          ? { ...filters.created_at, $lte: new Date(date[1]) }
		          : { $lte: new Date(date[1]) }
		      }
        }
		const allHosts = await 
		PingLog.find(filters)
		 .skip(page * limit)
			.limit(limit)
			.sort(sorter)
		const count = await PingLog.find(filters)
		const pages = Math.ceil(count.length / limit, 10)
		return res.send({
			logs: stats ? count : allHosts,
			page,
			limit,
			pages: stats ? null : pages
		})
	},
	async getOne(req, res) {
		const allHosts = await Ping.find({})
		return res.send(allHosts)
	},
	async post(req, res) {
		const { error } = validate(req.body) 
		if (error) return res.status(400).send(error.details[0].message)
		const exists = await Ping.find({ ip: req.body.ip })
	    if (exists.length) {
			return res.status(400).send(`This IP Address was already registered under the name of ${exists[0].name}`)
		}
	    const pingo = new Ping(req.body)
		await pingo.save()
		return res.send(pingo)
	},
	async alive(req, res) {
		if (!req.query.ip || !req.query.ip.length) {
			return res.status(400).send('Ip address is required')
		}
		const exists = await Ping.find({ ip: req.query.ip })
		if (!exists.length) {
			return res.status(404).send('Ip address is not registered')
		}
		var hosts = [req.query.ip]
		hosts.forEach(function(host){
			pinger.sys.probe(host, async function(status){
				const firstHost = exists[0]
				const booleanStatus = s => s === 'online'
				let $set = {}
				if (booleanStatus(firstHost.last_status) !== status) {
					$set.last_status = status ? 'online' : 'offline'
					$set.first_record = moment.tz('UTC').toDate()
				}
				$set.last_check = moment.tz('UTC').toDate()
				const updated = await Ping.findOneAndUpdate({ ip: req.query.ip }, { $set }, { new: true })
				return res.send(updated)
			})
		})
	},
	async deleteHost(req, res) {
    const job = await Ping.findById(req.params.id)
    if (!job) {
      return res.status(404).send('Job Not Found')
    }
    Ping.deleteOne({ _id: req.params.id }, function(err) {
      return res.send('Deleted')
    })
  }
}


module.exports = controller