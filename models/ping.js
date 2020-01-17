
const config = require('../config')
const Joi = require('joi')
const mongoose = require('mongoose')
const _ = require('lodash')
const moment = require('moment')
require('moment-timezone')

const pingSchema = new mongoose.Schema({
	ip: {
		type: String,
		required: true,
		minlength: 1,
		maxlength: 2000
	},
	name: {
		type: String,
		required: true,
		minlength: 1,
		maxlength: 200,
		default: 'Machine'
	},
	private_key: {
		type: String,
		maxlength: 2000,
		default: ''
	},
	notes: {
		type: String,
		maxlength: 2000,
		default: ''
	},
	last_status: {
		type: String,
		default: 'offline'
	},
	last_check: {
		type: Date,
		default: moment.tz('UTC').toDate()
	},
	first_record: {
		type: Date,
		default: moment.tz('UTC').toDate()
	}
})


const Ping = mongoose.model('ping', pingSchema)
function validatePing(mod) {
	const schema = {
		ip: Joi.string().min(1).max(2000),
		name: Joi.string().min(1).max(2000),
		private_key: Joi.string().allow('').max(2000),
		notes: Joi.string().allow('').max(2000)
	}
	return Joi.validate(mod, schema)
}

exports.Ping = Ping 
exports.validate = validatePing