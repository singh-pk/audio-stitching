import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { Theme } from "@radix-ui/themes";

import "@radix-ui/themes/styles.css";
import "./index.css";

import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Theme
      appearance="dark"
      accentColor="red"
      grayColor="slate"
      hasBackground
      panelBackground="translucent"
      radius="medium"
      scaling="100%"
      className="radix-themes-custom-fonts"
    >
      <App />
    </Theme>
  </StrictMode>,
);
