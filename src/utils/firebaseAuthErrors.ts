const AUTH_ERROR_MESSAGES: Record<string, string> = {
  "auth/invalid-credential": "Невірна пошта або пароль",
  "auth/wrong-password": "Невірна пошта або пароль",
  "auth/user-not-found": "Невірна пошта або пароль",
  "auth/email-already-in-use": "Акаунт з такою поштою вже існує",
  "auth/weak-password": "Пароль занадто слабкий",
  "auth/invalid-email": "Некоректна email адреса",
  "auth/too-many-requests": "Забагато спроб. Спробуй пізніше.",
  "auth/network-request-failed": "Проблема з мережею. Перевір з'єднання.",
};

export function getFirebaseAuthErrorMessage(error: unknown): string {
  const code =
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as { code: string }).code === "string"
      ? (error as { code: string }).code
      : "";

  return AUTH_ERROR_MESSAGES[code] ?? "Щось пішло не так. Спробуй ще раз.";
}
