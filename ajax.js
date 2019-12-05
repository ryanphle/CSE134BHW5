let base = "http://fa19server.appspot.com/api";

function createPayloadURI(values) {
    let ret = "";
    for (var key in values) {
        ret += key + "=" + encodeURIComponent(values[key]) + "&";
    }
    return ret;
}

function sendRequest(method, endpoint, headers, payload, callback) {
    let xhttp = new XMLHttpRequest();  
    
    xhttp.onreadystatechange = function() {
        if (this.readyState == XMLHttpRequest.DONE) {
            callback(this.status, this.response);
        }
    }
    
    xhttp.open(method, base+endpoint);
    // Set request headers for content type
    for (var key in headers) {
        xhttp.setRequestHeader(key, headers[key]);
    }

    let body;
    // Create payload if needed
    if (payload) {
        body = createPayloadURI(payload);
    }

    xhttp.send(body);
}