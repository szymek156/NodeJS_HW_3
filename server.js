const handlers      = require("./handlers/handlers");
const http          = require("http");
const StringDecoder = require("string_decoder").StringDecoder;
const url           = require("url");

let server = {};

server.router = {
    "api/users": handlers.api.users,
    "api/tokens": handlers.api.tokens,
    "api/menu": handlers.api.menu,
    "api/cart": handlers.api.carts,
    "api/checkout": handlers.api.checkout,

    "": handlers.index,
    "account/create": handlers.account.create,
    // "account/edit": handlers.account.edit,
    // "account/deleted": handlers.account.deleted,

    "session/create": handlers.session.create,
    "session/delete": handlers.session.delete,

    "cart/create": handlers.cart.create,
    "cart/edit": handlers.cart.edit,

    "menu": handlers.api.menu,
    "favicon.ico": handlers.favicon,
    "public": handlers.public,

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

        console.log(`HTTP Request dump:
            ${JSON.stringify(data)}`);

        // Route requests
        let handler = path in server.router ? server.router[path] : handlers.notFound;

        if (path.indexOf("public/") > -1) {
            handler = handlers.public;
        }

        // let result  = await handler(data);

        handler(data).then((result) => {
            let payload = "";

            if (result.contentType) {
                res.setHeader("Content-Type", result.contentType);
                if (result.payload) {
                    payload = result.payload;
                }
            } else {
                res.setHeader("Content-Type", "application/json");
                payload = JSON.stringify(result.payload);
            }

            res.writeHead(result.status);
            res.end(payload);
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