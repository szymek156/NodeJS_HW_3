const _api_users    = require("./api/users");
const _api_tokens   = require("./api/tokens");
const _api_menu     = require("./api/menu");
const _api_carts    = require("./api/carts");
const _api_checkout = require("./api/checkout");

const _account_create = require("./account/create");

const _session_create = require("./session/create");

const _carts_create = require("./cart/create");
const _carts_edit   = require("./cart/edit");

const helpers = require("../helpers/helpers");

let handlers     = {};
handlers.api     = {};
handlers.account = {};
handlers.session = {};
handlers.cart    = {};

handlers.handleRequest = async function(data, endpoint) {
    let method = data.method;

    if (method in endpoint) {
        try {
            return await endpoint[method](data);
        } catch (err) {
            console.log(`err is: ${err}`);
            return await handlers.badRequest();
        }
    } else {
        return await handlers.badRequest();
    }
};

handlers.api.users = async function(data) {
    return await handlers.handleRequest(data, _api_users);
};

handlers.api.tokens = async function(data) {
    return await handlers.handleRequest(data, _api_tokens);
};

handlers.api.menu = async function(data) {
    return await handlers.handleRequest(data, _api_menu);
};

handlers.api.carts = async function(data) {
    return await handlers.handleRequest(data, _api_carts);
};

handlers.api.checkout = async function(data) {
    return await handlers.handleRequest(data, _api_checkout);
};

handlers.account.create = async function(data) {
    return await handlers.handleRequest(data, _account_create);
};

handlers.session.create = async function(data) {
    return await handlers.handleRequest(data, _session_create);
};

handlers.cart.create = async function(data) {
    return await handlers.handleRequest(data, _carts_create);
};

handlers.cart.edit = async function(data) {
    return await handlers.handleRequest(data, _carts_edit);
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