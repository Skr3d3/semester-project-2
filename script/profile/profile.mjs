import { accessToken } from "../auth/api.mjs";
import { baseUrl } from "../auth/endpoints.mjs";
import { authFetch } from "../auth/fetch.mjs";

async function fetchProfile(name) {
  if (!name) {
    console.log("Profile name not applicable. Skipping profile fetch.");
    return;
  }
  const profileEndpoint = `${baseUrl}/auction/profiles/${name}`;

  try {
    const response = await authFetch(profileEndpoint);
    if (!response.ok) {
      throw new Error(`Failed to fetch profile: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching profile:", error);
    throw error;
  }
}

async function fetchUserListings(name) {
  if (!name) {
    console.log("Profile listings not applicable. Skipping listing fetch.");
    return;
  }
  const listingsEndpoint = `${baseUrl}/auction/profiles/${name}/listings`;

  try {
    const response = await authFetch(listingsEndpoint);
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

function displayListings(listings) {
  const listingsContainer = document.getElementById("listings-container");

  if (!listingsContainer) {
    return;
  }

  listingsContainer.innerHTML = "";

  listings.forEach((listing) => {
    const listingElement = document.createElement("div");
    listingElement.className = "card mb-3";
    listingElement.innerHTML = `
      <div class="card-body">
        <h5 class="card-title">${listing.title}</h5>
        <p class="card-text">${listing.description || "No description available."}</p>
        <p class="card-text"><small class="text-muted">Ends at: ${new Date(listing.endsAt).toLocaleString()}</small></p>
      </div>
    `;
    listingsContainer.appendChild(listingElement);
  });
}

function displayProfile(profile) {
  const profileContainer = document.getElementById("profile-container");

  if (!profileContainer) {
    return;
  }

  const tokenPayload = accessToken
    ? JSON.parse(atob(accessToken.split(".")[1]))
    : null;
  const loggedInUser = tokenPayload ? tokenPayload.name : null;

  const isOwnProfile = loggedInUser === profile.name;

  profileContainer.innerHTML = `
      <div class="profile-banner">
        <img id="banner-img" src="${profile.banner.url}" alt="${profile.banner.alt}" class="img-fluid">
      </div>
      <div class="profile-avatar text-center my-4">
        <img id="avatar-img" src="${profile.avatar.url}" alt="${profile.avatar.alt}" class="rounded-circle" style="width: 150px; height: 150px;">
      </div>
      <h1 class="text-center">${profile.name}</h1>
      <p class="text-center text-muted">${profile.bio || "No bio available."}</p>
      <div class="profile-details text-center my-4">
        <p><strong>Email:</strong> ${profile.email}</p>
        <p><strong>Credits:</strong> ${profile.credits}</p>
        <p><strong>Listings:</strong> ${profile._count.listings}</p>
        <p><strong>Wins:</strong> ${profile._count.wins}</p>
      </div>

      ${
        isOwnProfile
          ? `<form id="profile-update-form" class="mt-4">
              <div class="mb-3">
                <label for="avatar-url" class="form-label">Avatar URL:</label>
                <input type="url" id="avatar-url" class="form-control" value="${profile.avatar.url}">
              </div>
              <div class="mb-3">
                <label for="banner-url" class="form-label">Banner URL:</label>
                <input type="url" id="banner-url" class="form-control" value="${profile.banner.url}">
              </div>
              <div class="mb-3">
                <label for="bio" class="form-label">Bio:</label>
                <textarea id="bio" class="form-control">${profile.bio || ""}</textarea>
              </div>
              <button type="submit" class="btn btn-primary">Update Profile</button>
            </form>`
          : ""
      }

      <div id="listings-container" class="mt-5"></div>
    `;

  if (isOwnProfile) {
    document
      .getElementById("profile-update-form")
      .addEventListener("submit", (event) => {
        event.preventDefault();
        updateProfile(profile.name);
      });
  }
}

async function updateProfile(name) {
  const avatarUrl = document.getElementById("avatar-url").value.trim();
  const bannerUrl = document.getElementById("banner-url").value.trim();
  const bio = document.getElementById("bio").value.trim();

  if (!avatarUrl && !bannerUrl && !bio) {
    alert("Please provide at least one field to update.");
    return;
  }

  const profileUpdateData = {
    ...(bio && { bio }),
    ...(avatarUrl && { avatar: { url: avatarUrl, alt: `${name}'s avatar` } }),
    ...(bannerUrl && { banner: { url: bannerUrl, alt: `${name}'s banner` } }),
  };

  try {
    const updateEndpoint = `${baseUrl}/auction/profiles/${name}`;
    const response = await authFetch(updateEndpoint, {
      method: "PUT",
      body: JSON.stringify(profileUpdateData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.errors?.[0]?.message || "Failed to update profile"
      );
    }

    alert("Profile updated successfully!");
    fetchProfile(name).then(displayProfile);
  } catch (error) {
    console.error("Error updating profile:", error);
    alert(
      "Failed to update profile. Please check the image URLs and try again."
    );
  }
}

export async function displayUserCredits() {
  const apiNumberElement = document.getElementById("api-number");

  if (!accessToken || !apiNumberElement) {
    apiNumberElement.style.display = "none";
    return;
  }

  try {
    const payload = JSON.parse(atob(accessToken.split(".")[1]));
    const userName = payload.name;

    const profile = await fetchProfile(userName);

    apiNumberElement.textContent = `Credits: ${profile.credits}`;
    apiNumberElement.style.display = "block";
  } catch (error) {
    console.error("Failed to fetch or display user credits:", error);
    apiNumberElement.style.display = "none";
  }
}

export async function initializeProfilePage() {
  const params = new URLSearchParams(window.location.search);
  const profileName = params.get("name");
  const profileContainer = document.getElementById("profile-container");

  if (!profileName) {
    if (profileContainer) {
      console.error("Profile name not provided in the URL");
      profileContainer.innerHTML =
        "<p class='text-danger'>Profile not found.</p>";
      return;
    }
  }

  try {
    const profile = await fetchProfile(profileName);
    displayProfile(profile);

    const listings = await fetchUserListings(profileName);
    displayListings(listings);

    console.log("listings", listings);

    const profileUpdateForm = document.getElementById("profile-update-form");

    if (profileUpdateForm) {
      profileUpdateForm.addEventListener("submit", (event) => {
        event.preventDefault();
        updateProfile(profileName);
      });
    }
  } catch (error) {
    if (profileContainer) {
      profileContainer.innerHTML =
        "<p class='text-danger'>Failed to load profile data.</p>";
    }
  }
}
export function setProfileButton() {
  if (!accessToken) {
    console.error("User is not logged in");
    return;
  }

  try {
    const payload = JSON.parse(atob(accessToken.split(".")[1]));
    const userName = payload.name;

    const profileButton = document.getElementById("profile-btn");
    if (profileButton) {
      profileButton.href = `../profile/index.html?name=${userName}`;
    }
  } catch (error) {
    console.error("Failed to decode token or set profile button:", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initializeProfilePage();
});
