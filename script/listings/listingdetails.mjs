import { accessToken } from "../auth/api.mjs";
import { allListings } from "../auth/endpoints.mjs";
import { authFetch } from "../auth/fetch.mjs";

function getQueryParam(param) {
  const params = new URLSearchParams(window.location.search);
  return params.get(param);
}

async function fetchListingDetails() {
  const listingId = getQueryParam("id");
  console.log(listingId);
  if (!listingId) {
    document.getElementById("details-container").innerHTML =
      "<p class='text-danger'>No listing ID provided in the URL.</p>";
    return;
  }

  try {
    const response = await authFetch(
      `${allListings}/${listingId}?_seller=true&_bids=true`
    );
    if (!response.ok) {
      throw new Error(`Error fetching listing: ${response.statusText}`);
    }

    const listing = await response.json();
    console.log("data", listing.data);
    displayListingDetails(listing.data);
  } catch (error) {
    document.getElementById("details-container").innerHTML =
      "<p class='text-danger'>Failed to load listing details.</p>";
    console.error(error);
  }
}

function displayListingDetails(listing) {
  const container = document.getElementById("details-container");

  const imageUrl = listing.media?.[0]?.url || "https://via.placeholder.com/150";
  const imageAlt = listing.media?.[0]?.alt || "No image available";

  const highestBid =
    listing.bids?.length > 0
      ? Math.max(...listing.bids.map((bid) => bid.amount))
      : "No bids yet";

  container.innerHTML = `
        <div class="card align-items-center my-4">
            <img src="${imageUrl}" class="card-img-top align-self-center" alt="${imageAlt}">
            <div class="card-body">
                <h5 class="card-title">${listing.title}</h5>
                <p class="card-text">${listing.description || "No description available."}</p>
                <p><strong>Ends:</strong> ${new Date(listing.endsAt).toLocaleString()}</p>
                <p><strong>Created:</strong> ${new Date(listing.created).toLocaleString()}</p>
                <p><strong>Total Bids:</strong> ${listing.bids?.length || 0}</p>
                ${accessToken ? `<p><strong>Highest Bid:</strong> ${highestBid}</p>` : ""}
                <p><strong>Seller:</strong> <a href="../profile/index.html?name=${listing.seller.name}">${listing.seller.name}</a></p>
                ${renderBidSection(listing)}
                ${!accessToken ? `<button class="btn btn-secondary mt-3" onclick="window.history.back()">Back</button>` : ""}
            </div>
        </div>
    `;
}

function renderBidSection(listing) {
  if (!accessToken) {
    return "<p class='text-danger'>Log in to place a bid.</p>";
  }

  return `
    <div class="mt-4 container text-center">
      <h6>Place a Bid</h6>
      <form id="bid-form">
        <div class="mb-3">
          <input type="number" id="bid-amount" class="form-control" placeholder="Enter your bid" min="1" required>
        </div>
        <button type="submit" class="btn btn-primary">Submit</button>
      </form>
    </div>
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  fetchListingDetails();

  document.addEventListener("submit", async (event) => {
    if (event.target.id === "bid-form") {
      event.preventDefault();

      const listingId = getQueryParam("id");
      const bidAmount = parseInt(
        document.getElementById("bid-amount").value,
        10
      );
      if (isNaN(bidAmount) || bidAmount <= 0) {
        alert("Please enter a valid bid amount.");
        return;
      }

      try {
        const response = await authFetch(`${allListings}/${listingId}/bids`, {
          method: "POST",
          body: JSON.stringify({ amount: bidAmount }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            `Error placing bid: ${errorData.message || response.statusText}`
          );
        }

        alert("Bid placed successfully!");
        fetchListingDetails();
      } catch (error) {
        console.error("Error placing bid:", error);
        alert("Failed to place bid. Please try again.");
      }
    }
  });
});
