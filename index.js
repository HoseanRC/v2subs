const https = require('https');
const fs = require('fs');

const { exec } = require('child_process');

async function getNodes() {
 	return new Promise(async (resolve, reject) => {

	const options = {
		hostname: "raw.githubusercontent.com",
		path: "/songtao1873/clash/main/subscription/others/node.txt",
		port: 443,
		method: 'GET'
	};

	let body = [];

	const req = https.request(options, res => {
		res.on('data', chunk => body.push(chunk));
			res.on('end', () => {
				const data = Buffer.concat(body).toString();
				resolve(data);
			});
		});
		req.on('error', e => {
			// console.log(`ERROR httpsGet: ${e}`);
			reject(e);
		});
		req.end();
	});
}

(new Promise(async (resolve, reject) => {
	var nodes_str = await getNodes();
	var hosts_array = [];
	var nodes_array = nodes_str.split("\n");
	var nodes_output_array = [];
	var nodes_output = "";
	console.log(`${nodes_array.length} nodes in total...`);
	for(var i = 0; i < nodes_array.length; i++){
		var node = nodes_array[i];
		let hostname = "";
		let flag = "";
		let link = "";
		switch(node.split("://")[0]){
			case "ss":
			case "trojan":
				hostname = /(?:.*@)(.*?)[:#]/g.exec(node)[1];
				flag = Buffer.from(/#.{3}(.{24})/.exec(node)[1].replaceAll("%", ""), "hex").toString();
				break;
			case "ssr":
				link = Buffer.from(node.split("://")[1], "base64").toString();
				hostname = link.split(":")[0];
				flag = /\[(.{4})\]/g.exec(Buffer.from(/(?:.*remarks=)(.*?)(&|$)/g.exec(link)[1],"base64").toString())[1];
				break;
			case "vmess":
				link = JSON.parse(Buffer.from(node.split("://")[1], "base64").toString());
				hostname = link.host;
				flag = /\[(.{4})\]/g.exec(link.ps)[1];
				break;
		}
		if(hostname != "" &! hosts_array.includes(hostname)){
			hosts_array.push(hostname);
			nodes_output_array.push(flag + node);
		}
	}
	nodes_output_array.sort().forEach(node => {
		nodes_output += /(?:.{4})(.*)/.exec(node)[1];
		nodes_output += "\n";
	});
	fs.writeFile('nodes.txt', nodes_output, err => {
		console.log(`\n${nodes_output.split("\n").length-1} unique nodes!`);
		if (err) {
			console.error(err);
                        return;
		}
                exec(`echo "nodescount=${nodes_output.split("\n").length-1}" >> $GITHUB_ENV`);
	});
})).then(()=>{});
