let filterButtonActive = false;
let jsonData = [];

async function fetchData() {
    try {
        const response = await fetch("shikhar.json");
        if (!response.ok) throw new Error("Failed to fetch data.");
        jsonData = await response.json();
        initialize();
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

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
            "Status",
            "Shikhar",
            "BTD",
            "ME Name",
            "Beat",
            "Day"
        ];

        columns.forEach((key) => {
            const cell = document.createElement("td");
            cell.textContent = item[key] ?? "";
            row.appendChild(cell);
        });

        tableBody.appendChild(row);
    });
}

function applyFilters() {
    const meName = document.getElementById("filter-me-name").value;
    const day = document.getElementById("filter-day").value;
    const searchQuery = document.getElementById("search-bar").value.toLowerCase();

    let filteredData = jsonData.filter((row) => {
        return (
            (meName === "" || row["ME Name"] === meName) &&
            (day === "" || row["Day"] === day) &&
            (searchQuery === "" ||
                (row["HUL Code"] && row["HUL Code"].toLowerCase().includes(searchQuery)) ||
                (row["HUL Outlet Name"] && row["HUL Outlet Name"].toLowerCase().includes(searchQuery))) &&
            (!filterButtonActive || (row["Shikhar"] && parseFloat(row["Shikhar"]) < 500))
        );
    });

    populateTable(filteredData);
    updateDropdowns(filteredData);
}

function updateDropdowns(filteredData) {
    const dropdowns = {
        "filter-me-name": { header: "ME Name", values: new Set() },
        "filter-day": { header: "Day", values: new Set() }
    };

    filteredData.forEach((row) => {
        if (row["ME Name"]) dropdowns["filter-me-name"].values.add(row["ME Name"]);
        if (row["Day"]) dropdowns["filter-day"].values.add(row["Day"]);
    });

    Object.keys(dropdowns).forEach((id) => {
        populateSelectDropdown(id, dropdowns[id].values, dropdowns[id].header);
    });
}

function populateSelectDropdown(id, optionsSet, headerName) {
    const dropdown = document.getElementById(id);
    const selectedValue = dropdown.value;
    dropdown.innerHTML = `<option value="">${headerName}</option>`;
    optionsSet.forEach((option) => {
        dropdown.innerHTML += `<option value="${option}" ${option === selectedValue ? "selected" : ""}>${option}</option>`;
    });
}

function resetFilters() {
    filterButtonActive = false;
    document.getElementById("filter-button").style.backgroundColor = "#007bff";

    document.getElementById("search-bar").value = "";
    document.querySelectorAll("select").forEach((dropdown) => dropdown.value = "");

    applyFilters();
}

function debounce(func, delay = 300) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => func(...args), delay);
    };
}

function initialize() {
    document.getElementById("reset-button").addEventListener("click", resetFilters);
    document.getElementById("search-bar").addEventListener("input", debounce(applyFilters));
    document.querySelectorAll("select").forEach((dropdown) => {
        dropdown.addEventListener("change", applyFilters);
    });

    document.getElementById("filter-button").addEventListener("click", () => {
        filterButtonActive = !filterButtonActive;
        document.getElementById("filter-button").style.backgroundColor = filterButtonActive ? "green" : "#007bff";
        applyFilters();
    });

    populateTable(jsonData);
    applyFilters();
}

fetchData();
