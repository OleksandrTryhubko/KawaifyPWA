import { updateUserProfileFields } from "../../services/firestoreService";

/** Placeholder — full account CRUD coming later */
export async function updateDisplayName(
  userId: string,
  displayName: string
): Promise<void> {
  await updateUserProfileFields(userId, { displayName });
}
