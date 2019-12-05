/* DOM ELEMENTS */

let access_token = window.localStorage.getItem("access_token");
let userId = window.localStorage.getItem("userId");
let addItemBtn = document.getElementById("addItemBtn");
let addItemDialog = document.getElementById("addItemDialog");
let addItemCancel = document.getElementById("addItemCancel");
let addItemSubmit = document.getElementById("addItemSubmit");
let wishlist = document.getElementById("wishlist");

/* LISTENERS */

addItemBtn.addEventListener("click", () => {
    addItemDialog.setAttribute("style", "display: block;");
});
addItemCancel.addEventListener("click", () => {
    addItemDialog.setAttribute("style", "display: none;");
});
addItemSubmit.addEventListener("click", () => {
    processAddItem();
    addItemDialog.setAttribute("style", "display: none;");
});
window.addEventListener("load", () => { loadWishlist(); });

/* CALLBACKS */

let addItemCallBack = (status, response) => {
    if (status == 200) {
        let resp = JSON.parse(response);
        renderItem(resp);
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

// I FORGOT WHAT THIS FUNCTION WAS FOR
function getItemDetails(id) {
    let item = document.getElementById(id);
    let image = item.querySelector(".image").files[0];  // TODO

    return {
        "id":id,
        "name":item.querySelector(".item").value,
        "price":item.querySelector(".price").value,
        "category":item.querySelector(".category").value,
        "image":image,
        "comment":item.querySelector(".comment").value
    }
}

function processAddItem() {
    let item = document.getElementById("addItem").value;
    let price = document.getElementById("addPrice").value;
    let category = document.getElementById("addCategory").value;
    let comment = document.getElementById("addComment").value;

    let image = document.getElementById("addImage").files[0];
    let reader = new FileReader();

    let values = {
        "item":item,
        "price":price,
        "category":category,
        "image":null,
        "comment": comment
    }

    // Processing the image
    let canvas = document.createElement("canvas");
    let ctx = canvas.getContext("2d");
    let img = new Image();

    reader.addEventListener("load", () => {
        img.addEventListener("load", () => {
            let dim = 150;
            canvas.height = dim;
            canvas.width = dim;
            ctx.drawImage(img, 0, 0, dim, dim);
            console.log(canvas.height, canvas.width);
            values["image"] = canvas.toDataURL();
            addItem(values);
        })
        img.src = reader.result;
    });

    if (image) {
        reader.readAsDataURL(image);
        return
    }

    addItem(values);
}

function addItem(payload) {
    let headers = {"Content-Type":"application/x-www-form-urlencoded"};
    let endpoint = "/wishlists?access_token=" + access_token;
    sendRequest("POST", endpoint, headers, payload, addItemCallBack);
}

let updateItem = (id) => {
    // Grab the values of the updated item
    window.localStorage.setItem("updateId", id);
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

    // TODO ADD LISTENERS
    updateBtn.addEventListener("click", () => {
        updateItem(id); 
    });

    let d = deleteItem;
    deleteBtn.addEventListener("click", () => {
        deleteFunc(id); 
    });
}

function renderItem(values) {
    let id = values["id"];
    let temp = document.getElementById("itemTemplate");
    let clone = temp.content.cloneNode(true);
    let newNode = clone.querySelector("li");

    newNode.setAttribute("id", id);

    // Add the values to the item
    newNode.querySelector(".item").innerHTML = values["item"];
    newNode.querySelector(".price").innerHTML = values["price"];
    newNode.querySelector(".category").innerHTML = values["category"];
    newNode.querySelector(".image").setAttribute("src", values["image"]); // TODO Process the image
    newNode.querySelector(".comment").innerHTML = values["comment"];

    // Add the new node to the page
    wishlist.appendChild(clone);
    // Add the edit and delete handlers
    setItemButtonHandlers(id, deleteItem);
}

function removeItem(id) {
    let item = document.getElementById(id);
    item.parentNode.removeChild(item);
}