import { displayListings } from "./listing.mjs";
import { baseUrl } from "../auth/endpoints.mjs";

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

function handleSearch(inputElement) {
  const searchQuery = inputElement.value.trim();
  currentPage = 1;

  if (searchQuery) {
    searchListings(searchQuery, currentPage)
      .then((filteredListings) => {
        displayListings(filteredListings);
        const url = new URL(window.location);
        url.searchParams.set("search", searchQuery);
        window.history.pushState({}, "", url);

        document.getElementById("load-more-button").style.display = "block";
      })
      .catch((error) => {
        console.error("Search failed:", error);
      });
  } else {
    fetchListings().then((listings) =>
      displayListings(listings.slice(0, listingsPerPage))
    );
  }
}

async function loadMoreSearchResults(query) {
  currentPage++;
  try {
    const moreListings = await searchListings(query, currentPage);
    if (moreListings.length > 0) {
      displayListings(moreListings, true);
    }

    if (moreListings.length < listingsPerPage) {
      document.getElementById("load-more-button").style.display = "none";
    }
  } catch (error) {
    console.error("Error loading more search results:", error);
  }
}

export function initializeSearch() {
  const searchBars = [
    {
      input: document.getElementById("search-input-top"),
      button: document.getElementById("search-button-top"),
    },
    {
      input: document.getElementById("search-input-bottom"),
      button: document.getElementById("search-button-bottom"),
    },
  ];

  searchBars.forEach(({ input, button }) => {
    button.addEventListener("click", () => handleSearch(input));

    input.addEventListener("keypress", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        handleSearch(input);
      }
    });
  });

  document.getElementById("load-more-button").addEventListener("click", () => {
    const searchQuery = document
      .getElementById("search-input-top")
      .value.trim();
    if (searchQuery) {
      loadMoreSearchResults(searchQuery);
    }
  });

  const params = new URLSearchParams(window.location.search);
  const searchQuery = params.get("search");
  if (searchQuery) {
    document.getElementById("search-input-top").value = searchQuery;
    document.getElementById("search-input-bottom").value = searchQuery;
    handleSearch(document.getElementById("search-input-top"));
  }
}
