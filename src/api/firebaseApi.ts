// import { ref, get } from "firebase/database";
// import { database } from "../lib/firebase";

// export async function fetchPlaylists() {
//   const snapshot = await get(ref(database, "playlists"));
//   if (snapshot.exists()) {
//     const data = snapshot.val();
//     return Object.values(data); // повертаємо масив плейлістів
//   } else {
//     return [];
//   }
// }
