import React from "react";
import ReactDOM from "react-dom";
import App from "./components/DataTable/DataTable";
import "@progress/kendo-theme-default/dist/all.scss";
import "@atlaskit/css-reset";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
const queryClient = new QueryClient();

ReactDOM.render(
  <QueryClientProvider client={queryClient}>
  <React.StrictMode>
    <App />
  </React.StrictMode>
  </QueryClientProvider>,
  document.getElementById("root")
);
