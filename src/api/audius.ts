const BASE_URL = "https://discoveryprovider.audius.co/v1";

export async function fetchAudiusTracks(query = "lofi", limit = 20) {
  const res = await fetch(
    `${BASE_URL}/tracks/search?query=${query}&limit=${limit}&app_name=kawaify`
  );
  const data = await res.json();
  return data.data;
}
