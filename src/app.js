import {
  createSignal,
  createRoot,
  createEffect,
  createMemo,
  onCleanup,
} from "./signals";

const root = document.getElementById("root");

const Cell = (props) => {
  const div = document.createElement("div");
  div.classList.add('cell');

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

const Grid = (props) => {
  const container = document.createElement("div");
  container.classList.add('grid');

  const gridValues = createMemo(() =>
    new Array(props.size * props.size).fill(null).map(() => createSignal(null)),
  );

  createEffect(() => {
    const cells = [];
    for (let i = 0; i < props.size; i++) {
      for (let j = 0; j < props.size; j++) {
        const index = i * props.size + j;
        const [value, setValue] = gridValues()[index];
        cells.push(
          Cell({
            get value() {
              return value();
            },
            onClick: () => {
              setValue(props.activePlayer);
              props.switchActivePlayer();
            },
          }),
        );
      }
    }
    container.replaceChildren(...cells);
  });

  return container;
};

const App = () => {
  const [activePlayer, setActivePlayer] = createSignal("x");
  const handleSwitchPlayer = () =>
    setActivePlayer((prev) => (prev === "x" ? "o" : "x"));

  const container = document.createElement("div");

  const activePlayerEl = document.createElement("span");
  createEffect(() => {
    activePlayerEl.textContent = `Active Player: ${activePlayer()}`;
  })

  container.replaceChildren(
    activePlayerEl,
    Grid({
      size: 3,
      get activePlayer() {
        return activePlayer();
      },
      switchActivePlayer: handleSwitchPlayer,
    }),
  );

  return container;
};

createRoot(() => {
  root.replaceChildren(App());
});
