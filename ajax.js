let base = "http://fa19server.appspot.com/api";

function createPayloadURI(values) {
    let ret = "";
    for (var key in values) {
        let val = DOMPurify.sanitize(values[key]);
        if ((key == "comment" && !val.substring(1,val.length)) || !val) {
            val += "No " + key;
        }
        ret += key + "=" + encodeURIComponent(val) + "&";
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