let jsonData = [];
let pendingFilterActive = false;

// Fetch JSON data
async function fetchData() {
    try {
        const response = await fetch("launch.json"); // Adjust path if needed
        if (!response.ok) throw new Error("Failed to fetch data.");
        jsonData = await response.json();
        initialize();
    } catch (error) {
        console.error("Error loading data:", error);
    }
}

// Populate table with data
function populateTable(data) {
    const tableBody = document.getElementById("table-body");
    tableBody.innerHTML = "";

    data.forEach((item, index) => {
        const row = document.createElement("tr");

        const serialCell = document.createElement("td");
        serialCell.textContent = data.length - index;
        row.appendChild(serialCell);

        const columns = [
            "HUL Code",
            "HUL Outlet Name",
            "BasePack Desc",
            "Target (VMQ)",
            "Achv Qty",
            "Status",
            "Beat"
        ];

        columns.forEach(key => {
            const cell = document.createElement("td");
            cell.textContent = item[key] ?? "";
            row.appendChild(cell);
        });

        tableBody.appendChild(row);
    });
}

// Apply filters
function applyFilters() {
    const searchValue = document.getElementById("search-bar").value.toLowerCase();
    const meName = document.getElementById("filter-me-name").value;
    const day = document.getElementById("filter-day").value;
    const basePack = document.getElementById("filter-basepack-desc").value;

    const filtered = jsonData.filter(row => {
        const matchesSearch =
            !searchValue ||
            (row["HUL Code"] && row["HUL Code"].toLowerCase().includes(searchValue)) ||
            (row["HUL Outlet Name"] && row["HUL Outlet Name"].toLowerCase().includes(searchValue));

        const matchesFilters =
            (!meName || row["ME Name"] === meName) &&
            (!day || row["Day"] === day) &&
            (!basePack || row["BasePack Desc"] === basePack);

        const matchesPending =
            !pendingFilterActive || (row["Status"] && row["Status"].toLowerCase() === "pending");

        return matchesSearch && matchesFilters && matchesPending;
    });

    populateTable(filtered);
    updateDropdowns(filtered);
}

// Update dropdowns with unique filtered values
function updateDropdowns(data) {
    const sets = {
        "filter-me-name": new Set(),
        "filter-day": new Set(),
        "filter-basepack-desc": new Set()
    };

    data.forEach(row => {
        if (row["ME Name"]) sets["filter-me-name"].add(row["ME Name"]);
        if (row["Day"]) sets["filter-day"].add(row["Day"]);
        if (row["BasePack Desc"]) sets["filter-basepack-desc"].add(row["BasePack Desc"]);
    });

    for (const [id, values] of Object.entries(sets)) {
        populateDropdown(id, values, document.getElementById(id).options[0].text);
    }
}

// Populate a dropdown
function populateDropdown(id, valuesSet, defaultText) {
    const dropdown = document.getElementById(id);
    const current = dropdown.value;
    dropdown.innerHTML = `<option value="">${defaultText}</option>`;
    Array.from(valuesSet).sort().forEach(value => {
        const selected = value === current ? "selected" : "";
        dropdown.innerHTML += `<option value="${value}" ${selected}>${value}</option>`;
    });
}

// Reset all filters
function resetFilters() {
    pendingFilterActive = false;
    document.getElementById("filter-button").style.backgroundColor = "#007bff";
    document.getElementById("search-bar").value = "";
    document.querySelectorAll("select").forEach(dropdown => (dropdown.value = ""));
    applyFilters();
}

// Debounce utility
function debounce(fn, delay = 300) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn(...args), delay);
    };
}

// Initialize event listeners
function initialize() {
    document.getElementById("reset-button").addEventListener("click", resetFilters);
    document.getElementById("search-bar").addEventListener("input", debounce(applyFilters));
    document.querySelectorAll("select").forEach(dropdown =>
        dropdown.addEventListener("change", applyFilters)
    );

    document.getElementById("filter-button").addEventListener("click", () => {
        pendingFilterActive = !pendingFilterActive;
        document.getElementById("filter-button").style.backgroundColor = pendingFilterActive ? "green" : "#007bff";
        applyFilters();
    });

    populateTable(jsonData);
    applyFilters();
}

// Start everything
fetchData();
