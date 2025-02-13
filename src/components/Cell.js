import { createEffect, onCleanup } from "../signals.js";

export const Cell = (props) => {
  const div = document.createElement("div");
  div.classList.add("cell");

  createEffect(() => {
    div.textContent = props.value ?? "";
  });

  createEffect(() => {
    if (!props.onClick || props.value) return;

    div.addEventListener("click", props.onClick);
    onCleanup(() => div.removeEventListener("click", props.onClick));
  });

  return div;
};
