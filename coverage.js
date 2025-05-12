   // Track the state of filter buttons
let filterButtonActive = false;
let jsonData = []; // Global variable to hold fetched JSON data

// Function to fetch data from JSON file
async function fetchData() {
    try {
        const response = await fetch("json/coverage.json"); // Adjust if your JSON file is in a different location
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
            "ME Name", "Day", "ECO", "BTD"
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
            "ME Name": document.getElementById("filter-me-name").value,
            "Day": document.getElementById("filter-day").value,
        };
        const searchQuery = document.getElementById("search-bar").value.toLowerCase();

        return (
            (filterValues["ME Name"] === "" || row["ME Name"] === filterValues["ME Name"]) &&
            (filterValues["Day"] === "" || row["Day"] === filterValues["Day"]) &&
            (searchQuery === "" ||
                row["HUL Code"].toLowerCase().includes(searchQuery) ||
                row["HUL Outlet Name"].toLowerCase().includes(searchQuery)) &&
            (!filterButtonActive || row["ECO"] < 1000)
        );
    });

    populateTable(filteredData);
    updateDropdowns(filteredData);
}

// Function to update dropdown options dynamically
function updateDropdowns(filteredData) {
    const dropdowns = {
        "filter-me-name": { header: "ME Name", values: new Set() },
        "filter-Day": { header: "Day", values: new Set() }
    };

    filteredData.forEach((row) => {
        if (row["ME Name"]) dropdowns["filter-me-name"].values.add(row["ME Name"]);
        if (row["Day"]) dropdowns["filter-Day"].values.add(row["Day"]);
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
    document.getElementById("filter-button").style.backgroundColor = "blue";

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

    document.getElementById("filter-button").addEventListener("click", () => {
        filterButton1Active = !filterButtonActive;
        document.getElementById("filter-button").style.backgroundColor = filterButton1Active ? "green" : "blue";
        applyFilters();
    });

    populateTable(jsonData);
    applyFilters();
}

// Fetch data and initialize the page
fetchData();