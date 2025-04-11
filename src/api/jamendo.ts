const JAMENDO_API = 'https://api.jamendo.com/v3.0/tracks';
const CLIENT_ID = import.meta.env.VITE_JAMENDO_CLIENT_ID;

export async function fetchJamendoTracks() {
  const res = await fetch(
    `${JAMENDO_API}?client_id=${CLIENT_ID}&format=json&limit=10&include=musicinfo+stats&audioformat=mp32`
  );
  const data = await res.json();
  return data.results;
}