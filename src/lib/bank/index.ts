export type { Choice, PracticeSet, ReadingSet, VocabCard } from "./types";
export { deck, isPracticeSet } from "./types";
export { PART5, PART5_PER_DAY } from "./part5";
export { PART6, PART7, PART7_MULTI } from "./readings";
export { VOCAB, VOCAB_PER_DAY } from "./vocab";

import { PART5, PART5_PER_DAY } from "./part5";
import { PART6, PART7, PART7_MULTI } from "./readings";
import { deck } from "./types";
import { VOCAB, VOCAB_PER_DAY } from "./vocab";

export function dayDeck(day: number) {
  const safeDay = Math.max(day, 1);
  return {
    vocab: deck(VOCAB, safeDay, VOCAB_PER_DAY, 0),
    part5: deck(PART5, safeDay, PART5_PER_DAY, 0),
    grammar: deck(PART5, safeDay, 5, 17),
    part6: PART6[(safeDay - 1) % PART6.length],
    part7: PART7[(safeDay - 1) % PART7.length],
    multi: PART7_MULTI[(safeDay - 1) % PART7_MULTI.length],
  };
}
