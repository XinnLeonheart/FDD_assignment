import {getDataByIndex, updateUserPassword} from "./indexedDb.js"

async function confirmButton()
{
    const currentUser = await getDataByIndex("userDB", "userObjectStore", "currentUserIndex");
    const db = await openDb();
    const tx = db.transaction('userObjectStore', 'readwrite');
    const store = tx.objectStore('userObjectStore');
    const index = store.index('usernameIndex');
    const currentUserData = await index.get(currentUser[0].currentUser);

    const oldPassword = document.getElementById("OldPasswordText").value;
    const newPassword = document.getElementById("NewPasswordText").value;
    const securityQuestion = document.getElementById("SecurityQuestionText").value;
    const answer = document.getElementById("AnswerText").value;

    if (oldPassword === currentUserData.password)
    {
        updateUserPassword(currentUser[0].currentUser, newPassword, securityQuestion, answer).then(() =>
        {
            alert("Password updated successfully");
        });
    }
    else
    {
        alert("Incorrect old password");
    }
}

window.confirmButton = confirmButton;

export {
    confirmButton,
}