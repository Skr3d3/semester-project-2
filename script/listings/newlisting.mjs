import { baseUrl } from "../auth/endpoints.mjs";
import { authFetch } from "../auth/fetch.mjs";

document
  .getElementById("create-listing-form")
  .addEventListener("submit", async (event) => {
    event.preventDefault();

    const title = document.getElementById("title").value.trim();
    const description = document.getElementById("description").value.trim();
    const tags = document
      .getElementById("tags")
      .value.split(",")
      .map((tag) => tag.trim());
    const mediaInput = document.getElementById("media").value.trim();
    const media = mediaInput
      ? mediaInput
          .split(",")
          .map((url) => ({ url: url.trim(), alt: `Image for ${title}` }))
      : [];
    const endsAt = document.getElementById("endsAt").value;

    if (!title || !endsAt) {
      alert("Title and end date are required.");
      return;
    }

    const listingData = {
      title,
      description,
      tags,
      media,
      endsAt: new Date(endsAt).toISOString(),
    };

    try {
      const response = await authFetch(`${baseUrl}/auction/listings`, {
        method: "POST",
        body: JSON.stringify(listingData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Error creating listing: ${errorData.message || response.statusText}`
        );
      }

      alert("Listing created successfully!");
      window.location.href = "./index.html";
    } catch (error) {
      console.error("Error creating listing:", error);
      alert("Failed to create listing. Please try again.");
    }
  });
