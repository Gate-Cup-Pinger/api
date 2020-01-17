const _ = require('lodash')
const config = require('../config')
const fs = require('fs')
const path = require('path')
const node_ssh = require('node-ssh')
const controller = {
	async post (req, res){
		const em = ''
		// cd /u01/app/ogg/ogg_home && ./ggsci
		// global.conn.execCommand(req.body.command , {}).then(function(result) {
		// 	// ssh.execCommand('info all', { }).then(function(result) {
		// 	if (result.stderr) {
		// 		return res.status(400).send(result)
		// 	} else {
		// 		return res.send(result)
		// 	}
		// 	// })
		// }).catch(err =>{
		// 	return res.status(400).send(err)
		// })
		// return res.send(ssh)

		// global.conn.exec(req.body.command, function(err, stream) {
		// 	if (err) throw err
		// 	stream.on('close', function(code, signal) {
		// 		console.log('Stream :: close :: code: ' + code + ', signal: ' + signal)
		// 		conn.end()
		// 		return res.send('connection Lost')
		// 	}).on('data', function(data) {
		// 		console.log('STDOUT: ' + data)
		// 		return res.send({stdout: data, stderr: null})
		// 	}).stderr.on('data', function(data) {
		// 		console.log('STDERR: ' + data)
		// 		return res.status(400).send({stdout: null, stderr: data})
		// 	})
		// })
		console.log('=============stream begin')
		console.log(global.stream)
		console.log('=============stream ends')
		global.stream.end(req.body.command)
		global.stream.on('close', function() {
			console.log('Stream :: close')
			global.conn.end()
		}).on('data', function(data) {
			console.log('STDOUT: ' + data)
			return res.send({stdout: data, stderr: null})
		}).stderr.on('data', function(data) {
			console.log('STDERR: ' + data)
			return res.status(400).send({stdout: null, stderr: data})
		})
	},
	async isConnected(req, res) {
		return res.send({status: global.sshStatus})
	}
}


module.exports = controller