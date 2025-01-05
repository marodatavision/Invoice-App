import React, { useState } from 'react';
import CryptoJS from 'crypto-js';
import config from '../assets/config.json';

const LoginForm = ({ onLoginSuccess }) => {
  const [token, setToken] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = () => {
    try {
      // Entschlüssele das gespeicherte Passwort aus der config.json
      const decryptedPassword = config.decryptedPassword;

      // Entschlüssele das eingegebene Token
      const inputPassword = CryptoJS.AES.decrypt(token, config.encryptionKey).toString(
        CryptoJS.enc.Utf8
      );

      // Überprüfe, ob die Passwörter übereinstimmen
      if (inputPassword === decryptedPassword) {
        setMessage('Anmeldung erfolgreich!');
        onLoginSuccess(); // Callback aufrufen
      } else {
        setMessage('Ungültiges Token. Bitte erneut versuchen.');
      }
    } catch (error) {
      setMessage('Fehler bei der Verarbeitung des Tokens.');
      console.error(error);
    }
  };

  return (
    <div className="container mt-4">
      <h2>Anmeldung</h2>
      <div className="mb-3">
        <label htmlFor="token" className="form-label">
          Token eingeben
        </label>
        <input
          type="text"
          className="form-control"
          id="token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />
      </div>
      <button className="btn btn-primary" onClick={handleLogin}>
        Anmelden
      </button>
      {message && <p className="mt-3">{message}</p>}
    </div>
  );
};

export default LoginForm;
