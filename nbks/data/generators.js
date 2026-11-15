// The generated scores of Uchaf: scores that are made anew each time they come round, so that
// the cycle never plays the same shuffle twice. scores.json names them ({ generator, args } or a
// plain name); play() is handed this object as options.generators and calls each as
// generator(context, ...args), where context = { spels, paras, scores, config, scoreNum, args }
// (see the engine's README, "Generated scores and timed scores").
//
// What a generator may assume about the piece (the galley in scoring-uchaf.html):
//   - paras[0] and paras[1] are the spel ids of verse 1 and verse 2, in text order, 25 spels each;
//   - in each verse the first 12 spels are six pairs (a modifier, then a noun: "low cloud",
//     "nameless bay" ...) and the last 13 are the second stanza ("what gives us all we see? ...");
//   - the two verses are laid out alike, so spel k of verse 2 is in the place of spel k of verse 1;
//   - scores[TIMED[v]] is the timed read-in of verse v+1, which gives every spel its pause;
//   - the spels "know?", "knowing", "reading", "ear" and "eye" are alternates that stand in the
//     places of "see?", "thinking" (twice) and "mouth" (twice).
//
// In the Observable notebook these were cells of the app (s1jjnn, vshuffle, schorus); their old
// names are given beside the new ones.
import { shuffle } from "scoringthespeltair";

// the score numbers (in scores.json) of the timed read-ins of verse 1 and verse 2
const TIMED = [0, 3];
const MODIFIERS = [0, 2, 4, 6, 8, 10]; // positions in a verse (first stanza)
const NOUNS = [1, 3, 5, 7, 9, 11];
// pairings that are never made (modifier position : noun position), besides each modifier with its
// own noun: the author's choice, one list per verse
const NOT_PAIRED = [["0:3", "6:3"], ["10:3"]];

const pick = (list) => list[Math.floor(Math.random() * list.length)];

// the verses of the context: their ids, and an item (id and its timed pause) for a position
const versesOf = ({ paras, scores }) => paras.slice(0, 2).map((ids, v) => {
  const pauses = new Map(scores[TIMED[v]].map(({ id, pause }) => [id, pause]));
  return { ids, item: (k) => ({ id: ids[k], pause: pauses.get(ids[k]) }) };
});

// the id of the (unique) spel with this text; the alternates are found this way
const idOf = ({ spels }, string) => {
  for (const [id, spel] of spels) if (spel.string === string) return id;
  throw new Error(`uchaf generators: no spel "${string}"`);
};

const toggles = (items) => items.map(({ id }) => ({ id, pause: 0 }));

const generators = {
  // s1jjnn: the six modifiers and six nouns of a verse, each set shuffled and then paired off in
  // order, each pair shown (modifier, noun) and then faded together. A pairing in NOT_PAIRED, or
  // the original one, is left out. args: [verse] (1 or 2)
  jjnn(context, verse) {
    const v = versesOf(context)[verse - 1];
    const forbidden = new Set([...MODIFIERS.map((m) => `${m}:${m + 1}`), ...NOT_PAIRED[verse - 1]]);
    const modifiers = shuffle(MODIFIERS), nouns = shuffle(NOUNS);
    const score = [];
    modifiers.forEach((m, i) => {
      const n = nouns[i];
      if (forbidden.has(`${m}:${n}`)) return;
      const pair = [v.item(m), v.item(n)];
      score.push(...pair, ...toggles(pair));
    });
    return score;
  },

  // vshuffle: the first stanza of a verse, its modifiers and its nouns each in a random order,
  // woven together (modifier, noun, modifier, noun ...) and left showing. With prevFade each spel
  // is preceded by the toggling off, in the same place, of the other verse's spel: the verse
  // replaces the other, word for word. args: [verse, prevFade = false]
  vshuffle(context, verse, prevFade = false) {
    const [mine, other] = [versesOf(context)[verse - 1], versesOf(context)[verse === 1 ? 1 : 0]];
    const modifiers = shuffle(MODIFIERS), nouns = shuffle(NOUNS);
    const score = [];
    const add = (k) => {
      if (prevFade) score.push({ id: other.ids[k], pause: 0 });
      score.push(mine.item(k));
    };
    modifiers.forEach((m, i) => { add(m); add(nouns[i]); });
    return score;
  },

  // schorus: the second stanza of verse 1, read in at the pace of its timed read-in, but with a
  // random sense in the place of "see?" ("hear?", "see?" or "know?") and a random pair in the
  // place of "thinking mouth" ("thinking"/"feeling"/"knowing"/"reading" with "mouth"/"hand"/"ear"/"eye",
  // never "feeling mouth"); the last word lingers 200 ms longer, then the whole stanza fades at once.
  chorus(context) {
    const [v1, v2] = versesOf(context);
    const stanza = Array.from({ length: 13 }, (_, i) => v1.item(12 + i));
    const sense = pick([v2.ids[17], v1.ids[17], idOf(context, "know?")]); // hear?, see?, know?
    const modifiers = ["thinking", "feeling", "knowing", "reading"].map((s) => [s, idOf(context, s)]);
    const nouns = ["mouth", "hand", "ear", "eye"].map((s) => [s, idOf(context, s)]);
    let j, n;
    do { j = pick(modifiers); n = pick(nouns); } while (j[0] === "feeling" && n[0] === "mouth");
    const score = [
      ...stanza.slice(0, 5),
      { id: sense, pause: stanza[5].pause },
      stanza[6], stanza[7],
      { id: j[1], pause: stanza[8].pause },
      { id: n[1], pause: stanza[9].pause },
      stanza[10], stanza[11],
      { id: stanza[12].id, pause: stanza[12].pause + 200 },
    ];
    return [...score, ...toggles(score)];
  },
};

export { generators, TIMED };
