import { useState } from "react";

// Goes up each time `count` rises, never on the first render or when it
// falls. Use it as a `key` to restart the save animation on every new save.
export function useSavePulse(count: number): number {
  const [previous, setPrevious] = useState(count);
  const [pulse, setPulse] = useState(0);

  // Adjusting state during render, so the animation starts in the same paint.
  if (count !== previous) {
    setPrevious(count);
    if (count > previous) setPulse(pulse + 1);
  }

  return pulse;
}
