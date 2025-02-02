import { displayListings } from "./listing.mjs";
import { baseUrl } from "../auth/endpoints.mjs";

const prevPageBtn = document.getElementById("prev-page-button");
const nextPageBtn = document.getElementById("next-page-button");
const pageNumberDisplay = document.getElementById("page-number");

const listingsPerPage = 10;
let currentPage = 1;
let currentSort = "created";
let currentSortOrder = "desc";
let currentSearchQuery = "";

let paginationListenersAdded = false;

async function searchListings(
  query,
  page = 1,
  limit = listingsPerPage,
  sort = currentSort,
  sortOrder = currentSortOrder
) {
  const searchEndpoint = `${baseUrl}/auction/listings/search?q=${encodeURIComponent(query)}&limit=${limit}&page=${page}&sort=${sort}&sortOrder=${sortOrder}`;

  try {
    const response = await fetch(searchEndpoint);
    if (!response.ok) {
      throw new Error(`Failed to search listings: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error searching listings:", error);
    throw error;
  }
}

function redirectToSearch(searchQuery) {
  if (!searchQuery) return;

  let searchUrl;

  if (
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname === "localhost"
  ) {
    searchUrl = new URL(window.location.origin + "/index.html");
  } else {
    searchUrl = new URL(window.location.origin + "/semester-project-2/");
  }

  searchUrl.searchParams.set("search", searchQuery);
  window.location.href = searchUrl.toString();
}

async function executeSearch(query, page = 1) {
  if (!query) return;

  currentSearchQuery = query;
  currentPage = page;

  try {
    const results = await searchListings(query, currentPage);
    displayListings(results);
    updatePaginationButtons(results.length);
  } catch (error) {
    console.error("Search execution error:", error);
  }
}

function updatePaginationButtons(resultsLength) {
  if (pageNumberDisplay) {
    pageNumberDisplay.textContent = `Page ${currentPage}`;
  }

  if (prevPageBtn) {
    prevPageBtn.disabled = currentPage === 1;
  }

  if (nextPageBtn) {
    nextPageBtn.disabled = resultsLength < listingsPerPage;
  }
}

function addPaginationListeners() {
  if (paginationListenersAdded) return;

  prevPageBtn?.addEventListener("click", () =>
    changeSearchPage(currentPage - 1)
  );
  nextPageBtn?.addEventListener("click", () =>
    changeSearchPage(currentPage + 1)
  );

  paginationListenersAdded = true;
}

async function changeSearchPage(newPage) {
  if (newPage < 1) return;
  currentPage = newPage;

  console.log("Changing Page to:", currentPage);

  const url = new URL(window.location);
  url.searchParams.set("page", currentPage);
  window.history.pushState({}, "", url.toString());

  await executeSearch(currentSearchQuery, currentPage);
}

window.addEventListener("popstate", () => {
  const params = new URLSearchParams(window.location.search);
  const searchQuery = params.get("search") || "";
  const page = parseInt(params.get("page")) || 1;

  executeSearch(searchQuery, page);
});

export function initializeSearch() {
  const searchTop = document.getElementById("search-input-top");
  const searchBottom = document.getElementById("search-input-bottom");
  const searchButtonTop = document.getElementById("search-button-top");
  const searchButtonBottom = document.getElementById("search-button-bottom");

  if (!searchTop && !searchBottom) {
    return;
  }

  const searchBars = [
    { input: searchTop, button: searchButtonTop },
    { input: searchBottom, button: searchButtonBottom },
  ].filter(({ input, button }) => input && button);

  searchBars.forEach(({ input, button }) => {
    button.addEventListener("click", () =>
      redirectToSearch(input.value.trim())
    );
    input.addEventListener("keypress", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        redirectToSearch(input.value.trim());
      }
    });
  });

  const params = new URLSearchParams(window.location.search);
  const searchQuery = params.get("search");

  if (searchQuery) {
    if (searchTop) searchTop.value = searchQuery;
    if (searchBottom) searchBottom.value = searchQuery;
    executeSearch(searchQuery);
  }

  addPaginationListeners();
}
