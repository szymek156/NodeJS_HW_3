const _users    = require("./api/users");
const _tokens   = require("./api/tokens");
const _menu     = require("./api/menu");
const _carts    = require("./api/carts");
const _checkout = require("./api/checkout");

const helpers = require("../helpers/helpers");

let handlers     = {};
handlers.api     = {};
handlers.account = {};
handlers.session = {};
handlers.cart    = {};

handlers.api.users = async function(data) {
    let method = data.method;

    if (method in _users) {
        return await _users[method](data);
    } else {
        return await handlers.badRequest();
    }
};

handlers.api.tokens = async function(data) {
    let method = data.method;

    if (method in _tokens) {
        return await _tokens[method](data);
    } else {
        return await handlers.badRequest();
    }
};

handlers.api.menu = async function(data) {
    let method = data.method;

    if (method in _menu) {
        return await _menu[method](data);
    } else {
        return await handlers.badRequest();
    }
};

handlers.api.carts = async function(data) {
    let method = data.method;

    if (method in _carts) {
        return await _carts[method](data);
    } else {
        return await handlers.badRequest();
    }
};

handlers.api.checkout = async function(data) {
    let method = data.method;

    if (method in _checkout) {
        return await _checkout[method](data);
    } else {
        return await handlers.badRequest();
    }
};

handlers.index = async function(data) {
    if (data.method !== "get") return await handlers.badRequest();

    // Prepare data for interpolation
    var templateData = {
        "head.title": "Pizzeria - Made Simple",
        "head.description":
            "We offer the only and ultimate type of food you need to keep you alive",
        "body.class": "index"
    };

    try {
        let body = await helpers.getTemplate("index", templateData);

        let str = await helpers.addUniversalTemplates(body, templateData);

        return {
            status: 200, payload: str, contentType: "text/html"
        }
    } catch (err) {
        console.log(`err is: ${err}`);
        return await handlers.badRequest();
    }
};

handlers.favicon = async function(data) {
    if (data.method !== "get") return await handlers.badRequest();

    try {
        let data = await helpers.getStaticAssetP("favicon.ico");
        return {
            status: 200, payload: data, contentType: "image/x-icon"
        }

    } catch (err) {
        console.log(`err is: ${err}`);
        return await handlers.badRequest();
    }
};

handlers.public = async function(data) {
    if (data.method !== "get") return await handlers.badRequest();

    var trimmedAssetName = data.endpoint.replace("public/", "").trim();

    try {
        let asset = await helpers.getStaticAssetP(trimmedAssetName);

        var contentType = "text/plain";

        if (trimmedAssetName.indexOf(".css") > -1) {
            contentType = "text/css";
        }

        if (trimmedAssetName.indexOf(".png") > -1) {
            contentType = "image/png";
        }

        if (trimmedAssetName.indexOf(".jpg") > -1) {
            contentType = "image/jpg";
        }

        if (trimmedAssetName.indexOf(".ico") > -1) {
            contentType = "image/x-icon";
        }


        return {
            status: 200, payload: asset, contentType: contentType
        }
    } catch (err) {
        console.log(`err is: ${err}`);
        return await handlers.badRequest();
    }
};

handlers.notFound = async function() {
    return {status: 404, payload: "Not found"};
};
handlers.badRequest = async function() {
    return {status: 400, payload: "Bad request"};
};

handlers.echo = async function() {
    console.log("ECHO!!!");
    return {status: 200, payload: "echo!"};
};


module.exports = handlers;