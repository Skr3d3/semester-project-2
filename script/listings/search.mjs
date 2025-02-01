import { displayListings } from "./listing.mjs";
import { baseUrl } from "../auth/endpoints.mjs";

const loadMoreBtn = document.getElementById("load-more-button");

const listingsPerPage = 10;
let currentPage = 1;
let currentSort = "created";
let currentSortOrder = "desc";

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

function redirectToSearch(query) {
  let searchUrl = new URL(
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname === "localhost"
      ? window.location.origin + "/index.html"
      : window.location.origin + "/semester-project-2/"
  );

  searchUrl.searchParams.set("search", query);
  window.location.href = searchUrl.toString();
}

async function executeSearch(query) {
  if (!query) return;

  try {
    const results = await searchListings(query, currentPage);
    displayListings(results);

    if (results.length < listingsPerPage) {
      loadMoreBtn.style.display = "none";
    } else {
      loadMoreBtn.style.display = "block";
    }
  } catch (error) {
    console.error("Search execution error:", error);
  }
}

export function initializeSearch() {
  console.log("Search script loaded");

  const searchTop = document.getElementById("search-input-top");
  const searchBottom = document.getElementById("search-input-bottom");
  const searchButtonTop = document.getElementById("search-button-top");
  const searchButtonBottom = document.getElementById("search-button-bottom");

  searchButtonTop.addEventListener("click", () => {
    console.log("Well.. That worked!");
  });

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
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener("click", () => {
      const searchQuery = document
        .getElementById("search-input-top")
        .value.trim();
      if (searchQuery) {
        currentPage++;
        executeSearch(searchQuery);
      }
    });
  }
}
