import {
  createSignal,
  createEffect,
  createMemo,
  onCleanup,
} from "../signals.js";
import { Cell } from "./Cell.js";

const checkForWin = (gridValues, size) => {
  const unwrappedValues = gridValues.map(([value]) => value());

  // Check rows
  for (let i = 0; i < size; i++) {
    const index = i * size;

    const firstValue = unwrappedValues[index];

    if (!firstValue) continue;

    let result = true;
    for (let j = 0; j < size; j++) {
      result &= firstValue === unwrappedValues[index + j];
    }

    if (result) return firstValue;
  }

  // Check cols
  for (let i = 0; i < size; i++) {
    const index = i;

    const firstValue = unwrappedValues[index];

    if (!firstValue) continue;

    let result = true;
    for (let j = 0; j < size; j++) {
      result &= firstValue === unwrappedValues[index + j * size];
    }

    if (result) return firstValue;
  }

  // Check diags
  let firstValue = unwrappedValues[0];
  let result = true;
  for (let i = 1, j = 1; i < size; i++, j++) {
    result &= firstValue === unwrappedValues[i * size + j];
  }

  if (result) return firstValue;

  firstValue = unwrappedValues[(size - 1) * size];
  result = true;
  for (let i = size - 2, j = 1; i >= 0; i--, j++) {
    result &= firstValue === unwrappedValues[i * size + j];
  }

  return result ? firstValue : null;
};

export const Grid = (props) => {
  const container = document.createElement("div");
  container.classList.add("grid");

  const gridValues = createMemo(() =>
    new Array(props.size * props.size).fill(null).map(() => createSignal(null)),
  );

  const winner = createMemo(() => checkForWin(gridValues(), props.size));

  createEffect(() => {
    if (!winner()) return;

    props.onWinnerChange(winner());
  });

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
