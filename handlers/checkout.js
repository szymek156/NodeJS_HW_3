const validate      = require("../helpers/validate");
const _data         = require("../helpers/data");
const config        = require("../config");
const StringDecoder = require("string_decoder").StringDecoder;
const querystring   = require("querystring");
const https         = require("https");

const CART_DB = config.CART_DB;
let checkout  = {};

// Posts current cart to payment and sends invoice
// Req param: email, tokenId
checkout.post = async function(bytes) {
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

        // Get cart
        let cart = await _data.read(CART_DB, token);

        let amount = cart.items.reduce((total, item) => total + item.price, 0);

        let order = {
            amount: amount * 100,  // Stripe expects amount in pence
            currency: "usd",
            description: "Order ID: " + token,
            source: "tok_visa"
        };

        let answerPayment = await checkout.placeOrder(order);



        // Send a mail with a receipt
        if (answerPayment.res.statusCode == 200) {
            let answerMail = await checkout.sendInvoice(JSON.parse(answerPayment.payload), email);

            console.log(answerMail.res.statusCode, answerMail.payload);

            return {status: answerMail.res.statusCode, payload: answerMail.payload};
        } else {
            return {status: answerPayment.res.statusCode, payload: answerPayment.payload};
        }
    } catch (err) {
        return {status: 400, payload: err};
    }
};

checkout.sendInvoice = async function(order, email) {
    // Let's pretend sending invoices in JSON format is common thing in this world
    let invoice = {
        amount: order.amount / 100,
        currency: order.currency,
        description: order.description,
        date: JSON.stringify(new Date(order.created).toLocaleDateString()),
        last4: order.source.last4,
        expDate: order.source.exp_month.toString() + "/" + order.source.exp_year.toString()
    };

    let payload = {
        from: `Mailgun Sandbox <postmaster@${config.sandboxDomain}>`,
        to: email,
        subject: `Your Invoice for ${order.description} is ready`,
        text: JSON.stringify(invoice)
    };

    let stringPayload = querystring.stringify(payload);

    let requestDetails = {
        "protocol": "https:",
        "hostname": "api.mailgun.net",
        "method": "POST",
        "path": `/v3/${config.sandboxDomain}/messages`,
        "auth": `api:${config.mailgunApiKey}`,
        "headers": {
            "Content-Length": Buffer.byteLength(stringPayload),
            "Content-Type": "application/x-www-form-urlencoded"
        }
    };

    return new Promise((resolve, reject) => {
        let req = https.request(requestDetails, function(res) {
            // Callback successfully if the request went through
            let decoder = new StringDecoder("utf-8");
            let buffer  = "";

            res.on("data", function(chunk) {
                buffer += decoder.write(chunk);
            });
            res.on("end", function() {
                buffer += decoder.end();
                resolve({res: res, payload: buffer});
            });
        });

        // Bind to the error event so it doesn't get thrown
        req.on("error", function(e) {
            reject(e);
        });

        // Add the payload
        req.write(stringPayload);

        // End the request
        req.end();
    });
};


checkout.placeOrder = async function(order) {
    let stringPayload = querystring.stringify(order);

    let requestDetails = {
        "protocol": "https:",
        "hostname": "api.stripe.com",
        "method": "POST",
        "path": "/v1/charges",
        "auth": "sk_test_4eC39HqLyjWDarjtT1zdp7dc",
        "headers": {
            "Content-Length": Buffer.byteLength(stringPayload),
            "User-Agent": "node",
            "Accept": "*/*",
            "Content-Type": "application/x-www-form-urlencoded"
        }
    };

    return new Promise((resolve, reject) => {
        let req = https.request(requestDetails, function(res) {
            // Callback successfully if the request went through
            let decoder = new StringDecoder("utf-8");
            let buffer  = "";

            res.on("data", function(chunk) {
                buffer += decoder.write(chunk);
            });
            res.on("end", function() {
                buffer += decoder.end();
                resolve({res: res, payload: buffer});
            });
        });

        // Bind to the error event so it doesn't get thrown
        req.on("error", function(e) {
            reject(e);
        });

        // Add the payload
        req.write(stringPayload);

        // End the request
        req.end();
    });
};


module.exports = checkout;