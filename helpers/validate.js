const _data  = require("./data");
const config = require("../config");

let TOKEN_DB = config.TOKEN_DB;
let validate = {};

validate.parameter = function(parameter, type, possibleValues = [], instance = undefined) {
    if (typeof (parameter) !== type) {
        return false;
    }

    if (typeof (parameter) === "string") {
        parameter = parameter.trim();
        if (parameter.length == 0) {
            return false;
        }
    }

    if (possibleValues.length > 0) {
        if (possibleValues.indexOf(parameter) == -1) {
            return false;
        }
    }

    if (instance && !parameter instanceof instance) {
        return false;
    }

    return parameter;
};

// Verify if a given token id is
// currently valid for a given user
validate.token = async function(id, email) {
    // Lookup the token
    let token = await _data.read(TOKEN_DB, id);

    return token.email === email && token.expires > Date.now();
};


module.exports = validate;