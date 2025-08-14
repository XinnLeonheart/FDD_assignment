import {deleteDB, openDB} from "https://unpkg.com/idb@7.1.1/build/index.js";


// open db
async function openDb() {
    try {
        const db = await openDB('userDB', 1, {
            upgrade(db)
            {
                console.log('userDB firstly created or upgraded.');
                const userStore = db.createObjectStore('userObjectStore', { keyPath: 'id', autoIncrement: true });
                userStore.createIndex('usernameIndex', 'username', { unique: false });
                userStore.createIndex('emailIndex', 'email', { unique: true });
                userStore.createIndex('passwordIndex', 'password', { unique: false });
                userStore.createIndex('currentUserIndex', 'currentUser', { unique: false });
                userStore.createIndex('nameIndex', 'name', { unique: false });
                userStore.createIndex('genderIndex', 'gender', { unique: false });
                userStore.createIndex('ageIndex', 'age', { unique: false });
                userStore.createIndex('addressIndex', 'address', { unique: false });
                userStore.createIndex('majorIndex', 'major', { unique: false });
                userStore.createIndex('phoneIndex', 'phone', { unique: false });
                userStore.createIndex('statusIndex', 'status', { unique: false });
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
        password: Password
    };
    const db = await openDb();
    const tx = db.transaction('userObjectStore', 'readwrite');
    const store = tx.objectStore('userObjectStore');
    await store.add(data);
    await tx.done;
    console.log('Data added successfully!');
}


// add user private data
 /*
 * @param string name
 * @param string gender
 * @param string age
 * @param string address
 * @param string major
 * @param string phone
 * @param string status
 */
async function addUserPrivateData(name, gender, age, address, major, phone, status)
{
    const db = await openDb();
    const tx = db.transaction('userObjectStore', 'readwrite');
    const store = tx.objectStore('userObjectStore');
    await store.add({ name: name, gender: gender, age: age, address: address, major: major, phone: phone, status: status, timestamp: new Date() });
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
* @param string name
* @param string gender
* @param string age
* @param string address
* @param string major
* @param string phone
* @param string status
 */
async function updateUserPrivateData(name, gender, age, address, major, phone, status)
{
    const db = await openDb();
    const tx = db.transaction('userObjectStore', 'readwrite');
    const store = tx.objectStore('userObjectStore');
    await store.put({ name: name, gender: gender, age: age, address: address, major: major, phone: phone, status: status, timestamp: new Date() });
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
    await store.add({ currentUser: currentUser});
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
    console.log(matchingData);
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
    console.log(indexData);
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
    const savedEmailObject = await searchUserData("userDB", "userObjectStore", "emailIndex", emailOrUsername);
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
        const savedUsernameObject = await searchUserData("userDB", "userObjectStore", "usernameIndex", emailOrUsername);
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
    addUserPrivateData,
    deleteUserData,
    updateUserPrivateData,
    searchUserData,
    deleteDb,
    openDb,
    getDataByIndex,
    check,
    updateCurrentUser,
    getMatchingDataByIndex
}

// window.export
window.addUserAccountData = addUserAccountData;
window.addUserPrivateData = addUserPrivateData;
window.deleteUserData = deleteUserData;
window.updateUserPrivateData = updateUserPrivateData;
window.searchUserData = searchUserData;
window.deleteDb = deleteDb;
window.openDb = openDb;
window.getDataByIndex = getDataByIndex;
window.check = check;
window.updateCurrentUser = updateCurrentUser;
window.getMatchingDataByIndex = getMatchingDataByIndex;

// open database
document.addEventListener('DOMContentLoaded', openDb);