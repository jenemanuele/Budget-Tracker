const db;
// + Internet connection; connection to Index-db db budget_tracker and set to 1
const request = indexedDb.open('budget_tracker', 1);

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
function saveData(data) {

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
                const transaction= db.transaction.(['new_transaction'], 'readwrite');

                const newObjectStore = transaction.objectStore('new_transaction');

                newObjectStore.clear();

                alert('All retained transactions were added.');
            })
            .catch(err => {
                console.log(err);
            });
        }

    }
}

window.addEventListener('online', uploadTransaction);