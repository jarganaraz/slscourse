'use strict';

const AWS = require('aws-sdk');

var sqs = new AWS.SQS({ region: process.env.REGION });
const QUEUE_URL = process.env.PENDING_ORDER_QUEUE;

const orderMetadataManager = require('./orderMetadataManager');

module.exports.hacerPedido = (event, context, callback) => {
	console.log('HacerPedido fue llamada');
	const orderId = "234234234234234234";

	const body = JSON.parse(event.body);
	const order = {
		orderId: orderId,
		name: body.name,
		address: body.address,
		pizzas: body.pizzas,
		timestamp: Date.now()
	};

	const params = {
		MessageBody: JSON.stringify(order),
		QueueUrl: QUEUE_URL
	};

	sqs.sendMessage(params, function(err, data) {
		if (err) {
			sendResponse(500, err, callback);
		} else {
			const message = {
				orderId: order,
				messageId: data.MessageId
			};
			sendResponse(200, message, callback);
		}
	});
};

module.exports.prepararPedido = (event, context, callback) => {

	try {
		console.log("Evento llamado")
		const order = JSON.parse(event.Records[0].body);
	
		orderMetadataManager.saveCompletedOrder(order).then(data => {
			callback();
		})
		.catch(error => {
			callback(error);
		});

		//callback();


	} catch (error) {
		console.log(error)
	}

}

function sendResponse(statusCode, message, callback) {
	const response = {
		statusCode: statusCode,
		body: JSON.stringify(message)
	};
	callback(null, response);
}