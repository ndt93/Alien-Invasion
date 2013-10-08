var http = require('http'),
events = require('events'),
url = require('url'),
fs = require('fs'),
path = require('path');

function loadFile(url_path, res) {
    var full_path = path.join(process.cwd(), url_path);
    fs.exists(full_path, function (existed){
       if (!existed) {
            res.writeHead(404, {"Content-Type": "text/plain"});
            res.write("404 File not found");
            res.end();
       } else {
            fs.readFile(full_path, "binary", function (err, file) {
               if (err) {
                    res.writeHead(505, {"Content-Type": "text/plain"});
                    res.write(err + '\n');
                    res.end();
               } else {
                    res.writeHead(200);
                    res.write(file, "binary");
                    res.end();
               }
            });
       }
    });
}

http.createServer(function (req, res){
   var url_path = url.parse(req.url).pathname;
   if (url_path == "/") {
        loadFile(url_path + "index.html", res);
   } else {
        loadFile(url_path, res);
   }
}).listen(8000);
console.log("Server created on port 8000");

