import { useEffect, useState } from "react";

export default function useTypewriter(text, speed = 30, enabled = true) {
  const [displayed, setDisplayed] = useState(() => (enabled ? "" : text));

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let index = 0;
    const interval = setInterval(() => {
      index += 1;
      setDisplayed(text.slice(0, index));
      if (index >= text.length) clearInterval(interval);
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, enabled]);

  return enabled ? displayed : text;
}
