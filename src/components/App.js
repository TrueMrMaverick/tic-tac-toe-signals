import { createSignal, createEffect } from "../signals";
import { Grid } from "./Grid";

export const App = () => {
  const [activePlayer, setActivePlayer] = createSignal("x");
  const [winner, setWinner] = createSignal(null);
  const handleSwitchPlayer = () =>
    setActivePlayer((prev) => (prev === "x" ? "o" : "x"));

  const container = document.createElement("div");

  const activePlayerEl = document.createElement("span");
  createEffect(() => {
    if (winner()) {
      activePlayerEl.textContent = `Winner is ${winner().toUpperCase()}`;
      return;
    }
    activePlayerEl.textContent = `Active Player: ${activePlayer()}`;
  });

  container.replaceChildren(
    activePlayerEl,
    Grid({
      size: 3,
      get activePlayer() {
        return activePlayer();
      },
      switchActivePlayer: handleSwitchPlayer,
      onWinnerChange: setWinner,
    }),
  );

  return container;
};
