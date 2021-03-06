/*
 * Frontend Logic for application
 *
 */

// Container for frontend application
var app = {};

// Config
app.config = {
    "sessionToken": false
};

// AJAX Client (for RESTful API)
app.client = {};

// Interface for making API calls
app.client.request = function(headers, path, method, queryStringObject, payload, callback) {
    // Set defaults
    headers = typeof (headers) == "object" && headers !== null ? headers : {};
    path    = typeof (path) == "string" ? path : "/";
    method  = typeof (method) == "string" &&
                     ["POST", "GET", "PUT", "DELETE"].indexOf(method.toUpperCase()) > -1 ?
                 method.toUpperCase() :
                 "GET";
    queryStringObject = typeof (queryStringObject) == "object" && queryStringObject !== null ?
                            queryStringObject :
                            {};
    payload  = typeof (payload) == "object" && payload !== null ? payload : {};
    callback = typeof (callback) == "function" ? callback : false;

    // For each query string parameter sent, add it to the path
    var requestUrl = path + "?";
    var counter    = 0;



    for (var queryKey in queryStringObject) {
        if (queryStringObject.hasOwnProperty(queryKey)) {
            counter++;
            // If at least one query string parameter has already been added, preprend new ones with
            // an ampersand
            if (counter > 1) {
                requestUrl += "&";
            }
            // Add the key and value
            requestUrl += queryKey + "=" + queryStringObject[queryKey];
        }
    }

    // Form the http request as a JSON type
    var xhr = new XMLHttpRequest();
    xhr.open(method, requestUrl, true);
    xhr.setRequestHeader("Content-type", "application/json");

    // For each header sent, add it to the request
    for (var headerKey in headers) {
        if (headers.hasOwnProperty(headerKey)) {
            xhr.setRequestHeader(headerKey, headers[headerKey]);
        }
    }

    // If there is a current session token set, add that as a header
    if (app.config.sessionToken) {
        xhr.setRequestHeader("token", app.config.sessionToken.id);
    }

    // When the request comes back, handle the response
    xhr.onreadystatechange =
        function() {
        if (xhr.readyState == XMLHttpRequest.DONE) {
            var statusCode       = xhr.status;
            var responseReturned = xhr.responseText;

            // Callback if requested
            if (callback) {
                try {
                    var parsedResponse = JSON.parse(responseReturned);
                    callback(statusCode, parsedResponse);
                } catch (e) {
                    callback(statusCode, false);
                }
            }
        }
    }

    // Send the payload as JSON
    var payloadString = JSON.stringify(payload);
    xhr.send(payloadString);
};

// Bind the logout button
app.bindLogoutButton = function() {
    document.getElementById("logoutButton").addEventListener("click", function(e) {
        // Stop it from redirecting anywhere
        e.preventDefault();

        // Log the user out
        app.logUserOut();
    });
};

// Log the user out then redirect them
app.logUserOut = function(redirectUser) {
    // Set redirectUser to default to true
    redirectUser = typeof (redirectUser) == "boolean" ? redirectUser : true;

    // Get the current token id
    var tokenId =
        typeof (app.config.sessionToken.id) == "string" ? app.config.sessionToken.id : false;

    // Send the current token to the tokens endpoint to delete it
    var queryStringObject = {"id": tokenId};
    app.client.request(undefined, "api/tokens", "DELETE", queryStringObject, undefined,
                       function(statusCode, responsePayload) {
                           // Set the app.config token as false
                           app.setSessionToken(false);

                           // Send the user to the logged out page
                           if (redirectUser) {
                               window.location = "/session/deleted";
                           }
                       });
};

// Bind the forms
app.bindForms = function() {
    if (document.querySelector("form")) {
        var allForms = document.querySelectorAll("form");
        for (var i = 0; i < allForms.length; i++) {
            allForms[i].addEventListener("submit", function(e) {
                // Stop it from submitting
                e.preventDefault();
                var formId = this.id;
                var path   = this.action;
                var method = this.method.toUpperCase();

                // Hide the error message (if it's currently shown due to a previous error)
                document.querySelector("#" + formId + " .formError").style.display = "none";

                // Hide the success message (if it's currently shown due to a previous error)
                if (document.querySelector("#" + formId + " .formSuccess")) {
                    document.querySelector("#" + formId + " .formSuccess").style.display = "none";
                }


                // Turn the inputs into a payload
                var payload  = {};
                var elements = this.elements;
                for (var i = 0; i < elements.length; i++) {
                    if (elements[i].type !== "submit") {
                        // Determine class of element and set value accordingly
                        var classOfElement = typeof (elements[i].classList.value) == "string" &&
                                                     elements[i].classList.value.length > 0 ?
                                                 elements[i].classList.value :
                                                 "";
                        var valueOfElement = elements[i].type == "checkbox" &&
                                                     classOfElement.indexOf("multiselect") == -1 ?
                                                 elements[i].checked :
                                                 classOfElement.indexOf("intval") == -1 ?
                                                 elements[i].value :
                                                 parseInt(elements[i].value);
                        var elementIsChecked = elements[i].checked;
                        // Override the method of the form if the input's name is _method
                        var nameOfElement = elements[i].name;
                        if (nameOfElement == "_method") {
                            method = valueOfElement;
                        } else {
                            // Create an payload field named "method" if the elements name is
                            // actually httpmethod
                            if (nameOfElement == "httpmethod") {
                                nameOfElement = "method";
                            }
                            // Create an payload field named "id" if the elements name is actually
                            // uid
                            if (nameOfElement == "uid") {
                                nameOfElement = "id";
                            }
                            // If the element has the class "multiselect" add its value(s) as array
                            // elements
                            if (classOfElement.indexOf("multiselect") > -1) {
                                if (elementIsChecked) {
                                    payload[nameOfElement] =
                                        typeof (payload[nameOfElement]) == "object" &&
                                                payload[nameOfElement] instanceof Array ?
                                            payload[nameOfElement] :
                                            [];
                                    payload[nameOfElement].push(valueOfElement);
                                }
                            } else {
                                payload[nameOfElement] = valueOfElement;
                            }
                        }
                    }
                }


                // If the method is DELETE, the payload should be a queryStringObject instead
                var queryStringObject = method == "DELETE" ? payload : {};

                // Call the API
                app.client.request(
                    undefined, path, method, queryStringObject, payload,
                    function(statusCode, responsePayload) {
                        // Display an error on the form if needed
                        if (statusCode !== 200) {
                            if (statusCode == 403) {
                                // log the user out
                                app.logUserOut();

                            } else {
                                // Try to get the error from the api, or set a default error message
                                var error = typeof (responsePayload.Error) == "string" ?
                                                responsePayload.Error :
                                                "An error has occured, please try again";

                                // Set the formError field with the error text
                                document.querySelector("#" + formId + " .formError").innerHTML =
                                    error;

                                // Show (unhide) the form error field on the form
                                document.querySelector("#" + formId + " .formError").style.display =
                                    "block";
                            }
                        } else {
                            // If successful, send to form response processor
                            app.formResponseProcessor(formId, payload, responsePayload);
                        }
                    });
            });
        }
    }
};

// Form response processor
app.formResponseProcessor = function(formId, requestPayload, responsePayload) {
    var functionToCall = false;
    // If account creation was successful, try to immediately log the user in
    if (formId == "accountCreate") {
        // Take the email  and password, and use it to log the user in
        var newPayload = {"email": requestPayload.email, "password": requestPayload.password};

        app.client.request(
            undefined, "api/tokens", "POST", undefined, newPayload,
            function(newStatusCode, newResponsePayload) {
                // Display an error on the form if needed
                if (newStatusCode !== 200) {
                    // Set the formError field with the error text
                    document.querySelector("#" + formId + " .formError").innerHTML =
                        "Sorry, an error has occured. Please try again.";

                    // Show (unhide) the form error field on the form
                    document.querySelector("#" + formId + " .formError").style.display = "block";

                } else {
                    // If successful, set the token and redirect the user
                    app.setSessionToken(newResponsePayload);
                    window.location = "/cart/show";
                }
            });
    }
    // If login was successful, set the token in localstorage and redirect the user
    if (formId == "sessionCreate") {
        app.setSessionToken(responsePayload);
        window.location = "/cart/show";
    }

    // If forms saved successfully and they have success messages, show them
    var formsWithSuccessMessages = ["accountEdit1", "accountEdit2", "checksEdit1"];
    if (formsWithSuccessMessages.indexOf(formId) > -1) {
        document.querySelector("#" + formId + " .formSuccess").style.display = "block";
    }

    // If the user just deleted their account, redirect them to the account-delete page
    if (formId == "accountEdit3") {
        app.logUserOut(false);
        window.location = "/account/deleted";
    }

    // If the user just created a new check successfully, redirect back to the dashboard
    if (formId == "checksCreate") {
        window.location = "/cart/show";
    }

    // If the user just deleted a check, redirect them to the dashboard
    if (formId == "checksEdit2") {
        window.location = "/cart/show";
    }
};

// Get the session token from localstorage and set it in the app.config object
app.getSessionToken = function() {
    var tokenString = localStorage.getItem("token");
    if (typeof (tokenString) == "string") {
        try {
            var token               = JSON.parse(tokenString);
            app.config.sessionToken = token;
            if (typeof (token) == "object") {
                app.setLoggedInClass(true);
            } else {
                app.setLoggedInClass(false);
            }
        } catch (e) {
            app.config.sessionToken = false;
            app.setLoggedInClass(false);
        }
    }
};

// Set (or remove) the loggedIn class from the body
app.setLoggedInClass = function(add) {
    var target = document.querySelector("body");
    if (add) {
        target.classList.add("loggedIn");
    } else {
        target.classList.remove("loggedIn");
    }
};

// Set the session token in the app.config object as well as localstorage
app.setSessionToken = function(token) {
    app.config.sessionToken = token;
    var tokenString         = JSON.stringify(token);
    localStorage.setItem("token", tokenString);
    if (typeof (token) == "object") {
        app.setLoggedInClass(true);
    } else {
        app.setLoggedInClass(false);
    }
};

// Renew the token
app.renewToken = function(callback) {
    var currentToken =
        typeof (app.config.sessionToken) == "object" ? app.config.sessionToken : false;
    if (currentToken) {
        // Update the token with a new expiration
        var payload = {
            "id": currentToken.id,
            "extend": true,
        };
        app.client.request(undefined, "api/tokens", "PUT", undefined, payload,
                           function(statusCode, responsePayload) {
                               // Display an error on the form if needed
                               if (statusCode == 200) {
                                   // Get the new token details
                                   var queryStringObject = {"id": currentToken.id};
                                   app.client.request(undefined, "api/tokens", "GET",
                                                      queryStringObject, undefined,
                                                      function(statusCode, responsePayload) {
                                                          // Display an error on the form if needed
                                                          if (statusCode == 200) {
                                                              app.setSessionToken(responsePayload);
                                                              callback(false);
                                                          } else {
                                                              app.setSessionToken(false);
                                                              callback(true);
                                                          }
                                                      });
                               } else {
                                   app.setSessionToken(false);
                                   callback(true);
                               }
                           });
    } else {
        app.setSessionToken(false);
        callback(true);
    }
};

// Load data on the page
app.loadDataOnPage = function() {
    // Get the current page from the body class
    var bodyClasses  = document.querySelector("body").classList;
    var primaryClass = typeof (bodyClasses[0]) == "string" ? bodyClasses[0] : false;

    // Logic for account settings page
    if (primaryClass == "accountEdit") {
        app.loadAccountEditPage();
    }

    // Logic for dashboard page
    if (primaryClass == "cartCreate") {
        app.loadCartCreatePage();
    }

    // Logic for check details page
    if (primaryClass == "checksEdit") {
        app.loadChecksEditPage();
    }

    if (primaryClass == "cartEdit") {
        app.loadCartEditPage();
    }
};

// Load the account edit page specifically
app.loadAccountEditPage = function() {
    // Get the email from the current token, or log the user out if none is there
    var email =
        typeof (app.config.sessionToken.email) == "string" ? app.config.sessionToken.email : false;
    if (email) {
        // Fetch the user data
        var queryStringObject = {"email": email};
        app.client.request(
            undefined, "api/users", "GET", queryStringObject, undefined,
            function(statusCode, responsePayload) {
                if (statusCode == 200) {
                    // Put the data into the forms as values where needed
                    document.querySelector("#accountEdit1 .firstNameInput").value =
                        responsePayload.firstName;
                    document.querySelector("#accountEdit1 .lastNameInput").value =
                        responsePayload.lastName;
                    document.querySelector("#accountEdit1 .displayPhoneInput").value =
                        responsePayload.email;

                    // Put the hidden phone field into both forms
                    var hiddenPhoneInputs =
                        document.querySelectorAll("input.hiddenPhoneNumberInput");
                    for (var i = 0; i < hiddenPhoneInputs.length; i++) {
                        hiddenPhoneInputs[i].value = responsePayload.email;
                    }

                } else {
                    // If the request comes back as something other than 200, log the user our (on
                    // the assumption that the api is temporarily down or the users token is bad)
                    app.logUserOut();
                }
            });
    } else {
        app.logUserOut();
    }
};

// Load the dashboard page specifically
app.loadCartCreatePage = function() {
    // Get the email from the current token, or log the user out if none is there
    var email =
        typeof (app.config.sessionToken.email) == "string" ? app.config.sessionToken.email : false;
    if (email) {
        // Fetch the user data
        var query = {"email": email};
        app.client.request(
            undefined, "api/cart", "GET", query, undefined, function(statusCode, responsePayload) {
                if (statusCode == 200) {
                    // Determine how many meals the user has
                    var meals = typeof (responsePayload.items) == "object" &&
                                        responsePayload.items instanceof Array &&
                                        responsePayload.items.length > 0 ?
                                    responsePayload.items :
                                    [];

                    var table = document.getElementById("mealsListTable");

                    // while (table.rows.length > 1) {
                    //     if (table.rows[1].id === "noChecksMessage") {
                    //         break;
                    //     }
                    //     table.deleteRow(table.rows.length - 1);
                    // }

                    if (meals.length > 0) {
                        meals.forEach(function(meal) {
                            console.log(`DEBUG: meal ${meal}`);

                            let tr = table.insertRow(-1);
                            tr.classList.add("checkRow");
                            var meal_td   = tr.insertCell(0);
                            var desc_td   = tr.insertCell(1);
                            var price_td  = tr.insertCell(2);
                            var remove_td = tr.insertCell(3);

                            meal_td.innerHTML  = meal.name;
                            desc_td.innerHTML  = meal.description;
                            price_td.innerHTML = meal.price;

                            remove_td.innerHTML = `<button type=" button ">Remove</button>`;

                            remove_td.addEventListener("click", function(event) {
                                console.log(`DEBUG: clicked ${JSON.stringify(meal)}`);
                                app.removeFromCart(meal, function(count) {
                                    let idx = 0;

                                    for (idx = 0; idx < table.rows.length; idx++) {
                                        if (table.rows[idx].cells[0].innerHTML === meal.name) {
                                            break;
                                        }
                                    }

                                    console.log("DEBUG idx to removal is ", idx);

                                    table.deleteRow(idx);

                                    // Show add meal
                                    document.getElementById("createCheckCTA").style.display =
                                        "block";

                                    if (count === 0) {
                                        // Show 'you have no checks' message
                                        document.getElementById("noChecksMessage").style.display =
                                            "table-row";

                                        // Show the createCheck CTA
                                        document.getElementById("createCheckCTA").style.display =
                                            "block";
                                    }
                                });
                                // app.loadCartCreatePage();
                            });
                        });

                        // Show add meal
                        document.getElementById("createCheckCTA").style.display = "block";

                    } else {
                        // Show 'you have no checks' message
                        document.getElementById("noChecksMessage").style.display = "table-row";

                        // Show the createCheck CTA
                        document.getElementById("createCheckCTA").style.display = "block";
                    }
                } else {
                    var payload = {
                        "email": email,
                    };

                    app.client.request(undefined, "api/cart", "POST", undefined, payload,
                                       function(statusCode, responsePayload) {
                                           console.log("DEBUG: creating cart finished ",
                                                       statusCode);
                                       });
                }
            });
    } else {
        app.logUserOut();
    }
};


// Load the dashboard page specifically
app.loadCartEditPage = function() {
    var currentToken =
        typeof (app.config.sessionToken) == "object" ? app.config.sessionToken : false;

    if (currentToken) {
        var queryStringObject = {email: currentToken.email};
        app.client.request(
            undefined, "api/menu", "GET", queryStringObject, undefined,
            function(statusCode, responsePayload) {
                console.log("DEBUG: get menu: ", statusCode);

                if (statusCode == 200) {
                    var menu = typeof (responsePayload) == "object" ? responsePayload : {};


                    var table = document.getElementById("menuListTablePizza");

                    menu.pizzas.forEach(function(meal) {
                        var tr = table.insertRow(-1);
                        tr.classList.add("checkRow");
                        var meal_td  = tr.insertCell(0);
                        var desc_td  = tr.insertCell(1);
                        var price_td = tr.insertCell(2);
                        var cart_td  = tr.insertCell(3);

                        meal_td.innerHTML  = meal.name;
                        desc_td.innerHTML  = meal.description;
                        price_td.innerHTML = meal.price;
                        cart_td.innerHTML  = `<button type=" button ">Eat Me!</button>`;

                        cart_td.addEventListener("click", function(event) {
                            console.log(`DEBUG: clicked ${JSON.stringify(meal)}`);
                            app.addToCart(meal);
                        });
                    });

                    var table = document.getElementById("menuListTableSalads");

                    menu.salads.forEach(function(meal) {
                        var tr = table.insertRow(-1);
                        tr.classList.add("checkRow");
                        var meal_td  = tr.insertCell(0);
                        var desc_td  = tr.insertCell(1);
                        var price_td = tr.insertCell(2);
                        var cart_td  = tr.insertCell(3);

                        meal_td.innerHTML  = meal.name;
                        desc_td.innerHTML  = meal.description;
                        price_td.innerHTML = meal.price;
                        cart_td.innerHTML  = `<button type=" button ">Eat Me!</button>`;

                        cart_td.addEventListener("click", function(event) {
                            console.log(`DEBUG: clicked ${JSON.stringify(meal)}`);
                            app.addToCart(meal);
                        });
                    });


                    // Show add meal
                    document.getElementById("createCheckCTA").style.display = "block";
                }
            });

    } else {
        app.logUserOut();
    }
};

app.getCart = function(callback) {
    var email =
        typeof (app.config.sessionToken.email) == "string" ? app.config.sessionToken.email : false;
    if (email) {
        // Fetch the user data
        var query = {"email": email};
        app.client.request(undefined, "api/cart", "GET", query, undefined,
                           function(statusCode, responsePayload) {
                               if (statusCode == 200) {
                                   callback(responsePayload);
                               }
                           });
    }
};

app.addToCart = function(meal) {
    app.getCart(function(cart) {
        cart.items.push(meal);

        var currentToken =
            typeof (app.config.sessionToken) == "object" ? app.config.sessionToken : false;

        if (currentToken) {
            // Update the token with a new expiration
            var payload = {
                "email": currentToken.email,
                "cart": cart,
            };

            app.client.request(undefined, "api/cart", "PUT", undefined, payload,
                               function(statusCode, responsePayload) {
                                   console.log("DEBUG: add to card finished with status ",
                                               statusCode);
                                   if (statusCode == 200) {
                                   } else {
                                       app.setSessionToken(false);
                                       callback(true);
                                   }
                               });
        } else {
            app.setSessionToken(false);
        }
    });
};

app.removeFromCart = async function(meal, callback) {
    app.getCart(function(cart) {
        let idx = cart.items.findIndex(function(element) {
            return (element.name === meal.name);
        });

        cart.items.splice(idx, 1);

        var currentToken =
            typeof (app.config.sessionToken) == "object" ? app.config.sessionToken : false;

        if (currentToken) {
            // Update the token with a new expiration
            var payload = {
                "email": currentToken.email,
                "cart": cart,
            };

            app.client.request(undefined, "api/cart", "PUT", undefined, payload,
                               function(statusCode, responsePayload) {
                                   console.log("DEBUG: add to card finished with status ",
                                               statusCode);
                                   if (statusCode == 200) {
                                       callback(cart.items.length);
                                       // var table = document.getElementById("mealsListTable");
                                       // if (table.rows.length > 1) {
                                       //     table.deleteRow(idx + 1);
                                       // }


                                       // if (table.rows.length == 0) {
                                       //     document.getElementById("noChecksMessage").style.display
                                       //     = "table-row";

                                       //     // Show the createCheck CTA
                                       //     document.getElementById("createCheckCTA").style.display
                                       //     = "block";
                                       // }
                                   } else {
                                       app.setSessionToken(false);
                                   }
                               });
        } else {
            app.setSessionToken(false);
        }
    });
};


// Load the checks edit page specifically
app.loadChecksEditPage = function() {
    // Get the check id from the query string, if none is found then redirect back to dashboard
    var id = typeof (window.location.href.split("=")[1]) == "string" &&
                     window.location.href.split("=")[1].length > 0 ?
                 window.location.href.split("=")[1] :
                 false;
    if (id) {
        // Fetch the check data
        var queryStringObject = {"id": id};
        app.client.request(
            undefined, "api/checks", "GET", queryStringObject, undefined,
            function(statusCode, responsePayload) {
                if (statusCode == 200) {
                    // Put the hidden id field into both forms
                    var hiddenIdInputs = document.querySelectorAll("input.hiddenIdInput");
                    for (var i = 0; i < hiddenIdInputs.length; i++) {
                        hiddenIdInputs[i].value = responsePayload.id;
                    }

                    // Put the data into the top form as values where needed
                    document.querySelector("#checksEdit1 .displayIdInput").value =
                        responsePayload.id;
                    document.querySelector("#checksEdit1 .displayStateInput").value =
                        responsePayload.state;
                    document.querySelector("#checksEdit1 .protocolInput").value =
                        responsePayload.protocol;
                    document.querySelector("#checksEdit1 .urlInput").value = responsePayload.url;
                    document.querySelector("#checksEdit1 .methodInput").value =
                        responsePayload.method;
                    document.querySelector("#checksEdit1 .timeoutInput").value =
                        responsePayload.timeoutSeconds;
                    var successCodeCheckboxes =
                        document.querySelectorAll("#checksEdit1 input.successCodesInput");
                    for (var i = 0; i < successCodeCheckboxes.length; i++) {
                        if (responsePayload.successCodes.indexOf(
                                parseInt(successCodeCheckboxes[i].value)) > -1) {
                            successCodeCheckboxes[i].checked = true;
                        }
                    }
                } else {
                    // If the request comes back as something other than 200, redirect back to
                    // dashboard
                    window.location = "/cart/show";
                }
            });
    } else {
        window.location = "/cart/show";
    }
};

// Loop to renew token often
app.tokenRenewalLoop = function() {
    setInterval(function() {
        app.renewToken(function(err) {
            if (!err) {
                console.log("Token renewed successfully @ " + Date.now());
            }
        });
    }, 1000 * 60);
};

// Init (bootstrapping)
app.init = function() {
    // Bind all form submissions
    app.bindForms();

    // Bind logout logout button
    app.bindLogoutButton();

    // Get the token from localstorage
    app.getSessionToken();

    // Renew token
    app.tokenRenewalLoop();

    // Load data on page
    app.loadDataOnPage();
};

// Call the init processes after the window loads
window.onload = function() {
    app.init();
};
