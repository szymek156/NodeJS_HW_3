const helpers = require("../../helpers/helpers");

let endpoint = {};

// Req param: email, tokenId
endpoint.get = async function(bytes) {
    // Prepare data for interpolation
    var templateData = {
        "head.title": "Pizzeria - Made Simple",
        "head.description":
            "We offer the only and ultimate type of food you need to keep you alive",
        "body.class": "sessionCreate"
    };


    let body = await helpers.getTemplate("sessionCreate", templateData);

    let str = await helpers.addUniversalTemplates(body, templateData);

    return {status: 200, payload: str, contentType: "text/html"};
};

module.exports = endpoint;