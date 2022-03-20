const indexedDB = window.indexedDB || window.mozIndexedDb || window.webkitIndexedDb;

// create variable to hold db connection
let db;
// establish a connection to IndexedDB database called 'budget_tracker' and set it to version 1
const request = indexedDB.open('budget_tracker', 1);

// this event will emit if the database version changes
request.onupgradeneeded = function(event) {

    // save a reference to the database
    const db = event.target.result;

    // create an object store (table) called `new_transaction`, set it to have an auto incrementing primary key of sorts
    db.createObjectStore('new_transaction', { autoIncrement: true });
};
// when successful
request.onsuccess = function(event) {
    db = event.target.result;

    // check if app online, if yes run upload
    if (navigator.onLine) {
        uploadTransaction();
    }
};

request.onerror = function(event) {
    // note error
    console.log(event.target.errorCode);
};

// execute if new transaction made + no internet connection
function saveRecord(record) {

    // new transaction w/ db read & write capabilities
    const transaction = db.transaction(['new_transaction'], 'readwrite');

    // access store for new_transaction
    const newObjectStore = transaction.objectStore('new_transaction');

     // add record to object store 
    newObjectStore.add(record);

}

// upload transaction to the db, once + internet connection
function uploadTransaction() {

    // open a transaction on your db
    const transaction = db.transaction(['new_transaction'], 'readwrite');
    
    // access your object store
    const newObjectStore = transaction.objectStore('new_transaction');

    const getAll = newObjectStore.getAll();

    // received record- send to server
    getAll.onsuccess = function() {

        if (getAll.result.length > 0 ) {
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
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

    };
}

// listen for app coming back online
window.addEventListener('online', uploadTransaction);