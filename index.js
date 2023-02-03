require('dotenv').config();

const https = require('https');
const http  = require('http');

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

http.createServer(handle_http_request).listen(process.env.PORT || 3000);

async function handle_http_request(request, response){
	var nodes_str = await getNodes();
	var hosts_array = [];
	var nodes_array = nodes_str.split("\n");
	var nodes_output = "";
	for(var i = 0; i < nodes_array.length; i++){
		var node = nodes_array[i];
		let hostname = "";
		switch(node.split("://")[0]){
			case "ss":
			case "trojan":
				let a = node.substring(
					node.indexOf("@") + 1, 
					node.length
				);
				hostname = a.substring(
					0,
					a.indexOf(":")
				);
				break;
			case "ssr":
				hostname = Buffer.from(node.split("://")[1], "base64").toString().split(":")[0];
				break;
			case "vmess":
				hostname = JSON.parse(Buffer.from(node.split("://")[1], "base64").toString()).host;
				break;
		}
		if(hostname != "" &! hosts_array.includes(hostname)){
			hosts_array.push(hostname);
			nodes_output += node;
			nodes_output += "\n";
		}
	}
	response.write(nodes_output);
	response.end();
}
