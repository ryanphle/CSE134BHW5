let method = "POST";

/* CALLBACK FUNCTIONS */

let loginCallback = (status, response) => {
    loginBtn.removeAttribute("disabled");
    logoutBtn.removeAttribute("disabled");
    if (status == 200) {
        console.log("logged in!");
        let r = JSON.parse(response);
        redirectToIndex();
        // Store the token and userId into localStorage
        window.localStorage.setItem("access_token", r["id"]);
        window.localStorage.setItem("userId", r["userId"]);
    }
    else {
        console.log(status, response);
    }
}

let createUserCallback = (status, response) => {
    let successMsg = document.getElementById("successMsg");
    if (status == 200) {
        successMsg.setAttribute("style", "color:green; display:block;");
        console.log("user created!");
        setTimeout(() => {redirectToLogin()}, 400);
    }
}

let logoutCallback = (status, response) => {
    loginBtn.removeAttribute("disabled");
    logoutBtn.removeAttribute("disabled");
    if (status == 204) {
        console.log("logged out!");
        // Clears local storage
        redirectToLogin();
        window.localStorage.setItem("access_token", "");
        window.localStorage.setItem("userId", "");
    }
    else {
        console.log(status, response);
    }
}

/*
    Checks if the user is logged in and redirects to login page if not.
    Params: None
    Return: None
*/
function indexLoginCheck() {
    let callback = (status, response) => {
        // Redirects to login if ttl expires
        if (status == 401) 
            redirectToLogin();
    }

    loggedIn(callback);
}

function loginPageCheck() {
    let callback = (status, response) => {
        if (status != 401)
            redirectToIndex();
    }
    loggedIn(callback);
}

/*
    Checks if logged in by making request and calls the callback function
    Param: 
        - callback: callback function to handle the result of whether or not it's  
    Return: true or false of whether or not it's logged in
*/
function loggedIn(callback) {
    let endpoint = "/wishlists/myWishlist?access_token=" + window.localStorage.getItem("access_token");
    sendRequest("GET", endpoint, {}, {}, callback);
}

// Login/logout button handlers
let loginBtn = document.getElementById("loginBtn");
let logoutBtn = document.getElementById("logoutBtn");
let createBtn = document.getElementById("createBtn");
loginBtn.addEventListener("click", processLogin);
logoutBtn.addEventListener("click", processLogout);
createBtn.addEventListener("click", processCreateUser);

/*
    Parses login data from the html and calls login function
    Params: None
    Return: None
*/
function processLogin() {
    loginBtn.setAttribute("disabled", "true");
    logoutBtn.setAttribute("disabled", "true");

    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;
    login(username, password);
}

/*
    Parses login data from the html and calls logout function
    Return: None
*/
function processLogout() {
    loginBtn.setAttribute("disabled", "true");
    logoutBtn.setAttribute("disabled", "true");
    logout();
}

function processCreateUser() {
    let username = document.getElementById("createUN").value;
    let password = document.getElementById("createPW").value;
    let email = document.getElementById("createEmail").value;

    createUser(username, email, password);
}

/*
    Sends a request to create a new user
    Params: self-explained with param names
*/
function createUser(username, email, password) {
    let endpoint = "/Users";
    let payload = {
        "username":username,
        "password":password,
        "email":email
    }
    let headers = {"Content-Type":"application/x-www-form-urlencoded"}
    sendRequest(method, endpoint, headers, payload, createUserCallback); // From CRUD.js
}

/*
    Sends a request to login the user. Sets the local storage with proper response.
    Params: self-explained with param names
    Return: true (arbitrary for now)
*/
function login(username, password) {
    let endpoint = "/Users/login";
    let payload = {
        "username":username,
        "password":password,
    };
    let headers = {"Content-Type":"application/x-www-form-urlencoded"};
    console.log("before send");
    sendRequest(method, endpoint, headers, payload, loginCallback); // From CRUD.js
    return true;
}

/*
    Sends a request to logout the user and handles the local storage
    Params: None
    Return: true (arbitrary for now)
*/
function logout() {
    let endpoint = "/Users/logout?access_token=" + window.localStorage.getItem("access_token");
    let headers = {};
    let payload = {};
    sendRequest(method, endpoint, headers, payload, logoutCallback); // From CRUD.js
    return true;
}