/** Resolve physical keys consistently even when modifiers change during a hold. */
export function controlForKey(
  key: string,
  code: string,
  targetId = "",
): string {
  if (
    (key === " " || key === "Enter") &&
    ["left", "right", "launch"].includes(targetId)
  )
    return { left: "a", right: "d", launch: " " }[
      targetId as "left" | "right" | "launch"
    ];
  const physical: Record<string, string> = {
    KeyA: "a",
    KeyD: "d",
    KeyN: "n",
    KeyP: "p",
    KeyR: "r",
    Space: " ",
    ArrowLeft: "a",
    ArrowRight: "d",
    ArrowUp: "n",
  };
  return physical[code] ?? key.toLowerCase();
}

/** Holds belong to the physical key that started them, independent of focus. */
export class HeldKeys {
  private bindings = new Map<string, string>();
  press(code: string, control: string) {
    this.bindings.set(code, control);
  }
  release(code: string) {
    const control = this.bindings.get(code);
    this.bindings.delete(code);
    return control;
  }
  has(control: string) {
    return [...this.bindings.values()].includes(control);
  }
  clear() {
    this.bindings.clear();
  }
}
