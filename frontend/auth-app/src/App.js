import React, { useEffect, useState } from "react";
import "./App.css";
import Signup from "./signup/Signup";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./login/Login";
import Home from "./Home";
import {
  MsalProvider,
  useMsal,
} from "@azure/msal-react";
import { PublicClientApplication } from "@azure/msal-browser";

const msalConfig = {
  auth: {
    clientId: "fbd7ecad-db75-4997-908c-71a08350d5fc", // Replace with your actual client ID
    authority: "https://login.microsoftonline.com/e9145863-b1af-4104-8a4d-760871f83010", // Replace with your tenant ID
    redirectUri: "http://localhost:3000/", // Replace with your redirect URI
  },
  cache: {
    cacheLocation: "sessionStorage", // Use sessionStorage for caching tokens (more secure)
  }
};

const msalInstance = new PublicClientApplication(msalConfig);

// Auth Context for managing authentication state
const AuthContext = React.createContext();

const AuthProvider = ({ children }) => {
  const { instance, accounts, inProgress } = useMsal();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(null);

  // Handle MSAL authentication
  useEffect(() => {
    if (inProgress === "none") {
      if (accounts.length > 0) {
        const activeAccount = accounts[0];
        instance.setActiveAccount(activeAccount); // Set active account

        instance.acquireTokenSilent({
          account: activeAccount, // Provide the active account
          scopes: ["User.Read"]
        })
          .then(response => {
            setToken(response.accessToken);
            setIsAuthenticated(true);
          })
          .catch(error => {
            if (error.errorCode === "interaction_required") {
              instance.loginPopup({ scopes: ["User.Read"] })
                .then(response => {
                  setToken(response.accessToken);
                  setIsAuthenticated(true);
                })
                .catch(err => {
                  console.error("Popup login failed:", err);
                  setIsAuthenticated(false);
                });
            } else {
              console.error("Silent token acquisition failed:", error);
              setIsAuthenticated(false);
            }
          });
      } else if (localStorage.getItem("token")) {
        setIsAuthenticated(true);
        setToken(localStorage.getItem("token"));
      } else {
        setIsAuthenticated(false);
        setToken(null);
      }
    }
  }, [accounts, inProgress, instance]);

  // Handle local logout
  const handleLocalLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setToken(null);
  };

  // Handle MSAL logout
  const handleMSALLogout = () => {
    instance.logoutPopup()
      .then(() => {
        localStorage.removeItem("token"); // Clear local token
        setIsAuthenticated(false);
        setToken(null);
      })
      .catch(e => {
        console.error("MSAL logout failed:", e);
      });
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, token, handleLocalLogout, handleMSALLogout }}>
      {children}
    </AuthContext.Provider>
  );
};

// ProtectedRoute component to guard routes
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = React.useContext(AuthContext);
  const { accounts, instance } = useMsal();

  useEffect(() => {
    if (accounts.length > 0) {
      instance.setActiveAccount(accounts[0]); // Ensure active account is set
    }
  }, [accounts, instance]);

  return isAuthenticated ? children : <Navigate to="/Login" replace />;
};

function App() {
  const [token, setToken] = useState(null); // ✅ Define token state

  return (
    <MsalProvider instance={msalInstance}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route
              path="/Home"
              element={
                <ProtectedRoute>
                  <Home setToken={setToken} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/Login"
              element={
                <Login />
              }
            />
            <Route
              path="/Signup"
              element={
                <Signup />
              }
            />
            <Route path="/" element={<Navigate to="/Login" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </MsalProvider>
  );
}

export default App;