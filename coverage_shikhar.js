// Track the state of filter buttons
let filterButton1Active = false;
let filterButton2Active = false;
let jsonData = []; // Global variable to hold fetched JSON data

// Function to fetch data from JSON file
async function fetchData() {
    try {
        const response = await fetch("data.json"); // Adjust if your JSON file is in a different location
        if (!response.ok) throw new Error("Failed to fetch data.");
        jsonData = await response.json();
        initialize(); // Populate the table and filters after fetching data
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

// Function to populate the table with dynamic numbering
function populateTable(data) {
    const tableBody = document.getElementById("table-body");
    tableBody.innerHTML = ""; // Clear existing data

    data.forEach((item, index) => {
        const row = document.createElement("tr");

        // Add row number (dynamic numbering)
        const serialCell = document.createElement("td");
        serialCell.textContent = data.length - index; // Reverse order
        row.appendChild(serialCell);

        // Add data cells
        const columns = [
            "HUL Code", "HUL Outlet Name", "Shikhar Outlet",
            "DETS ME Name", "FNB ME Name", 
            "FNB Beat", "NUTS ME Name", "NUTS Beat", "ECO", "Shikhar"
        ];
        
        columns.forEach((key) => {
            const cell = document.createElement("td");
            cell.textContent = item[key] !== undefined ? item[key] : "";
            row.appendChild(cell);
        });

        tableBody.appendChild(row);
    });
}

// Function to apply all filters and update the table and dropdowns
function applyFilters() {
    let filteredData = jsonData.filter((row) => {
        const filterValues = {
            "DETS ME Name": document.getElementById("filter-dets-me-name").value,
            "DETS Beat": document.getElementById("filter-dets-beat").value,
            "FNB ME Name": document.getElementById("filter-fnb-me-name").value,
            "FNB Beat": document.getElementById("filter-fnb-beat").value,
            "NUTS ME Name": document.getElementById("filter-nuts-me-name").value,
            "NUTS Beat": document.getElementById("filter-nuts-beat").value
        };
        const searchQuery = document.getElementById("search-bar").value.toLowerCase();

        return (
            (filterValues["DETS ME Name"] === "" || row["DETS ME Name"] === filterValues["DETS ME Name"]) &&
            (filterValues["DETS Beat"] === "" || row["DETS Beat"] === filterValues["DETS Beat"]) &&
            (filterValues["FNB ME Name"] === "" || row["FNB ME Name"] === filterValues["FNB ME Name"]) &&
            (filterValues["FNB Beat"] === "" || row["FNB Beat"] === filterValues["FNB Beat"]) &&
            (filterValues["NUTS ME Name"] === "" || row["NUTS ME Name"] === filterValues["NUTS ME Name"]) &&
            (filterValues["NUTS Beat"] === "" || row["NUTS Beat"] === filterValues["NUTS Beat"]) &&
            (searchQuery === "" ||
                row["HUL Code"].toLowerCase().includes(searchQuery) ||
                row["HUL Outlet Name"].toLowerCase().includes(searchQuery)) &&
            (!filterButton1Active || row["ECO"] < 1000) &&
            (!filterButton2Active || (row["Shikhar"] < 500 && row["Shikhar Outlet"] === "YES"))
        );
    });

    populateTable(filteredData);
    updateDropdowns(filteredData);
}

// Function to update dropdown options dynamically
function updateDropdowns(filteredData) {
    const dropdowns = {
        "filter-dets-me-name": { header: "DETS ME Name", values: new Set() },
        "filter-dets-beat": { header: "DETS Beat", values: new Set() },
        "filter-fnb-me-name": { header: "FNB ME Name", values: new Set() },
        "filter-fnb-beat": { header: "FNB Beat", values: new Set() },
        "filter-nuts-me-name": { header: "NUTS ME Name", values: new Set() },
        "filter-nuts-beat": { header: "NUTS Beat", values: new Set() }
    };

    filteredData.forEach((row) => {
        if (row["DETS ME Name"]) dropdowns["filter-dets-me-name"].values.add(row["DETS ME Name"]);
        if (row["DETS Beat"]) dropdowns["filter-dets-beat"].values.add(row["DETS Beat"]);
        if (row["FNB ME Name"]) dropdowns["filter-fnb-me-name"].values.add(row["FNB ME Name"]);
        if (row["FNB Beat"]) dropdowns["filter-fnb-beat"].values.add(row["FNB Beat"]);
        if (row["NUTS ME Name"]) dropdowns["filter-nuts-me-name"].values.add(row["NUTS ME Name"]);
        if (row["NUTS Beat"]) dropdowns["filter-nuts-beat"].values.add(row["NUTS Beat"]);
    });

    Object.keys(dropdowns).forEach((id) => {
        populateSelectDropdown(id, dropdowns[id].values, dropdowns[id].header);
    });
}

// Function to populate a single dropdown with a header as the default placeholder
function populateSelectDropdown(id, optionsSet, headerName) {
    const dropdown = document.getElementById(id);
    const selectedValue = dropdown.value;
    dropdown.innerHTML = `<option value="">${headerName}</option>`; // Use column name as default option

    optionsSet.forEach((option) => {
        dropdown.innerHTML += `<option value="${option}" ${option === selectedValue ? "selected" : ""}>${option}</option>`;
    });
}

// Function to reset filters
function resetFilters() {
    filterButton1Active = filterButton2Active = false;
    document.getElementById("filter-button-1").style.backgroundColor = "blue";
    document.getElementById("filter-button-2").style.backgroundColor = "blue";

    document.getElementById("search-bar").value = "";
    document.querySelectorAll("select").forEach((dropdown) => (dropdown.value = ""));

    applyFilters();
}

// Debounce function to optimize search performance
function debounce(func, delay = 300) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => func(...args), delay);
    };
}

// Initialize the table and filters
function initialize() {
    document.getElementById("reset-button").addEventListener("click", resetFilters);
    document.getElementById("search-bar").addEventListener("input", debounce(applyFilters));
    document.querySelectorAll("select").forEach((dropdown) => dropdown.addEventListener("change", applyFilters));

    document.getElementById("filter-button-1").addEventListener("click", () => {
        filterButton1Active = !filterButton1Active;
        document.getElementById("filter-button-1").style.backgroundColor = filterButton1Active ? "green" : "blue";
        applyFilters();
    });

    document.getElementById("filter-button-2").addEventListener("click", () => {
        filterButton2Active = !filterButton2Active;
        document.getElementById("filter-button-2").style.backgroundColor = filterButton2Active ? "green" : "blue";
        applyFilters();
    });

    populateTable(jsonData);
    applyFilters();
}

// Fetch data and initialize the page
fetchData();
