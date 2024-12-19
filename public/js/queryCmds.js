//=====================================================================================
// FETCH METHOD
// This function uses the fetch API to make a request to the server.
//=====================================================================================

function fetchMethod(url, callback, method = "GET", data = null, token = null) {
    // url is the url to which the HTTP request should be made to
    // callback will be executed when the response is received from the server

    console.log("fetchMethod: ", url, method, data, token); // logs the params to the console so that u can see it

    const headers = {}; // init headers to an empty obj to set the headers of the req

    if (data) { // if data is provided
      headers["Content-Type"] = "application/json"; // indicates that the request body contains json data
    }

    if (token) { // if token is provided
      headers["Authorization"] = "Bearer " + token; // set the authorisation header to include the token in the req
    }

    let options = { // this will be passed to the fetch() function 
      method: method.toUpperCase(), // sets the method property to the uppercase version of the method parameter 
      // (ensures that the method is always in uppercase regardless of the provided input)
      headers: headers,
    };

    if (method.toUpperCase() !== "GET" && data !== null) { // if the http method is not GET and data is not null (meaning its a method that may have a req body)
      options.body = JSON.stringify(data); // add a new property called body to the options obj with the stringified data
      // impt for methods like POST and PUT
    }

    // making the fetch req
    fetch(url, options)
      .then((response) => { // returns a promise that resolves to the response from the server
        if (response.status == 204) { // if the response is 204 no content -> successful req without any data to return
          callback(response.status, {}); // callback function is called with status 204 and an empty obj is returned for the response body
        } else { // if the status is not 204, it means there is content in the response body
          response.json().then((responseData) => callback(response.status, responseData)); 
          // response.json is called to convert the response body to json
          // when the conversion is done, the callback function is called with the response status and the converted responseData
        }
      })
      .catch((error) => console.error(`Error from ${method} ${url}:`, error)); // if an error occurs during the req, an error message is logged to the console
}