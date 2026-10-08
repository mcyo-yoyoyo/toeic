import type { Choice } from "./types";

function q(id: string, stem: string, options: [string, string, string, string], answer: 0 | 1 | 2 | 3, why: string): Choice {
  return { id, stem, options, answer, why };
}

export const PART5: Choice[] = [
  q("p5-1", "The committee will ------- the revised budget at Friday's meeting.", ["discuss", "discussion", "discussed", "discussing"], 0, "will 后面用动词原形。"),
  q("p5-2", "Ms. Chen is responsible ------- updating the client list.", ["to", "for", "with", "on"], 1, "responsible for 是固定搭配。"),
  q("p5-3", "The new policy is ------- than the one it replaced.", ["strict", "strictly", "stricter", "strictest"], 2, "than 提示比较级。"),
  q("p5-4", "All employees ------- required to wear badges in the lobby.", ["is", "are", "be", "being"], 1, "employees 是复数，用 are。"),
  q("p5-5", "Please submit the form ------- the end of the business day.", ["by", "until", "during", "between"], 0, "by 表示不晚于某个时间点。"),
  q("p5-6", "The brochure was ------- to every visitor at the entrance.", ["give", "gave", "given", "giving"], 2, "was given 是被动。"),
  q("p5-7", "Mr. Park asked ------- the shipment had left the warehouse.", ["that", "which", "whether", "what"], 2, "asked whether 用来问是不是已经发生。"),
  q("p5-8", "We appreciated ------- so quickly about the delay.", ["you inform", "you to inform", "your informing", "your informed"], 2, "appreciate 后面接动名词。"),
  q("p5-9", "The seminar has been ------- until November 4.", ["postpone", "postponing", "postponed", "postponement"], 2, "has been postponed，被动完成时。"),
  q("p5-10", "Neither the manager nor the assistants ------- the final draft.", ["has seen", "have seen", "seeing", "seen"], 1, "nor 后面的 assistants 是复数，用 have。"),
  q("p5-11", "Applicants must provide a copy of ------- identification.", ["they", "their", "them", "theirs"], 1, "identification 前要所有格 their。"),
  q("p5-12", "The parts were damaged ------- transit.", ["on", "during", "while", "among"], 1, "during transit，在运送过程中。"),
  q("p5-13", "------- the budget was approved, hiring will begin next week.", ["Now that", "Despite", "Instead", "Except"], 0, "Now that 表示原因已经成立，后面接结果。"),
  q("p5-14", "The hotel ------- the conference is held offers a group rate.", ["which", "where", "who", "whose"], 1, "hotel 是地点，从句用 where。"),
  q("p5-15", "This printer is as ------- as the larger model.", ["reliable", "reliably", "reliability", "more reliable"], 0, "as ... as 中间用原级形容词。"),
  q("p5-16", "The director had the report ------- before the board meeting.", ["revise", "revised", "revising", "revision"], 1, "have something done：had the report revised。"),
  q("p5-17", "Staff members wishing to attend should ------- by Monday.", ["register", "registers", "registering", "registration"], 0, "should 后面用动词原形。"),
  q("p5-18", "The increase in orders ------- unexpected.", ["was", "were", "have", "are"], 0, "真正主语是 increase，单数，用 was。"),
  q("p5-19", "Please call the supplier ------- you notice a missing item.", ["so", "if", "and", "or"], 1, "if 引导条件：如果发现缺件。"),
  q("p5-20", "The manual explains the procedure ------- detail.", ["on", "at", "in", "by"], 2, "in detail 是固定搭配。"),
  q("p5-21", "Customers ------- complaints were not addressed may request a refund.", ["which", "whose", "who", "whom"], 1, "complaints 属于 customers，用 whose。"),
  q("p5-22", "The workshop was ------- than participants had expected.", ["useful", "usefully", "more useful", "most useful"], 2, "than 要求比较级 more useful。"),
  q("p5-23", "Both the invoice and the receipt ------- in the envelope.", ["is", "are", "was", "be"], 1, "both A and B 是复数，用 are。"),
  q("p5-24", "The company succeeded in ------- costs without reducing staff.", ["reduce", "reduced", "reducing", "reduction"], 2, "succeed in doing。"),
  q("p5-25", "A reminder will be sent to anyone ------- has not replied.", ["which", "who", "whom", "whose"], 1, "anyone 指人，从句缺主语，用 who。"),
  q("p5-26", "The figures in the chart are ------- with last year's results.", ["compare", "comparison", "comparable", "comparably"], 2, "be comparable with，形容词。"),
  q("p5-27", "------- rising costs, the cafe kept its prices unchanged.", ["Because", "Although", "Despite", "Since"], 2, "Despite 后面接名词 rising costs。"),
  q("p5-28", "The assistant stayed late ------- finish the mailing.", ["in order", "so that", "to", "for"], 2, "to finish 表示目的。"),
  q("p5-29", "Each of the proposals ------- been reviewed.", ["have", "has", "are", "were"], 1, "each 是单数，用 has。"),
  q("p5-30", "The contract requires tenants ------- the lobby clean.", ["keep", "to keep", "keeping", "kept"], 1, "require someone to do。"),
  q("p5-31", "Sales rose sharply in May, ------- fell again in June.", ["but", "so", "or", "nor"], 0, "前后两个完整句，转折用 but。"),
  q("p5-32", "The signed copy is ------- the unsigned one.", ["preferable", "preferable than", "more preferable", "preferable to"], 3, "preferable to，不用 than。"),
];

export const PART5_PER_DAY = 8;
