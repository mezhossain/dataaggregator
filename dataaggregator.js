var http = require('http');
var request = require('request');
var fs = require('fs');
var csv = require('csv');
var url = require('url');
var create_html = require('./create_html.js');
var update_log = require('./update_log.js')

var json_request_body = undefined;
var csv_request_body = undefined;
var html_content = undefined;

// function createHtmlStringFromJson(retrievedData){
// 	// var html_string = '<html>\n<header>\n<title>Data aggregator</title>\n</header>\n<body>\n<table>';
// 	var body_begin_index = html_content.indexOf('<body>');
// 	var body_end_index = html_content.indexOf('</body>');
// 	var string_until_body = html_content.slice(0, body_begin_index + 6);
// 	var string_from_body = html_content.slice(body_end_index);
// 	var html_string = '<table>\n';
// 	html_string += '<tr>\n';
// 	for (var attribute in retrievedData[0]) {
// 		if(typeof retrievedData[0][attribute] !==  'object') {
// 			html_string += '<td>' + attribute + '</td>\n';
// 		}
// 	}
// 	html_string += '</tr>\n';
// 	retrievedData.forEach(function(object){
// 		html_string += '<tr>\n';
// 		for (var attribute in object){
// 			if(typeof object[attribute] !==  'object') {
// 				html_string += '<td>' + object[attribute] + '</td>\n';
// 			}
// 		}
// 		html_string += '</tr>\n';
// 	});
// 	//html_string += '</table>\n</body>\n</html>';
// 	//return html_string;
// 	html_string += '</table>';
// 	return string_until_body + html_string + string_from_body;
// }

// function createHtmlStringFromCsv(retrievedData){
// 	var body_begin_index = html_content.indexOf('<body>');
// 	var body_end_index = html_content.indexOf('</body>');
// 	var string_until_body = html_content.slice(0, body_begin_index + 6);
// 	var string_from_body = html_content.slice(body_end_index);
// 	var html_string = '<table>\n';
// 	html_string += '<tr>\n';
// 	retrievedData[0].forEach(function (attribute){
// 		html_string += '<td>' + attribute + '</td>\n';
// 	});
// 	var data = retrievedData.slice(1);
// 	data.forEach(function(row){
// 		html_string += '</tr>\n';
// 		row.forEach(function (cell){
// 			html_string += '<td>' + cell + '</td>\n'
// 		});
// 		html_string += '</tr>\n';
// 	});
// 	html_string += '</table>';
// 	return string_until_body + html_string + string_from_body;
	
// }
setInterval(function(){
	request('https://www.bnefoodtrucks.com.au/api/1/trucks', function(err, request_res, body){
		json_request_body = body;
	});
	// console.log('Requesting json data');
}, 2000);

setInterval(function(){
	request('https://www.data.brisbane.qld.gov.au/data/dataset/1e11bcdd-fab1-4ec5-b671-396fd1e6dd70/resource/3c972b8e-9340-4b6d-8c7b-2ed988aa3343/download/public-art-open-data-2019-06-10.csv', function(err, request_res, body){
		csv.parse(body, function(err, data){
			csv_request_body = data;
		});
	});
	// console.log('Requesting csv data');
}, 2000);

http.createServer(function (req, res){
	if(json_request_body && csv_request_body && html_content){
		res.writeHead(200, {'Content-Type': 'text/html'});
		var request_url = url.parse(req.url);
		switch (request_url.path){
			case '/json':
				update_log.updateLogFile('Accessed JSON data');
				res.end(create_html.createHtmlStringFromJson(html_content, JSON.parse(json_request_body)));
				break;
			case '/csv':
				update_log.updateLogFile('Accessed CSV data');
				res.end(create_html.createHtmlStringFromCsv(html_content, csv_request_body));
				break;
		}
	}
	else {
		res.writeHead(200, {'Content-Type': 'text/html'});
		res.end('Nothing retrieved yet');
	}
}).listen(8080);

console.log('Data Aggregator');


fs.readFile('./index.html', function(err, html) {
	if(err){ throw err; }
	html_content = html;
});