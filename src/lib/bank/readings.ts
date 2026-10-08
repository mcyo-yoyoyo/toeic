import type { ReadingSet } from "./types";

export const PART6: ReadingSet[] = [
  {
    id: "p6-lobby",
    kind: "part6",
    title: "Lobby renovation",
    passage: `To: All staff
From: Facilities
Subject: Lobby renovation

The lobby renovation will begin on Monday. Employees should use the side entrance (1) ------- the work is finished. Visitors will be directed to reception on the second floor.

(2) -------, please do not schedule client meetings in the ground-floor lounge next week. A temporary lounge is available in Room 210.

Facilities apologizes for the inconvenience and thanks everyone for (3) -------. Questions about access cards can be sent to facilities@northline.example.

The work is expected to take (4) ------- two weeks.`,
    questions: [
      { id: "p6-lobby-1", stem: "(1)", options: ["during", "until", "because", "whether"], answer: 1, why: "侧门一直用到施工结束，用 until。" },
      { id: "p6-lobby-2", stem: "(2)", options: ["Therefore", "However", "For example", "Otherwise"], answer: 0, why: "前一句说明动线变了，因此不要在一楼约客户。Therefore。" },
      { id: "p6-lobby-3", stem: "(3)", options: ["cooperate", "cooperation", "cooperative", "cooperated"], answer: 1, why: "for 后面要名词 cooperation。" },
      { id: "p6-lobby-4", stem: "(4)", options: ["approximate", "approximately", "approximation", "approximated"], answer: 1, why: "修饰 two weeks 用副词 approximately。" },
    ],
  },
  {
    id: "p6-invoice",
    kind: "part6",
    title: "Invoice correction",
    passage: `Dear Ms. Ortiz,

Thank you for pointing out the error on invoice 4418. The tax line was calculated twice, (1) ------- the total was higher than the quote.

We have issued a corrected invoice and (2) ------- the difference to your account. You do not need to send another payment.

(3) ------- you have already paid the original amount, the extra sum will appear as a credit on next month's statement. We are sorry for the inconvenience and appreciate your (4) -------.`,
    questions: [
      { id: "p6-invoice-1", stem: "(1)", options: ["so", "but", "or", "nor"], answer: 0, why: "税被算了两次，所以总额偏高。so 表结果。" },
      { id: "p6-invoice-2", stem: "(2)", options: ["apply", "applied", "applying", "application"], answer: 1, why: "have issued 和 have applied 并列，用过去分词 applied。" },
      { id: "p6-invoice-3", stem: "(3)", options: ["If", "Despite", "During", "Unless"], answer: 0, why: "如果已经付过，多出来的钱会变成下月抵扣。If。" },
      { id: "p6-invoice-4", stem: "(4)", options: ["patient", "patiently", "patience", "patients"], answer: 2, why: "your 后面接名词 patience。" },
    ],
  },
  {
    id: "p6-workshop",
    kind: "part6",
    title: "Workshop seats",
    passage: `Northline will offer a short workshop on invoice basics next Wednesday. Seats are limited, (1) ------- staff should reply by Monday to reserve a place.

The session is intended for employees (2) ------- prepare customer invoices. A workbook will be provided, but participants must bring a recent invoice from their own team.

Employees who cannot attend may request the slides (3) ------- day. Questions about the room change should be sent to training@northline.example (4) ------- Friday noon.`,
    questions: [
      { id: "p6-workshop-1", stem: "(1)", options: ["so", "yet", "or", "nor"], answer: 0, why: "座位有限，所以要在周一前回复。so。" },
      { id: "p6-workshop-2", stem: "(2)", options: ["which", "who", "whose", "whom"], answer: 1, why: "employees 是人，从句缺主语，用 who。" },
      { id: "p6-workshop-3", stem: "(3)", options: ["a following", "the following", "following", "followed"], answer: 1, why: "the following day，第二天。" },
      { id: "p6-workshop-4", stem: "(4)", options: ["by", "until", "during", "within"], answer: 0, why: "不晚于周五中午，用 by。" },
    ],
  },
];

export const PART7: ReadingSet[] = [
  {
    id: "p7-seminar",
    kind: "part7",
    title: "Workshop notice",
    passage: `Northline Workshop: Invoice Basics
Date: Wednesday, November 4
Time: 2:00 p.m. – 3:30 p.m.
Place: Room 210

This session is for staff who prepare customer invoices. Participants will practice correcting common errors, including missing purchase-order numbers and incorrect tax lines.

Seats are limited to 20. To reserve a place, reply to this notice by Monday, November 2. Employees who cannot attend may request the slide file the following day.

A printed workbook will be provided. Please bring a recent invoice from your own team.`,
    questions: [
      { id: "p7-seminar-1", stem: "What is the purpose of the notice?", options: ["To announce a change in tax rules", "To invite staff to a training session", "To request payment of an overdue invoice", "To cancel Wednesday's client meeting"], answer: 1, why: "通篇是在通知一场发票培训，并说明如何占座。" },
      { id: "p7-seminar-2", stem: "What should participants bring?", options: ["A purchase order from a client", "The slide file", "A recent invoice", "A printed workbook"], answer: 2, why: "最后一句要求自带最近的发票。workbook 是现场提供的。" },
      { id: "p7-seminar-3", stem: "What is indicated about employees who cannot attend?", options: ["They will lose their seats permanently", "They can ask for the slides later", "They must pay a registration fee", "They should use the side entrance"], answer: 1, why: "文中写 may request the slide file the following day。" },
    ],
  },
  {
    id: "p7-shipment",
    kind: "part7",
    title: "Delivery update",
    passage: `From: Harbor Freight Desk
To: Northline Receiving
Date: October 16
Subject: Purchase order 7781

The furniture for purchase order 7781 left the warehouse this morning. Delivery is now expected on October 18, one day later than the date on your order, because of a road closure outside the city.

The driver will call the receiving dock thirty minutes before arrival. Someone must be present to inspect the cartons. Please note that the loading dock closes at 4:30 p.m.

If October 18 is not possible, reply today and we will hold the shipment until October 21.`,
    questions: [
      { id: "p7-shipment-1", stem: "Why was the delivery date changed?", options: ["The order was incomplete", "A road was closed", "The dock was under repair", "The invoice had not been paid"], answer: 1, why: "原因是 city 外的 road closure。" },
      { id: "p7-shipment-2", stem: "What must Northline do when the driver calls?", options: ["Pay the delivery fee", "Have someone inspect the cartons", "Extend the dock hours", "Send a revised purchase order"], answer: 1, why: "Someone must be present to inspect the cartons。" },
      { id: "p7-shipment-3", stem: "What can Northline do if October 18 is inconvenient?", options: ["Cancel the order without a fee", "Ask the driver to arrive after 4:30", "Request a later delivery", "Pick up the furniture today"], answer: 2, why: "当天回复就可以改到 October 21。" },
    ],
  },
  {
    id: "p7-membership",
    kind: "part7",
    title: "Membership renewal",
    passage: `Dear Member,

Your Harbor Library membership expires on November 30. To renew for another year, pay the 120-yuan fee at the front desk or through the member page by that date.

Members who renew before November 15 will receive a voucher for one free workshop. The voucher cannot be exchanged for cash and must be used by December 31.

If you do not wish to renew, return any borrowed items before the expiration date. Overdue items will be charged at the standard daily rate.`,
    questions: [
      { id: "p7-membership-1", stem: "What is the main purpose of the letter?", options: ["To advertise a new workshop", "To remind a member to renew", "To announce a fee increase", "To collect an overdue book"], answer: 1, why: "开头就是会员到期，请续费。" },
      { id: "p7-membership-2", stem: "How can a member get a workshop voucher?", options: ["By paying an extra fee", "By renewing before November 15", "By returning all borrowed items", "By attending a workshop in December"], answer: 1, why: "November 15 之前续费才送券。" },
      { id: "p7-membership-3", stem: "What is true about the voucher?", options: ["It can be exchanged for 120 yuan", "It has no expiration date", "It must be used by December 31", "It covers the membership fee"], answer: 2, why: "must be used by December 31，也不能换现金。" },
    ],
  },
];

export const PART7_MULTI: ReadingSet[] = [
  {
    id: "p7m-order",
    kind: "part7-multi",
    title: "Order and reply",
    passage: `Document A
E-mail from Lena Cho, Northline Cafe
October 9

Please deliver 20 cases of oat milk and 8 cases of paper cups to our Nanjing Road shop on October 14 before 9 a.m. The side door will be open. Do not leave the order at the front counter.

Document B
E-mail from Harbor Supply
October 10

We can deliver the oat milk on October 14 at 8:30 a.m. The paper cups, however, will not leave our warehouse until October 15. We can bring both items together on October 15 at 8:30 a.m., or deliver the milk on the 14th and the cups on the 15th. Please confirm which option you prefer by noon tomorrow.`,
    questions: [
      { id: "p7m-order-1", stem: "What did Ms. Cho originally request?", options: ["A refund for a late shipment", "Delivery of two products on October 14", "A meeting at the warehouse", "Payment of an overdue invoice"], answer: 1, why: "Document A 要 10 月 14 日同时送燕麦奶和纸杯。" },
      { id: "p7m-order-2", stem: "What problem does Harbor Supply report?", options: ["The side door will be locked", "The oat milk is out of stock", "The paper cups cannot arrive on the requested day", "The shop address is incorrect"], answer: 2, why: "纸杯要到 10 月 15 日才能出库。" },
      { id: "p7m-order-3", stem: "What does Harbor Supply ask Ms. Cho to do?", options: ["Pay an extra delivery fee", "Choose between two delivery options", "Pick up the cups herself", "Change the shop address"], answer: 1, why: "请她在明天中午前确认两种送法里要哪一种。" },
    ],
  },
  {
    id: "p7m-badge",
    kind: "part7-multi",
    title: "Notice and request",
    passage: `Document A
Staff notice
November 3

Beginning November 10, every employee must show a photo badge to enter the building before 8 a.m. Badges can be picked up from Reception this week between 10 a.m. and 4 p.m. Temporary badges will not be issued after November 9.

Document B
E-mail from Amir Shah to Reception
November 6

I will be at a client site through November 9 and cannot come to the office during badge hours. Could I collect my badge on November 10 at 7:30 a.m., before the new rule starts? If that is not possible, please tell me whether a colleague may pick it up for me.`,
    questions: [
      { id: "p7m-badge-1", stem: "What will change on November 10?", options: ["Reception will close at 4 p.m.", "A badge will be required for early entry", "Temporary badges will become free", "The client site will move"], answer: 1, why: "11 月 10 日起，8 点前进入大楼必须出示工牌。" },
      { id: "p7m-badge-2", stem: "Why is Mr. Shah unable to follow the pickup hours?", options: ["He lost his old badge", "He works the night shift", "He will be away at a client site", "Reception refused his request"], answer: 2, why: "他到 11 月 9 日都在客户那里。" },
      { id: "p7m-badge-3", stem: "What does Mr. Shah want to know if he cannot come at 7:30 a.m.?", options: ["Whether the rule can be delayed", "Whether someone else may collect the badge", "Whether he can enter without a photo", "Whether the fee can be waived"], answer: 1, why: "他问同事能不能代领。" },
    ],
  },
];
