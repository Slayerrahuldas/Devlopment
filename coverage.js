let filterButtonActive = false;
let jsonData = [];

// Fetch and initialize data
async function fetchData() {
    try {
        const response = await fetch("coverage.json"); // Adjust if needed
        if (!response.ok) throw new Error("Failed to fetch data.");
        jsonData = await response.json();
        initialize();
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

// Populate table
function populateTable(data) {
    const tableBody = document.getElementById("table-body");
    tableBody.innerHTML = "";

    data.forEach((item, index) => {
        const row = document.createElement("tr");

        const serialCell = document.createElement("td");
        serialCell.textContent = data.length - index;
        row.appendChild(serialCell);

        const columns = ["HUL Code", "HUL Outlet Name", "ECO", "BTD", "Beat"];
        columns.forEach((key) => {
            const cell = document.createElement("td");
            cell.textContent = item[key] !== undefined ? item[key] : "";
            row.appendChild(cell);
        });

        tableBody.appendChild(row);
    });
}

// Apply filters and update table
function applyFilters() {
    const meName = document.getElementById("filter-me-name").value;
    const day = document.getElementById("filter-day").value;
    const searchQuery = document.getElementById("search-bar").value.toLowerCase();

    const filteredData = jsonData.filter((row) => {
        const ecoValue = parseFloat(row["ECO"]);

        return (
            (meName === "" || row["ME Name"] === meName) &&
            (day === "" || row["Day"] === day) &&
            (searchQuery === "" ||
                (row["HUL Code"] && row["HUL Code"].toLowerCase().includes(searchQuery)) ||
                (row["HUL Outlet Name"] && row["HUL Outlet Name"].toLowerCase().includes(searchQuery))) &&
            (!filterButtonActive || (!isNaN(ecoValue) && ecoValue < 1000))
        );
    });

    populateTable(filteredData);
    updateDropdowns(filteredData);
}

// Update dropdowns based on current data
function updateDropdowns(filteredData) {
    const meSet = new Set();
    const daySet = new Set();

    filteredData.forEach((row) => {
        if (row["ME Name"]) meSet.add(row["ME Name"]);
        if (row["Day"]) daySet.add(row["Day"]);
    });

    populateDropdown("filter-me-name", meSet, "ME Name");
    populateDropdown("filter-day", daySet, "Day");
}

// Helper to populate a select dropdown
function populateDropdown(id, optionsSet, headerName) {
    const dropdown = document.getElementById(id);
    const selectedValue = dropdown.value;
    dropdown.innerHTML = `<option value="">${headerName}</option>`;

    Array.from(optionsSet)
        .sort()
        .forEach((option) => {
            dropdown.innerHTML += `<option value="${option}" ${option === selectedValue ? "selected" : ""}>${option}</option>`;
        });
}

// Reset filters
function resetFilters() {
    filterButtonActive = false;
    document.getElementById("filter-button").style.backgroundColor = "#007bff";
    document.getElementById("search-bar").value = "";
    document.querySelectorAll("select").forEach((dropdown) => dropdown.value = "");
    applyFilters();
}

// Debounce helper
function debounce(func, delay = 300) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => func(...args), delay);
    };
}

// Initialize listeners and display
function initialize() {
    document.getElementById("reset-button").addEventListener("click", resetFilters);
    document.getElementById("search-bar").addEventListener("input", debounce(applyFilters));
    document.querySelectorAll("select").forEach(dropdown =>
        dropdown.addEventListener("change", applyFilters)
    );

    document.getElementById("filter-button").addEventListener("click", () => {
        filterButtonActive = !filterButtonActive;
        document.getElementById("filter-button").style.backgroundColor = filterButtonActive ? "green" : "#007bff";
        applyFilters();
    });

    populateTable(jsonData);
    applyFilters();
}

// Start process
fetchData();
