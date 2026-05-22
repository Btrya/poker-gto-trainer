import type { Lesson, Question, Term } from "./types";

export const terms: Term[] = [
  {
    id: "term-gto",
    slug: "gto",
    title: "GTO",
    category: "核心概念",
    difficulty: "beginner",
    summary: "一种尽量不可被剥削的平衡策略。",
    content:
      "GTO 是 Game Theory Optimal。德扑里它不是每手牌都追求最大收益，而是让你的价值下注、诈唬、跟注和弃牌频率保持合理，降低对手针对你的空间。",
    examples: ["河牌用合适的价值牌和阻断牌组成下注范围。", "面对下注时按底池赔率保留足够防守频率。"],
  },
  {
    id: "term-mdf",
    slug: "minimum-defense-frequency",
    title: "MDF",
    category: "防守",
    difficulty: "intermediate",
    summary: "面对下注时，理论上至少需要继续防守的频率。",
    content:
      "MDF 用来避免对手任意下注都自动盈利。公式是 pot / (pot + bet)。它是一个框架，不是机械按钮，实际还要看范围、牌面、阻断牌和对手倾向。",
    examples: ["底池 100，对手下注 50，MDF = 100 / 150 = 66.7%。"],
  },
  {
    id: "term-exploit",
    slug: "exploit",
    title: "剥削策略",
    category: "实战调整",
    difficulty: "beginner",
    summary: "针对对手偏差主动偏离平衡策略。",
    content:
      "剥削策略的核心是找到对手频率偏差。如果对手过度弃牌，你可以提高诈唬频率；如果对手过度跟注，你应减少诈唬，扩大价值下注范围。",
    examples: ["对跟注站少 bluff，多薄价值。", "对翻牌 c-bet 后过度弃牌的人，提高 c-bet 频率。"],
  },
  {
    id: "term-blocker",
    slug: "blocker",
    title: "阻断牌",
    category: "牌面阅读",
    difficulty: "intermediate",
    summary: "你手里的牌减少了对手持有某些强牌或跟注牌的组合数。",
    content:
      "阻断牌可以帮助选择诈唬和 bluff-catch。比如你持有 A 黑桃，河牌同花完成时，对手拥有坚果同花的组合减少。",
    examples: ["拿着 A 高同花阻断牌时，更适合作为某些河牌 bluff 候选。"],
  },
];

export const lessons: Lesson[] = [
  {
    id: "lesson-gto-vs-exploit",
    slug: "gto-vs-exploit",
    title: "GTO 和剥削不是对立面",
    category: "学习路径",
    difficulty: "beginner",
    content:
      "GTO 给你一个不容易被打穿的基准线，剥削策略让你在发现对手偏差时获得额外收益。初学阶段应先学会范围、位置、底池赔率和基础频率，再学习如何偏离。",
    takeaways: ["先有基准，再谈偏离。", "没有读牌依据时，接近均衡。", "发现稳定偏差时，果断剥削。"],
  },
  {
    id: "lesson-player-types",
    slug: "player-types",
    title: "常见对手类型",
    category: "剥削策略",
    difficulty: "beginner",
    content:
      "德扑学习里最常见的剥削入口是对手类型。弃牌太多的人怕压力，跟注太多的人不信你，下注太少的人通常偏被动，过度激进的人会让范围失衡。",
    takeaways: ["对弃牌多的人多施压。", "对跟注多的人减少纯诈唬。", "对被动玩家的突然大注保持尊重。"],
  },
  {
    id: "lesson-preflop-position",
    slug: "preflop-position",
    title: "位置决定范围宽度",
    category: "翻前",
    difficulty: "beginner",
    content:
      "越靠后的位置，后面未行动玩家越少，能用更宽的范围开池。前位需要更紧，因为后面还有很多玩家可能拿到强牌或拥有位置优势。",
    takeaways: ["BTN 范围最宽。", "UTG 范围最紧。", "盲注位翻后经常没有位置，要谨慎防守。"],
  },
];

export const questions: Question[] = [
  {
    id: "q-btn-open-a9s",
    type: "preflop",
    category: "翻前范围",
    difficulty: "beginner",
    prompt: "6 人桌，前面都弃牌，你在 BTN 拿到 A9s。标准学习策略下更常见的行动是什么？",
    options: ["弃牌", "平跟", "开池加注", "全下"],
    answer: "开池加注",
    explanation: "BTN 位置优势最大，A9s 有高牌价值、同花潜力和阻断 A 的效果，通常属于可开池范围。",
    metadata: { heroPosition: "BTN", hand: "A9s" },
  },
  {
    id: "q-call-station-river",
    type: "exploit",
    category: "剥削策略",
    difficulty: "beginner",
    prompt: "对手是明显跟注站，河牌经常用边缘牌跟注。你拿到中等摊牌价值，错过听牌。更好的调整是什么？",
    options: ["增加纯诈唬", "减少纯诈唬，多做价值下注", "所有牌都过牌", "每次都超池下注"],
    answer: "减少纯诈唬，多做价值下注",
    explanation: "跟注站不会按理论频率弃牌，诈唬收益下降；但他们会用更差的牌支付价值下注。",
    metadata: { villainType: "calling-station" },
  },
  {
    id: "q-mdf-pot-half",
    type: "concept",
    category: "GTO 防守",
    difficulty: "intermediate",
    prompt: "底池 100，对手下注 50。只看 MDF 框架，你大约需要继续防守多少频率？",
    options: ["33%", "50%", "67%", "80%"],
    answer: "67%",
    explanation: "MDF = pot / (pot + bet) = 100 / 150 = 66.7%。实际选择哪些牌继续，要结合范围和牌面。",
    metadata: {},
  },
  {
    id: "q-cbet-dry-board",
    type: "concept",
    category: "翻后策略",
    difficulty: "intermediate",
    prompt: "BTN 开池，BB 跟注。翻牌 A72 彩虹面，BB 过牌。作为 BTN，理论学习中这个牌面对谁更有利？",
    options: ["BTN 更有利", "BB 更有利", "完全一样", "只看单手牌决定"],
    answer: "BTN 更有利",
    explanation: "BTN 翻前范围有更多强 A 和高张优势，A72r 也较干燥，常见策略会包含较高频率小注 c-bet。",
    metadata: { heroPosition: "BTN", board: "A72r", potType: "single-raised-pot" },
  },
];
