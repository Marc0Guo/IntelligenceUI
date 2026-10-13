import { useEffect, useState } from "react";

export function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function useDilStream(doc, generation) {
  const [blockIndex, setBlockIndex] = useState(0);
  const [words, setWords] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!doc) {
      setBlockIndex(0);
      setWords(0);
      setDone(false);
      return undefined;
    }
    setBlockIndex(0);
    setWords(0);
    setDone(false);
    let index = 0;
    let word = 0;
    let timer = 0;
    const blocks = doc.blocks;

    const tick = () => {
      const block = blocks[index];
      if (!block) {
        setDone(true);
        return;
      }
      if (block.type === "text" && block.stream === "word") {
        const total = countWords(block.text);
        word += 1;
        setBlockIndex(index);
        setWords(word);
        if (word < total) {
          timer = window.setTimeout(tick, 28);
          return;
        }
      }
      index += 1;
      word = 0;
      setBlockIndex(index);
      setWords(0);
      if (index >= blocks.length) {
        setDone(true);
        return;
      }
      const next = blocks[index];
      const pause = next?.type === "text" ? 180 : 260;
      timer = window.setTimeout(tick, pause);
    };

    timer = window.setTimeout(tick, 220);
    return () => window.clearTimeout(timer);
  }, [doc, generation]);

  return { blockIndex, words, done };
}
