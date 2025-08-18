import {deleteDB, openDB} from "https://unpkg.com/idb@7.1.1/build/index.js";


// open db
async function openDb() {
    try {
        const db = await openDB('userDB', 1, {
            upgrade(db)
            {
                console.log('userDB firstly created or upgraded.');
                const userStore = db.createObjectStore('userObjectStore', { keyPath: 'id', autoIncrement: true });
                userStore.createIndex('usernameIndex', 'username', { unique: true });
                userStore.createIndex('emailIndex', 'email', { unique: true });
                userStore.createIndex('passwordIndex', 'password', { unique: false });
                userStore.createIndex('securityQuestionIndex', 'securityQuestion', { unique: false });
                userStore.createIndex('answerIndex', 'answer', { unique: false });
                userStore.createIndex('currentUserIndex', 'currentUser', { unique: true });
                userStore.createIndex('nameIndex', 'name', { unique: false });
                userStore.createIndex('genderIndex', 'gender', { unique: false });
                userStore.createIndex('addressIndex', 'address', { unique: false });
                userStore.createIndex('phoneIndex', 'phone', { unique: false });
                userStore.createIndex('majorIndex', 'major', { unique: false });
                userStore.createIndex('enrollmentIndex', 'enrollment', { unique: false });
                userStore.createIndex('bioIndex', 'bio', { unique: false });
                userStore.createIndex('websiteIndex', 'website', { unique: false });
                console.log('ObjectStore "userObjectStore" and index has been created.');
            }
        });
        console.log('indexedDB opened successfully.');
        return db;
    }
    catch (error)
    {
        console.error('failed to open a indexedDB:', error);
    }
}


// delete db
/*
* @param string dbName
*/
async function deleteDb(dbName) {
    await deleteDB(dbName);
    console.log('Database deleted successfully!');
}


// add user account data
 /*
 * @param string Username
 * @param string Email
 * @param string Password
 */
async function addUserAccountData(Username, Email, Password) {
    const data = {
        username: Username,
        email: Email,
        password: Password,
        securityQuestion: null,
        answer: null,
        currentUser: null,
        name: null,
        address: null,
        phone: null,
        gender: null,
        major: null,
        enrollment: null,
        bio: null,
        website: null,
        location: null
    };
    const db = await openDb();
    const tx = db.transaction('userObjectStore', 'readwrite');
    const store = tx.objectStore('userObjectStore');
    await store.add(data);
    await tx.done;
    console.log('Data added successfully!');
}


// delete data
/*
* @param string id
*/
async function deleteUserData(indexName)
{
    const db = await openDb();
    const tx = db.transaction('userObjectStore', 'readwrite');
    const store = tx.objectStore('userObjectStore');
    const index = store.index(indexName);
    const keys = await index.getAllKeys();
    await Promise.all(keys.map(key => store.delete(key)));
    await tx.done;
    console.log('Data deleted successfully!');
    db.close();
}


// update data
/*
* @param string currentUser
* @param string name
* @param string gender
* @param string address
* @param string phone
* @param string major
* @param string enrollment
* @param string bio
* @param string website
 */
async function updateUserPrivateData(currentUser, name, gender, email, address, phone, major, enrollment, bio, website)
{
    const db = await openDb();
    const tx = db.transaction('userObjectStore', 'readwrite');
    const store = tx.objectStore('userObjectStore');
    const index = store.index('usernameIndex');
    const user = await index.get(currentUser);
    user.name = name;
    user.gender = gender;
    user.email = email;
    user.address = address;
    user.phone = phone;
    user.major = major;
    user.enrollment = enrollment;
    user.bio = bio;
    user.website = website;
    await store.put(user);
    await tx.done;
    console.log('Data updated successfully!');
    db.close();
}

async function updateUserPassword(currentUser, password, securityQuestion, answer)
{
    const db = await openDb();
    const tx = db.transaction('userObjectStore', 'readwrite');
    const store = tx.objectStore('userObjectStore');
    const index = store.index('usernameIndex');
    const passwordAndSecurityQuestion = await index.get(currentUser);
    passwordAndSecurityQuestion.password = password;
    passwordAndSecurityQuestion.securityQuestion = securityQuestion;
    passwordAndSecurityQuestion.answer = answer;
    await store.put(passwordAndSecurityQuestion);
    await tx.done;
    console.log('Data updated successfully!');
    db.close();
}


// update current user
/*
* @param string currentUser
 */
async function updateCurrentUser(currentUser)
{
    const db = await openDb();
    const tx = db.transaction('userObjectStore', 'readwrite');
    const store = tx.objectStore('userObjectStore');
    await store.put({currentUser: currentUser});
    await tx.done;
    console.log('Data updated successfully!');
    db.close();
}


// get first matching data by index
 /*
 * @param string dbName
 * @param string storeName
 * @param string indexName
 * @param string indexValue
 * @return Promise<any>
  */
async function getMatchingDataByIndex(dbName, storeName, indexName, indexValue)
{
    const db = await openDB(dbName, 1);

    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);

    // get a specific index
    const index = store.index(indexName);

    // using index.get() to get first matching data
    const matchingData = await index.get(indexValue);

    await tx.done;
    db.close();
    return matchingData;
}


// get data by index
 /*
 * @param string dbName
 * @param string storeName
 * @param string indexName
 * @return Promise<any>
  */
async function getDataByIndex(dbName, storeName, indexName)
{
    const db = await openDB(dbName, 1);

    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);

    const index = store.index(indexName);
    const indexData = await index.getAll();
    await tx.done;
    db.close();
    return indexData;
}


// search data
 /*
 * @param string dbName
 * @param string storeName
 * @param string indexName
 * @param string indexValue
 * @return object
  */
async function searchUserData(dbName, storeName, indexName, indexValue)
{
    return await getMatchingDataByIndex(dbName, storeName, indexName, indexValue);
}


// check if email or username exists
/*
* @param string emailOrUsername
* @return object {email, username, password}
*/
async function check(emailOrUsername)
{
    let savedEmail;
    let savedUsername;
    let savedPassword;

    // get user data from indexedDB
    const savedEmailObject = await searchUserData("userDB", "userObjectStore", "usernameIndex", emailOrUsername);
    if (savedEmailObject !=  null)
    {
        savedEmail = savedEmailObject.email;
        savedUsername = savedEmailObject.username;
        savedPassword = savedEmailObject.password;
        console.log("email:" + savedEmail);
        console.log("username:" + savedUsername);
        console.log("password:" + savedPassword);
        return {
            email: savedEmail,
            username: savedUsername,
            password: savedPassword
        };
    }
    else
    {
        const savedUsernameObject = await searchUserData("userDB", "userObjectStore", "emailIndex", emailOrUsername);
        if (savedUsernameObject != null)
        {
            savedEmail = savedUsernameObject.email;
            savedUsername = savedUsernameObject.username;
            savedPassword = savedUsernameObject.password;
            console.log("email:" + savedEmail);
            console.log("username:" + savedUsername);
            console.log("password:" + savedPassword);
            return {
                email: savedEmail,
                username: savedUsername,
                password: savedPassword
            };
        }
    }
    return null;
}

// export functions
export
{
    addUserAccountData,
    deleteUserData,
    updateUserPrivateData,
    searchUserData,
    deleteDb,
    openDb,
    getDataByIndex,
    check,
    updateCurrentUser,
    getMatchingDataByIndex,
    updateUserPassword
}

// window.export
window.addUserAccountData = addUserAccountData;
window.deleteUserData = deleteUserData;
window.updateUserPrivateData = updateUserPrivateData;
window.searchUserData = searchUserData;
window.deleteDb = deleteDb;
window.openDb = openDb;
window.getDataByIndex = getDataByIndex;
window.check = check;
window.updateCurrentUser = updateCurrentUser;
window.getMatchingDataByIndex = getMatchingDataByIndex;
window.updateUserPassword = updateUserPassword;

// open database
document.addEventListener('DOMContentLoaded', openDb);