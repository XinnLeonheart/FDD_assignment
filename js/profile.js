import {getDataByIndex, openDb, updateUserPrivateData} from "./indexedDb.js";

document.addEventListener('DOMContentLoaded', async () =>
{
    const currentUser = await getDataByIndex("userDB", "userObjectStore", "currentUserIndex");
    const db = await openDb();
    const tx = db.transaction('userObjectStore', 'readwrite');
    const store = tx.objectStore('userObjectStore');
    const index = store.index('usernameIndex');
    const currentUserData = await index.get(currentUser[0].currentUser);
    console.log(currentUserData);

    const nameText = document.getElementById("NameText");
    const genderText = document.getElementById("GenderText");
    const addressText = document.getElementById("AddressText");
    const phoneText = document.getElementById("PhoneText");

    nameText.value = currentUserData.name;
    genderText.value = currentUserData.gender;
    addressText.value = currentUserData.address;
    phoneText.value = currentUserData.phone;
});


async function edited() {
    const currentUser = await getDataByIndex("userDB", "userObjectStore", "currentUserIndex");

    const name = document.getElementById("NameText");
    const gender = document.getElementById("GenderText");
    const address = document.getElementById("AddressText");
    const phone = document.getElementById("PhoneText");


    if (name.value !== "" && gender.value !== "" && address.value !== "" && phone.value !== "") {
        updateUserPrivateData(currentUser[0].currentUser, name.value, gender.value, address.value, phone.value).then(r => {
            console.log(r);
            window.location.reload();
            document.getElementById("NameText").disabled = true;
            document.getElementById("GenderText").disabled = true;
            document.getElementById("AddressText").disabled = true;
            document.getElementById("PhoneText").disabled = true;
            document.getElementById("profile-edit-button").outerHTML = "<button id=\"profile-edit-button\" onclick=\"edit()\">Edit Details</button>";
        });
    } else {
        alert("Please fill in all the fields!");
    }
}


function edit()
{
    document.getElementById("NameText").disabled = false;
    document.getElementById("GenderText").disabled = false;
    document.getElementById("AddressText").disabled = false;
    document.getElementById("PhoneText").disabled = false;
    document.getElementById("profile-edit-button").outerHTML = "<button id=\"profile-edit-button\" onclick=\"edited()\">Save Details</button>";
}

// Export functions
window.edit = edit;
window.edited = edited;

export {edit, edited};