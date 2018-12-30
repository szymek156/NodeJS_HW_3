const validate = require("../helpers/validate");
const _data    = require("../helpers/data");
const config   = require("../config");

const MENU_DB = config.MENU_DB;
let menu      = {};

// Returns menu, only for logged users
// Req param: email, tokenId
menu.get = async function(bytes) {
    let obj   = JSON.parse(bytes.payload);
    let email = validate.parameter(obj.email, "string");
    let token = validate.parameter(bytes.headers.token, "string");

    if (!email && !token) {
        return {status: 400, payload: "Incorect parameters"};
    }

    try {
        if (!await validate.token(token, email)) {
            return {status: 400, payload: "Invalid token"};
        }

        let menu = await _data.read(MENU_DB, "menu");
        return {status: 200, payload: menu};

    } catch (err) {
        return {status: 400, payload: err};
    }
};


module.exports = menu;