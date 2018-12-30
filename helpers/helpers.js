const crypto   = require("crypto");
const util     = require("util");
const path     = require("path");
const fs       = require("fs");
const config   = require("../config");
const validate = require("./validate");

let helpers = {};

helpers.hash = function(str) {
    let hash = crypto.createHmac("sha256", config.hashingSecret).update(str).digest("hex");
    return hash;
};

helpers.parseJsonToObject = function(str) {
    try {
        let obj = JSON.parse(str);
        return obj;
    } catch (err) {
        return {};
    }
};

helpers.createRandomString = function(strLen) {
    if (strLen) {
        let possibleChars = "abcdefghijklmnopqrstuvwxyz0123456s789";
        let str           = "";

        for (let i = 1; i <= strLen; i++) {
            let randomChar = possibleChars.charAt(Math.floor(Math.random() * possibleChars.length));

            str += randomChar;
        }

        return str;
    } else {
        return false;
    }
};

// // Get the string content of a template, and use provided data for string interpolation
// helpers.getTemplate = function(templateName, data, callback) {
//     templateName =
//         typeof (templateName) == "string" && templateName.length > 0 ? templateName : false;
//     data = typeof (data) == "object" && data !== null ? data : {};
//     if (templateName) {
//         var templatesDir = path.join(__dirname, "/../templates/");
//         fs.readFile(templatesDir + templateName + ".html", "utf8", function(err, str) {
//             if (!err && str && str.length > 0) {
//                 // Do interpolation on the string
//                 var finalString = helpers.interpolate(str, data);
//                 callback(false, finalString);
//             } else {
//                 callback("No template could be found");
//             }
//         });
//     } else {
//         callback("A valid template name was not specified");
//     }
// };

// Get the string content of a template, and use provided data for string interpolation
helpers.getTemplate = async function(templateName, data) {
    templateName = validate.parameter(templateName, "string");
    data         = validate.parameter(data, "object");

    if (templateName) {
        let readFilep = util.promisify(fs.readFile);


        var templatesDir = path.join(__dirname, "/../templates/");
        let str          = await readFilep(templatesDir + templateName + ".html", "utf8");
        let             finalString = helpers.interpolate(str, data);

        return finalString;
    }
};

// Add the universal header and footer to a string, and pass provided data object to header and
// footer for interpolation
// helpers.addUniversalTemplates = function(str, data, callback) {
//     str  = typeof (str) == "string" && str.length > 0 ? str : "";
//     data = typeof (data) == "object" && data !== null ? data : {};
//     // Get the header
//     helpers.getTemplate("_header", data, function(err, headerString) {
//         if (!err && headerString) {
//             // Get the footer
//             helpers.getTemplate("_footer", data, function(err, footerString) {
//                 if (!err && headerString) {
//                     // Add them all together
//                     var fullString = headerString + str + footerString;
//                     callback(false, fullString);
//                 } else {
//                     callback("Could not find the footer template");
//                 }
//             });
//         } else {
//             callback("Could not find the header template");
//         }
//     });
// };

helpers.addUniversalTemplates = async function(str, data) {
    str  = validate.parameter(str, "string");
    data = validate.parameter(data, "object");

    // Get the header
    let headerString = await helpers.getTemplate("_header", data);
    // Get the footer
    let footerString = await helpers.getTemplate("_footer", data);
    // Add them all together
    var fullString = headerString + str + footerString;

    return fullString;
};


// Take a given string and data object, and find/replace all the keys within it
helpers.interpolate = function(str, data) {
    str  = typeof (str) == "string" && str.length > 0 ? str : "";
    data = typeof (data) == "object" && data !== null ? data : {};

    // Add the templateGlobals to the data object, prepending their key name with "global."
    for (var keyName in config.templateGlobals) {
        if (config.templateGlobals.hasOwnProperty(keyName)) {
            data["global." + keyName] = config.templateGlobals[keyName]
        }
    }
    // For each key in the data object, insert its value into the string at the corresponding
    // placeholder
    for (var key in data) {
        if (data.hasOwnProperty(key) && typeof (data[key] == "string")) {
            var replace = data[key];
            var find    = "{" + key + "}";
            str         = str.replace(find, replace);
        }
    }
    return str;
};

// Get the contents of a static (public) asset
helpers.getStaticAsset = function(fileName, callback) {
    fileName = typeof (fileName) == "string" && fileName.length > 0 ? fileName : false;
    if (fileName) {
        var publicDir = path.join(__dirname, "/../public/");
        fs.readFile(publicDir + fileName, function(err, data) {
            if (!err && data) {
                callback(false, data);
            } else {
                callback("No file could be found");
            }
        });
    } else {
        callback("A valid file name was not specified");
    }
};

helpers.getStaticAssetP = util.promisify(helpers.getStaticAsset);

module.exports = helpers;
