import { createRoot } from "./signals";
import { App } from "./components/App";

const root = document.getElementById("root");

createRoot(() => {
  root.replaceChildren(App());
});
