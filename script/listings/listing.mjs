import { baseUrl } from "../auth/endpoints.mjs";
import { initializeSearch } from "./search.mjs";

const sortBtn = document.getElementById("sort-listings");
const prevPageBtn = document.getElementById("prev-page-button");
const nextPageBtn = document.getElementById("next-page-button");
const pageNumberDisplay = document.getElementById("page-number");

let allListings = [];
let currentPage = 1;
const listingsPerPage = 10;
let currentSort = "created";
let currentSortOrder = "desc";

async function fetchListings(
  page = 1,
  limit = listingsPerPage,
  sort = currentSort,
  sortOrder = currentSortOrder
) {
  const listingsUrl = `${baseUrl}/auction/listings?limit=${limit}&page=${page}&sort=${sort}&sortOrder=${sortOrder}`;

  try {
    const response = await fetch(listingsUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch listings: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching listings:", error);
    throw error;
  }
}

function shortenText(text, maxLength) {
  if (!text) return "No description available.";
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
}

export function displayListings(listings) {
  const container = document.getElementById("card-container");
  container.innerHTML = "";

  const row = document.createElement("div");
  row.className = "row g-3";

  listings.forEach((listing) => {
    const col = document.createElement("div");
    col.className = "col-12 col-md-6 col-lg-4";

    const imageUrl =
      listing.media?.[0]?.url || "https://via.placeholder.com/150";
    const imageAlt = listing.media?.[0]?.alt || "No image available";

    col.innerHTML = `
            <div class="card d-flex h-100">
                <div class="img-container">
                    <img src="${imageUrl}" class="card-img-top" alt="${shortenText(imageAlt, 5)}">
                </div>
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${shortenText(listing.title, 20)}</h5>
                    <p class="card-text">${shortenText(listing.description, 50)}</p>
                    
                    <div class="mt-auto d-flex justify-content-between text-muted">
                        <small><strong>Created:</strong> ${new Date(listing.created).toLocaleDateString()}</small>
                        <small><strong>Ends:</strong> ${new Date(listing.endsAt).toLocaleDateString()}</small>
                    </div>

                    <button class="btn btn-primary listingbtn mt-3 align-self-center" data-id="${listing.id}">View Listing</button>
                </div>
            </div>
        `;

    row.appendChild(col);
  });

  container.appendChild(row);

  document.querySelectorAll(".listingbtn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const listingId = e.target.getAttribute("data-id");
      location.href = `./listingdetails/index.html?id=${listingId}`;
    });
  });

  updatePaginationButtons();
}

async function changePage(newPage) {
  if (newPage < 1) return;
  currentPage = newPage;

  try {
    const listings = await fetchListings(currentPage);
    displayListings(listings);
  } catch (error) {
    console.error("Error loading page:", error);
  }
}

function updatePaginationButtons() {
  if (pageNumberDisplay) {
    pageNumberDisplay.textContent = `Page ${currentPage}`;
  }

  if (prevPageBtn) {
    prevPageBtn.disabled = currentPage === 1;
  }

  if (nextPageBtn) {
    nextPageBtn.disabled = allListings.length < listingsPerPage;
  }
}

async function sortAndDisplayListings(sortField) {
  currentSort = sortField;
  currentPage = 1;
  try {
    const sortedListings = await fetchListings(currentPage);
    displayListings(sortedListings);
  } catch (error) {
    console.error("Error sorting listings:", error);
  }
}

if (sortBtn) {
  sortBtn.addEventListener("change", async (event) => {
    const selectedValue = event.target.value;
    switch (selectedValue) {
      case "newest":
        currentSortOrder = "desc";
        sortAndDisplayListings("created");
        break;
      case "oldest":
        currentSortOrder = "asc";
        sortAndDisplayListings("created");
        break;
      case "ending-soon":
        currentSortOrder = "asc";
        sortAndDisplayListings("endsAt");
        break;
      default:
        currentSortOrder = "desc";
        sortAndDisplayListings("created");
    }
  });
}

if (prevPageBtn) {
  prevPageBtn.addEventListener("click", () => changePage(currentPage - 1));
}

if (nextPageBtn) {
  nextPageBtn.addEventListener("click", () => changePage(currentPage + 1));
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    await initializeSearch();
    allListings = await fetchListings(currentPage);
    displayListings(allListings);
  } catch (error) {
    console.error("Error initializing listings:", error);
  }
});
