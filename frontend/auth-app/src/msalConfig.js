import { PublicClientApplication } from "@azure/msal-browser";

export const msalConfig = {
    auth: {
        clientId: "fbd7ecad-db75-4997-908c-71a08350d5fc",
        authority: "https://login.microsoftonline.com/e9145863-b1af-4104-8a4d-760871f83010",
        redirectUri: "http://localhost:3000/", // Replace with your redirect URI
    },
    cache: {
        cacheLocation: "localStorage",
        storeAuthStateInCookie: true,
    },
};

export const msalInstance = new PublicClientApplication(msalConfig);
