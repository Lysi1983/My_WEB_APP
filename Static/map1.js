var formarry = []; // Holds the original, complete list of experiences with originalIndex
var displayedFormarry = []; // Holds data to be actually rendered (filtered, sorted)
var selectedIndex =-1; // Index in displayedFormarry for editing
var currentSortColumn = -1;
var currentSortDirection = 'asc';

    function init() {
        // formarry = []; // Not needed, will be overwritten
        // displayedFormarry = []; // Not needed, will be overwritten
        document.getElementById("tableRows").innerHTML = ""; // Clear existing table rows
        fetch('/api/work_experiences')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                formarry = data.map((item, index) => ({ ...item, originalIndex: index }));
                // displayedFormarry = [...formarry]; // Will be set by refreshDisplay
                refreshDisplay(); // Apply current filters/sorts and render
            })
            .catch(error => {
                console.error('Error fetching work experiences:', error);
                // Optionally, display a user-friendly error message
            });
    }


    function onRegisterPressed() {
        var workPlace = document.getElementById("workplace").value;
        var jobTitle = document.getElementById("jobTitle").value; // New field
        var daTe = document.getElementById("date").value;
        var endDate = document.getElementById("endDate").value; // New field
        var descriPtion = document.getElementById("description").value;
        var formObj = {
            workplace: workPlace, // Ensure your API expects 'workplace'
            jobTitle: jobTitle,   // Ensure your API expects 'jobTitle'
            date: daTe,           // Ensure your API expects 'date' (for start date)
            endDate: endDate,     // Ensure your API expects 'endDate'
            description: descriPtion // Ensure your API expects 'description'
        };

        let url = '/api/work_experiences';
        let method = 'POST';

        if (selectedIndex !== -1) { // Update mode
            // selectedIndex is the index in displayedFormarry
            // We need the originalIndex for the API endpoint
            if (displayedFormarry[selectedIndex] && typeof displayedFormarry[selectedIndex].originalIndex !== 'undefined') {
                url += '/' + displayedFormarry[selectedIndex].originalIndex;
                method = 'PUT';
            } else {
                console.error("Error: Trying to update an item without a valid originalIndex.", displayedFormarry[selectedIndex]);
                return; // Prevent API call
            }
        }

        fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formObj),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            // response.json() might not be needed if the backend doesn't send back the object
            // or if we are just re-fetching everything with init()
            return response.json(); 
        })
        .then(data => {
            init(); // Refresh table from server
            onClearPressed(); // Clear form
        })
        .catch(error => {
            console.error('Error saving work experience:', error);
            // Optionally, display a user-friendly error message
        });
    }

    function prepareTableCell(workPlace, jobTitle, daTe, endDate, descriPtion, index) {
        var table = document.getElementById("tableRows");
        var row = table.insertRow();
        var workPlaceCell = row.insertCell(0);
        var jobTitleCell = row.insertCell(1); // New cell
        var daTeCell = row.insertCell(2);
        var endDateCell = row.insertCell(3); // New cell
        var descriPtionCell = row.insertCell(4);
        var actionCell = row.insertCell(5); // Adjusted index

        workPlaceCell.innerHTML = workPlace;
        jobTitleCell.innerHTML = jobTitle || '-'; 
        daTeCell.innerHTML = daTe;
        endDateCell.innerHTML = endDate || '-'; 
        descriPtionCell.innerHTML = descriPtion;
        actionCell.innerHTML = '<button onclick="deleteTableRow('+ index + ')">Delete</button><button onclick="onEditPressed('+ index + ')">Update</button>';
    }

    function deleteTableRow(indexInDisplayedArray) { // index is from displayedFormarry
        if (displayedFormarry[indexInDisplayedArray] && typeof displayedFormarry[indexInDisplayedArray].originalIndex !== 'undefined') {
            const originalApiIndex = displayedFormarry[indexInDisplayedArray].originalIndex;
            fetch('/api/work_experiences/' + originalApiIndex, {
                method: 'DELETE',
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                // Assuming success, re-fetch all data, then re-apply filter and sort
                init(); // This will fetch, then applyFilterAndSort will be called if needed.
                // Consider calling applyFilterAndSort() after init() if state needs to be preserved
                // For now, init() resets to full list. A more advanced state management is needed for robust UX.
                // Let's simplify: after delete, just init. User can re-filter/sort.
            })
            .catch(error => {
                console.error('Error deleting work experience:', error);
            });
        } else {
            console.error("Error: Trying to delete an item without a valid originalIndex.");
        }
    }

    function onClearPressed() { // 'index' parameter was unused, removed.
        selectedIndex = -1;
        document.getElementById("workplace").value = "";
        document.getElementById("jobTitle").value = ""; // New field
        document.getElementById("date").value = "";
        document.getElementById("endDate").value = ""; // New field
        document.getElementById("description").value = "";
        document.getElementById("submit").innerHTML = "Add new data";
    }
    function onEditPressed(indexInDisplayedArray) { // index is from displayedFormarry
		selectedIndex = indexInDisplayedArray;
		var formObj = displayedFormarry[indexInDisplayedArray];
		document.getElementById("workplace").value=formObj.workplace; 
		document.getElementById("jobTitle").value =formObj.jobTitle || ''; 
		document.getElementById("date").value =formObj.date; 
		document.getElementById("endDate").value =formObj.endDate || ''; 
		document.getElementById("description").value =formObj.description; 
        document.getElementById("submit").innerHTML="Edit Update";
	}

    function sortTable(columnIndex, dataType) {
        const sortKeys = ['workplace', 'jobTitle', 'date', 'endDate'];
        const key = sortKeys[columnIndex];

        if (currentSortColumn === columnIndex) {
            currentSortDirection = currentSortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            currentSortColumn = columnIndex;
            currentSortDirection = 'asc';
        }

        displayedFormarry.sort((a, b) => { // Sort displayedFormarry
            let valA = a[key];
            let valB = b[key];

            if (valA == null && valB == null) return 0;
            if (valA == null) return 1;
            if (valB == null) return -1;

            if (dataType === 'date') {
                valA = new Date(valA);
                valB = new Date(valB);
                if (isNaN(valA) && isNaN(valB)) return 0;
                if (isNaN(valA)) return 1;
                if (isNaN(valB)) return -1;
            } else if (dataType === 'string') {
                valA = String(valA).toLowerCase(); // For case-insensitive string sort
                valB = String(valB).toLowerCase(); // For case-insensitive string sort
            }

            let comparison = 0;
            if (dataType === 'date') {
                if (valA < valB) comparison = -1;
                else if (valA > valB) comparison = 1;
            } else {
                comparison = valA.localeCompare(valB);
            }
            return currentSortDirection === 'asc' ? comparison : -comparison;
        });
        renderTable(); // Re-render table with sorted displayedFormarry
    }

// New function to render the table using displayedFormarry
function renderTable() {
    document.getElementById("tableRows").innerHTML = ""; // Clear existing table rows
    displayedFormarry.forEach((item, index) => { // Iterate over displayedFormarry
        prepareTableCell(
            item.workplace,
            item.jobTitle,
            item.date,
            item.endDate,
            item.description,
            index // Pass the index within displayedFormarry
        );
    });
}

// Function to apply current sort settings to displayedFormarry
function applyCurrentSort() {
    if (currentSortColumn !== -1) {
        const sortKeys = ['workplace', 'jobTitle', 'date', 'endDate']; // Make sure this is available
        const key = sortKeys[currentSortColumn];
        // Determine dataType based on currentSortColumn, needed for proper comparison
        // This is a bit of a simplification; ideally, dataType is stored with currentSortColumn
        const dataType = (currentSortColumn === 2 || currentSortColumn === 3) ? 'date' : 'string';


        displayedFormarry.sort((a, b) => {
            let valA = a[key];
            let valB = b[key];

            if (valA == null && valB == null) return 0;
            if (valA == null) return 1;
            if (valB == null) return -1;

            if (dataType === 'date') {
                valA = new Date(valA);
                valB = new Date(valB);
                if (isNaN(valA) && isNaN(valB)) return 0;
                if (isNaN(valA)) return 1;
                if (isNaN(valB)) return -1;
            } else if (dataType === 'string') {
                valA = String(valA).toLowerCase();
                valB = String(valB).toLowerCase();
            }

            let comparison = 0;
            if (dataType === 'date') {
                if (valA < valB) comparison = -1;
                else if (valA > valB) comparison = 1;
            } else {
                comparison = valA.localeCompare(valB);
            }
            return currentSortDirection === 'asc' ? comparison : -comparison;
        });
    }
}

// Function to apply filter and then current sort, then render
function refreshDisplay() {
    const searchTerm = document.getElementById("searchInput") ? document.getElementById("searchInput").value.toLowerCase() : "";
    if (searchTerm) {
        displayedFormarry = formarry.filter(item => {
            const workplace = String(item.workplace || '').toLowerCase();
            const jobTitle = String(item.jobTitle || '').toLowerCase();
            const description = String(item.description || '').toLowerCase();
            return workplace.includes(searchTerm) ||
                   jobTitle.includes(searchTerm) ||
                   description.includes(searchTerm);
        });
    } else {
        displayedFormarry = [...formarry];
    }
    applyCurrentSort();
    renderTable();
}


function applyFilter() {
    refreshDisplay(); // refreshDisplay now handles getting search term and applying filter/sort
}

function clearFilter() {
    if (document.getElementById("searchInput")) {
        document.getElementById("searchInput").value = "";
    }
    refreshDisplay(); // refreshDisplay will see empty search and reset, then sort and render
}