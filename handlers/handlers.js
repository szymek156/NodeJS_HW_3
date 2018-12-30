const _users    = require("./users");
const _tokens   = require("./tokens");
const _menu     = require("./menu");
const _carts    = require("./carts");
const _checkout = require("./checkout");

let handlers = {};

handlers.users = async function(data) {
    let method = data.method;

    if (method in _users) {
        return await _users[method](data);
    } else {
        return await handlers.badRequest();
    }
};

handlers.tokens = async function(data) {
    let method = data.method;

    if (method in _tokens) {
        return await _tokens[method](data);
    } else {
        return await handlers.badRequest();
    }
};

handlers.menu = async function(data) {
    let method = data.method;

    if (method in _menu) {
        return await _menu[method](data);
    } else {
        return await handlers.badRequest();
    }
};

handlers.carts = async function(data) {
    let method = data.method;

    if (method in _carts) {
        return await _carts[method](data);
    } else {
        return await handlers.badRequest();
    }
};

handlers.checkout = async function(data) {
    let method = data.method;

    if (method in _checkout) {
        return await _checkout[method](data);
    } else {
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