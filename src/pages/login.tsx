import React, { useState } from "react";
import type { ChangeEvent, JSX } from "react";
import axios, { AxiosError } from "axios";

function Login(): JSX.Element {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const login = async () => {
     console.log("Login-funksjon kalt");
    try {
      await axios.post(
        "http://localhost:3000/api/auth/login",
        { email, password },
        { withCredentials: true }
      );
      setMessage("Innlogging vellykket!");
    } catch (err) {
      const error = err as AxiosError;
      setMessage("Innlogging feilet");
      console.error("Login error:", error.message);
    }
  };

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value);
  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value);

  return (
    <>
      <h1>Login</h1>
      <input value={email} onChange={handleEmailChange} placeholder="Epost" />
      <input
        type="password"
        value={password}
        onChange={handlePasswordChange}
        placeholder="Passord"
      />
      <button onClick={login}>Logg inn</button>
      <p>{message}</p>
    </>
  );
}

export default Login;
