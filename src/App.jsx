import React, {useState} from 'react';
import InvoiceForm from './components/InvoiceForm';
import LoginForm from './components/LoginForm';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Funktion, die bei erfolgreicher Anmeldung aufgerufen wird
  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  return (
    <div>
      {!isAuthenticated ? (
        <LoginForm onLoginSuccess={handleLoginSuccess} />
      ) : (
        <div>
          <InvoiceForm />
        </div>
      )}
    </div>
  );
};

export default App;
