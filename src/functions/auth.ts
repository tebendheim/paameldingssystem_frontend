export const logout = async (): Promise<boolean> => {
  try {
    const res = await fetch("http://localhost:3000/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    return res.ok;
  } catch (err) {
    console.error("Feil ved utlogging:", err);
    return false;
  }
};