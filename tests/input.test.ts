import { it, expect } from "vitest";
import { controlForKey } from "../src/input";
it("physical flipper release is stable when Shift changes during the hold", () => {
  expect(controlForKey("a", "KeyA")).toBe("a");
  expect(controlForKey("A", "KeyA")).toBe("a");
});
it("focused named controls respond to Space and Enter", () => {
  expect(controlForKey(" ", "Space", "left")).toBe("a");
  expect(controlForKey("Enter", "Enter", "right")).toBe("d");
  expect(controlForKey("Enter", "Enter", "launch")).toBe(" ");
});
import { HeldKeys } from "../src/input";
it("releases the original focused control after Tab changes focus", () => {
  const held = new HeldKeys();
  held.press("Space", controlForKey(" ", "Space", "left"));
  expect(held.release("Space")).toBe("a");
  expect(held.has("a")).toBe(false);
});
it("keeps a flipper held until all its keys release and cancels holds on interruption", () => {
  const held = new HeldKeys();
  held.press("KeyA", "a");
  held.press("ArrowLeft", "a");
  held.release("KeyA");
  expect(held.has("a")).toBe(true);
  held.clear();
  expect(held.release("ArrowLeft")).toBeUndefined();
  expect(held.has("a")).toBe(false);
});
