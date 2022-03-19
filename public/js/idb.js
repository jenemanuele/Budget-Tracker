const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB;

// create variable to hold db connection
let db;
// establish a connection to IDB db called 'budget_tracker' and set version to 1
const request = indexedDB.open('budget_tracker', 1);

// event starts if db version changes
request.onupgradeneeded = function (event) {
    const db = event.target.result;

    // create object store called new_transaction
    db.createObjectStore('new_transaction', { autoIncrement: true });
};

// when successful
request.onsuccess = function(event) {
    db = event.target.result;

    // check if app online, if yes run upload
    if (navigator.onLine) {
        // upload transaction
    }
};

request.onerror = function(event) {
    // note error
    console.log(event.target.errorCode);
};

// execute if new transaction made + no internet connection
function saveRecord(data) {

    // new transaction w/ db read & write capabilities
    const transaction = db.transaction(['new_transaction'], 'readwrite');

    // access store for new_transaction
    const newObjectStore = transaction.objectStore('new_transaction');

     // add record to object store 
    newObjectStore.add(data);

}

// upload transaction to the db, once + internet connection
function uploadTransaction() {

    // open a transaction on your db
    const transaction = db.transaction(['new_transaction']);
    const newObjectStore = transaction.objectStore('new_transaction');

    const getAllData = newObjectStore.getAllData();

    // received data-- send to server
    getAllData.onsuccess = function(){

        if (getAllData.result.length > 0 ) {
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAllData.result),
                headers: {
                    Accept: 'application/json, test/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(serverResponse => {
                if (serverResponse.message) {
                    throw new Error(serverResponse);
                }

                // to open a new transaction
                const transaction= db.transaction(['new_transaction'], 'readwrite');

                // get to new transaction
                const newObjectStore = transaction.objectStore('new_transaction');

                // clear items in object store


                newObjectStore.clear();

                alert('All retained transactions were added.');
            })
            .catch(err => {
                console.log(err);
            });
        }

    }
}

// listen for app
window.addEventListener('online', uploadTransaction);