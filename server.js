const handlers      = require("./handlers/handlers");
const http          = require("http");
const StringDecoder = require("string_decoder").StringDecoder;
const url           = require("url");

let server = {};

server.router = {
    users: handlers.users,
    tokens: handlers.tokens,
    menu: handlers.menu,
    cart: handlers.carts,
    checkout: handlers.checkout,
    echo: handlers.echo
};

server.unifiedServer = function(req, res) {
    let decoder = new StringDecoder("utf-8");

    // Payload in HTTP request comes in streams
    let buffer = "";

    // When chunk of data is ready, append it to the buffer
    req.on("data", function(data) {
        buffer += decoder.write(data);
    });

    // End is always called, even if there is no payload
    req.on("end", function() {
        buffer += decoder.end();

        let parsedUrl = url.parse(req.url, true);                      // Split endpoint from query
        let path      = parsedUrl.pathname.replace(/^\/+|\/+$/g, "");  // Trim redundant slashes

        var data = {
            endpoint: path,
            query: parsedUrl.query,
            method: req.method.toLowerCase(),
            headers: req.headers,
            payload: buffer
        };

        // console.log(`HTTP Request dump:
        //     ${JSON.stringify(data)}`);

        // Route requests
        let handler = path in server.router ? server.router[path] : handlers.notFound;
        // let result  = await handler(data);

        handler(data).then((result) => {
            res.setHeader("Content-Type", "application/json");
            res.writeHead(result.status);
            res.end(JSON.stringify(result.payload));

            // console.log(`result dump ${JSON.stringify(result)}`);
        });
    });
};

server.httpServer = http.createServer(server.unifiedServer);

server.init = function() {
    server.httpServer.listen(3000, function() {
        console.log("Server is listening on port 3000");
    });
};

module.exports = server;