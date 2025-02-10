// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import App from './App';
// import { PublicClientApplication } from '@azure/msal-browser';
// import msalConfig from "../src/App"

// const msalInstance = new PublicClientApplication(msalConfig);

// const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(
//   <React.StrictMode>
//     <App instance={msalInstance} /> 
//   </React.StrictMode>
// );

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Your main App component
import { PublicClientApplication } from '@azure/msal-browser';
import { msalConfig } from '../src/msalConfig'; // Ensure this points to the correct config file

// Initialize MSAL instance
const msalInstance = new PublicClientApplication(msalConfig);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App instance={msalInstance} />
  </React.StrictMode>
);


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals