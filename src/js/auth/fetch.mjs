/**
 * Asynchronously performs a fetch request with the provided URL and options.
 * This function automatically adds the appropriate headers, including authentication
 * and content type headers, if necessary.
 *
 * @param {string} url - The URL to which the fetch request is sent.
 * @param {object} [options={}] - The options object to customize the fetch request.
 *  Supports all the options available for the Fetch API, such as method, headers, body, etc.
 * @returns {Promise<Response>} - A promise that resolves to the response of the fetch request.
 * @async
 */
export async function authFetch(url, options = {}) {
  return fetch(url, {
    ...options,
    headers: headers(Boolean(options.body)),
  });
}

export const APIKey = "6451878b-0eb6-4b53-aa3b-9a9044eb145a";
export const accessToken = localStorage.getItem("accessToken");

export function headers(hasBody = false) {
  const headers = new Headers();

  if (accessToken) {
    headers.append("Authorization", `Bearer ${accessToken}`);
  }
  if (APIKey) {
    headers.append("X-Noroff-API-Key", APIKey);
  }
  if (hasBody) {
    headers.append("Content-Type", "application/json");
  }

  return headers;
}
