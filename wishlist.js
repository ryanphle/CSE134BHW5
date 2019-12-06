/* DOM ELEMENTS */

let access_token = window.localStorage.getItem("access_token");
let userId = window.localStorage.getItem("userId");
let addItemBtn = document.getElementById("addItemBtn");
let addItemDialog = document.getElementById("addItemDialog");
let addItemCancel = document.getElementById("addItemCancel");
let addItemSubmit = document.getElementById("addItemSubmit");
let updateItemCancel = document.getElementById("updateItemCancel");
let updateItemDialog = document.getElementById("updateItemDialog");
let wishlist = document.getElementById("wishlist");

/* LISTENERS */

addItemBtn.addEventListener("click", () => {
    addItemDialog.setAttribute("style", "display: inherit;");
});

addItemCancel.addEventListener("click", () => {
    document.getElementById("addItemErrorMsg").setAttribute("style", "display: none;");
    addItemDialog.setAttribute("style", "display: none;");
});

addItemSubmit.addEventListener("click", () => {
    let values = {
        "item":document.getElementById("addItem").value,
        "price":document.getElementById("addPrice").value,
        "image":document.getElementById("addImage").files[0],
        "category":document.getElementById("addCategory").value,
        "comment":document.getElementById("addComment").value
    }

    // Gets star values
    let stars = 0;
    for (let i = 1; i <= 5; i++) {
        let idStr = "addStar" + i;
        if (document.getElementById(idStr).checked) {
            stars = i;
            break;
        }
    }

    values["comment"] = String(stars) + values["comment"];
    
    // Checks for at least item name
    if (values["item"] && values["price"]) {
        processItem(addItem, values);
        addItemDialog.setAttribute("style", "display: none;");
        document.getElementById("addItemErrorMsg").setAttribute("style", "display: none;");
    }
    else {
        document.getElementById("addItemErrorMsg").setAttribute("style", "display: inherit;");
    }
});

updateItemCancel.addEventListener("click", () => {
    updateItemDialog.setAttribute("style", "display: none;");
});

window.addEventListener("load", () => { loadWishlist(); });

/* CALLBACKS */

let addItemCallBack = (status, response) => {
    if (status == 200) {
        location.reload();
    }
}

let loadWishlistCallback = (status, response) => {
    if (status == 200) {
        let resp = JSON.parse(response);
        let items = resp["wishItems"];
        for (let i = 0; i < items.length; i++) {
            renderItem(items[i]);
        }
    }
}

/* FUNCTIONS */

function loadWishlist() {
    let endpoint = "/wishlists/myWishlist?access_token=" + access_token;
    sendRequest("GET", endpoint, {}, {}, loadWishlistCallback);
}

function getItemDetails(id) {
    let item = document.getElementById(id);

    return {
        "id":id,
        "item":item.querySelector(".item").innerText,
        "price":item.querySelector(".price").innerText,
        "category":item.querySelector(".category").innerText,
        "image":item.querySelector(".image").src,
        "comment":item.querySelector(".comment").innerText
    }
}

function processItem(processFunc, currValues) {
    let item = currValues["item"];
    let price = currValues["price"];
    let category = currValues["category"];
    let comment = currValues["comment"];
    let image = currValues["image"];

    let reader = new FileReader();
    let values = {
        "item":item,
        "price":price,
        "category":category,
        "image":image,
        "comment": comment
    }

    // Resizing the image to a standard size
    let canvas = document.createElement("canvas");
    let ctx = canvas.getContext("2d");
    let img = new Image();

    reader.addEventListener("load", () => {
        img.addEventListener("load", () => {
            let dim = 150;
            canvas.height = dim;
            canvas.width = dim;
            ctx.drawImage(img, 0, 0, dim, dim);
            values["image"] = canvas.toDataURL();
            processFunc(values);
        })
        img.src = reader.result;
    });

    // Load a new file if a new file is passed in
    if (!(typeof image === "string") && image) {
        reader.readAsDataURL(image);
        return
    }

    processFunc(values);
}

function addItem(payload) {
    let headers = {"Content-Type":"application/x-www-form-urlencoded"};
    let endpoint = "/wishlists?access_token=" + access_token;
    sendRequest("POST", endpoint, headers, payload, addItemCallBack);
}

let updateItem = (id) => {
    let updateAjax = (payload) => {
        let endpoint = "/wishlists/"+id+"/replace?access_token="+access_token;
        let headers = {"Content-Type":"application/x-www-form-urlencoded"};
        sendRequest("POST", endpoint, headers, payload, addItemCallBack);
    }

    let image = document.getElementById("updateImage").files[0];
    if (!image) {
        image = getItemDetails(id)["image"];
    }

    let values = {
        "item":document.getElementById("updateItem").value,
        "price":document.getElementById("updatePrice").value,
        "category":document.getElementById("updateCategory").value,
        "comment":document.getElementById("updateComment").value,
        "image":image
    }

    processItem(updateAjax, values);
}

let deleteItem = (id) => {
    // Send request
    let endpoint = "/wishlists/"+id+"?access_token="+access_token;
    sendRequest("DELETE", endpoint, {}, {}, (s,r)=>{});
    removeItem(id); 
}

function setItemButtonHandlers(id, deleteFunc) {
    let itemNode = document.getElementById(id);
    let updateBtn = itemNode.querySelector(".updateItem");
    let deleteBtn = itemNode.querySelector(".deleteItem");

    updateBtn.addEventListener("click", () => {
        updateItemDialog.setAttribute("style", "display: inherit;");
        let values = getItemDetails(id);

        document.getElementById("updateItem").value = values["item"];
        document.getElementById("updatePrice").value = values["price"];
        document.getElementById("updateCategory").value = values["category"];
        document.getElementById("updateComment").value = values["comment"];

        let updateItemSubmit = document.getElementById("updateItemSubmit");
        updateItemSubmit.addEventListener("click", () => {
            updateItem(id); 
        });
    });

    deleteBtn.addEventListener("click", () => {
        deleteFunc(id); 
    });
}

function renderItem(values) {
    let id = values["id"];
    let temp = document.getElementById("itemTemplate");
    let clone = temp.content.cloneNode(true);
    let newNode = clone.querySelector(".itemNode");

    newNode.setAttribute("id", id);

    // Add the values to the item
    newNode.querySelector(".item").innerHTML = values["item"];
    newNode.querySelector(".price").innerHTML = values["price"];
    newNode.querySelector(".category").innerHTML = values["category"];
    newNode.querySelector(".image").setAttribute("src", values["image"]); 

    // Extract the comment and stars
    let stars = parseInt(values["comment"].substring(0,1));
    let comment = values["comment"].substring(1, values["comment"].length);

    newNode.querySelector(".comment").innerHTML = comment;
    
    // Fill in the stars
    for (let i = 1; i <= stars; i++) {
        let starClass = ".itemStar" + String(i);
        newNode.querySelector(starClass).setAttribute("style", "color: #ffc700;");
    }

    // Add the new node to the page
    wishlist.appendChild(clone);
    // Add the edit and delete handlers
    setItemButtonHandlers(id, deleteItem);
}

function removeItem(id) {
    let item = document.getElementById(id);
    item.parentNode.removeChild(item);
}