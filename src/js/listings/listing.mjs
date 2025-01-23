import { baseUrl } from "../auth/endpoints.mjs";

async function fetchListings() {
  const listingsEndpoint = `${baseUrl}/auction/listings`;

  try {
    const response = await fetch(listingsEndpoint);
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

function filterListings(searchQuery, listings) {
  searchQuery = searchQuery.toLowerCase();
  return listings.filter((listing) => {
    return (
      listing.title.toLowerCase().includes(searchQuery) ||
      (listing.description &&
        listing.description.toLowerCase().includes(searchQuery))
    );
  });
}

function displayListings(listings) {
  const container = document.getElementById("card-container");
  container.innerHTML = "";

  const row = document.createElement("div");
  row.className = "row g-3";

  listings.forEach((listing) => {
    const col = document.createElement("div");
    col.className = "col-12 col-md-6 col-lg-4";

    function shortenText(text, maxLength) {
      if (!text) return "No description available.";
      return text.length > maxLength
        ? text.substring(0, maxLength) + "..."
        : text;
    }

    col.innerHTML = `
            <div class="card d-flex h-100">
                <div class="card-body d-flex flex-row align-items-center gap-3">
                    <img src="${listing.media?.[0] || "https://via.placeholder.com/150"}" class="card-img-top" alt="${shortenText(listing.title, 5)}">
                    <div>
                    <h5 class="card-title">${shortenText(listing.title, 20)}</h5>
                    <p class="card-text">${shortenText(listing.description, 50)}</p>
                    <p class="card-text"><small class="text-muted">Ends: ${new Date(listing.endsAt).toLocaleString()}</small></p>
                    <p class="card-text"><small class="text-muted">${new Date(listing.created).toLocaleString()}</small></p>
                    </div>
                    <button class="btn btn-primary listingbtn h-50" data-id="${listing.id}">View Listing</button>
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
}

document.addEventListener("DOMContentLoaded", async () => {
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

  try {
    const allListings = await fetchListings();

    searchBars.forEach(({ input, button }) => {
      const performSearch = () => {
        const search = input.value.trim();
        const filteredListings = filterListings(search, allListings);
        displayListings(filteredListings);
        const url = new URL(window.location);
        url.searchParams.set("search", search);
        window.history.pushState({}, "", url);
      };

      button.addEventListener("click", performSearch);

      input.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          performSearch();
        }
      });
    });

    const params = new URLSearchParams(window.location.search);
    const searchQuery = params.get("search");
    if (searchQuery) {
      const filteredListings = filterListings(searchQuery, allListings);
      displayListings(filteredListings);
      document.getElementById("search-input-top").value = searchQuery;
      document.getElementById("search-input-bottom").value = searchQuery;
    } else {
      displayListings(allListings);
    }
  } catch (error) {
    console.error("Error initializing listings:", error);
  }
});
