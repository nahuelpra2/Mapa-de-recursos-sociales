import React from "react";
import ReactDOM from "react-dom/client";
import "leaflet/dist/leaflet.css";
import "./index.css";
import { DataLoadErrorBoundary, DataLoadErrorFallback } from "./components/DataLoadErrorBoundary";

const root = ReactDOM.createRoot(document.getElementById("root")!);

import("./App")
  .then(({ default: App }) => {
    root.render(
      <React.StrictMode>
        <DataLoadErrorBoundary>
          <App />
        </DataLoadErrorBoundary>
      </React.StrictMode>
    );
  })
  .catch((error: unknown) => {
    root.render(
      <React.StrictMode>
        <DataLoadErrorFallback error={error} />
      </React.StrictMode>
    );
  });
