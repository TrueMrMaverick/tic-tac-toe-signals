let contextCounter = 0;
let signalsCounter = 0;
let effectsCounter = 0;

let activeContext = null;

function runWithContext(callback, context) {
  const prevContext = activeContext;
  activeContext = context;
  callback();
  activeContext = prevContext;
}

function untrack(callback) {
  runWithContext(callback, null);
}

class Context {
  constructor(effectFn, name = `Context ${contextCounter++}`) {
    this.effectFn = effectFn;
    this.name = name;

    this.children = new Set();
    this.runningChildren = [];
    this.cleanups = [];
  }

  run() {
    runWithContext(() => this.effectFn(this.dispose), this);
  }

  dispose = () => {
    this.children.forEach((child) => {
      child.dispose?.();
    });

    this.children.clear();

    this.cleanup();
  };

  cleanup() {
    this.cleanups.forEach((cleanup) => untrack(cleanup));
  }

  registerCleanup(cleanup) {
    this.cleanups.push(cleanup);
  }
}

class Computation extends Context {
  constructor(effectFn, name = `Effect ${effectsCounter++}`) {
    super(effectFn, name);
    this.dependencies = new Set();

    this.parentContext = activeContext;
  }

  run() {
    this.cleanup();

    this.parentContext?.runningChildren.push(this);

    try {
      runWithContext(() => this.effectFn(), this);
    } finally {
      this.parentContext?.runningChildren.pop();
    }
  }

  cleanup() {
    for (const dependency of this.dependencies) {
      dependency.unbind(this);
    }

    this.dependencies.clear();

    super.cleanup();
  }
}

class Signal {
  constructor(value, name = `Signal ${signalsCounter++}`) {
    this.value = value;
    this.name = name;
    this.subscribers = new Set();
  }

  read = () => {
    this.bind(activeContext);

    return this.value;
  };

  write = (valueOrSetter) => {
    if (typeof valueOrSetter === "function") {
      valueOrSetter = valueOrSetter(this.value);
    }

    if (this.value === valueOrSetter) return;

    this.value = valueOrSetter;

    this.#notify();
  };

  bind(context) {
    if (!context) return;

    this.subscribers.add(context);
    context.dependencies?.add(this);
  }

  unbind(context) {
    this.subscribers.delete(context);
  }

  #notify() {
    const subs = [...this.subscribers];

    for (const sub of subs) {
      sub.run();
    }
  }
}

export function createRoot(codeFn) {
  const root = new Context(codeFn);
  root.run();
}

export function onCleanup(callback) {
  if (!activeContext) return;

  activeContext.registerCleanup(callback);
}
export function createEffect(effectFn, name) {
  const effect = new Computation(effectFn, name);
  effect.run();
}

export function createRenderEffect(effectFn, name) {}

export function createSignal(value, name) {
  const signal = new Signal(value, name);

  return [signal.read, signal.write];
}

export function createMemo(computateFn, initialValue) {
  const [s, set] = createSignal(initialValue);

  createEffect(() => {
    set(computateFn());
  });

  return s;
}
