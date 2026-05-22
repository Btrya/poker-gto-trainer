insert into public.terms (id, slug, title, category, difficulty, summary, content, examples)
values
  ('term-range', 'range', '范围', '核心概念', 'beginner', '把对手可能持有的所有手牌组合放在一起思考。', '学习 GTO 时要从单手牌思维转向范围思维。你不是只问“我这手强不强”，而是问“我的整体范围在这个牌面上有什么优势，对手有哪些强牌、听牌和空气牌”。', '["BTN 开池后在 A 高干燥面通常有范围优势。", "BB 防守范围有更多低张两对和暗三条组合。"]'::jsonb),
  ('term-ev', 'expected-value', 'EV', '数学基础', 'beginner', '一个决策长期平均能赚或亏多少。', 'EV 是 Expected Value。短期结果会被运气影响，但学习策略时要评估长期期望值。一个河牌 bluff 即使这次失败，只要对手弃牌频率足够高，长期仍然可能是正 EV。', '["底池 100，下注 50，纯 bluff 需要对手弃牌超过 33.3% 才立即盈利。"]'::jsonb),
  ('term-pot-odds', 'pot-odds', '底池赔率', '数学基础', 'beginner', '用跟注成本和最终底池比较，判断需要多少胜率。', '底池赔率帮助你判断跟注是否合理。需要胜率 = 跟注金额 / 跟注后总底池。它不等于最终答案，因为还要考虑后续下注、隐含赔率和反向隐含赔率。', '["底池 100，对手下注 50，你跟 50 赢 200，总共需要 25% 胜率。"]'::jsonb),
  ('term-equity', 'equity', '胜率 Equity', '数学基础', 'beginner', '如果现在一路摊牌，你赢下底池的概率份额。', 'Equity 是你的手牌或范围对另一个手牌或范围的胜率。听牌通常有不错 equity，但是否下注还要看 fold equity、位置、牌面和未来可实现程度。', '["同花听牌到河牌大约有 35% 左右完成概率。"]'::jsonb),
  ('term-fold-equity', 'fold-equity', '弃牌收益', '进攻', 'intermediate', '下注让对手弃牌带来的收益。', 'Fold equity 是 bluff 和半诈唬的重要来源。你的牌就算暂时落后，只要下注能让对手弃掉足够多更好牌或高 equity 牌，下注就可能盈利。', '["转牌用强听牌加注，既有成牌胜率，也能直接赢下底池。"]'::jsonb),
  ('term-cbet', 'continuation-bet', 'C-bet', '翻后策略', 'beginner', '翻前进攻者在翻牌继续下注。', 'C-bet 的频率取决于范围优势、坚果优势、牌面湿度和位置。干燥 A 高面通常适合较高频率小注，连张同花湿润面则需要更谨慎。', '["BTN vs BB，A72r 常见小注高频。", "987 两同花面对 BB 防守范围时要降低自动下注。"]'::jsonb),
  ('term-value-bet', 'value-bet', '价值下注', '进攻', 'beginner', '希望被更差的牌跟注而下注。', '价值下注不是“我有强牌就下注”这么简单，而是判断对手会用哪些更差牌支付。对跟注过多的对手，可以扩大薄价值下注范围。', '["对跟注站，顶对弱踢脚在一些河牌也可能薄价值下注。"]'::jsonb),
  ('term-bluff-catch', 'bluff-catch', '抓诈唬', '防守', 'intermediate', '用只能赢诈唬、很难赢价值牌的牌跟注。', 'Bluff-catch 的重点不是绝对牌力，而是对手价值牌和诈唬比例、下注尺度、你手里的阻断牌，以及对手是否真的有足够 bluff。', '["河牌拿到阻断对手价值范围、且不阻断其诈唬范围的牌，更适合跟注。"]'::jsonb),
  ('term-nut-advantage', 'nut-advantage', '坚果优势', '范围分析', 'intermediate', '某一方拥有更多最强牌组合。', '坚果优势会影响大注和超池下注。即使一方整体 equity 没有明显领先，只要拥有更多最强牌，也可能更适合使用大尺度施压。', '["BB 在 764 这类低连张面可能有更多两对和顺子组合。"]'::jsonb),
  ('term-polarized-range', 'polarized-range', '两极化范围', '下注结构', 'intermediate', '范围主要由强价值牌和诈唬组成，中等牌较少。', '大注通常更偏两极化：强牌想拿最大价值，弱牌靠弃牌收益盈利；中等摊牌价值通常更倾向过牌或小注。', '["河牌大注往往代表强价值或 bluff，不太应该混入大量中等牌。"]'::jsonb)
on conflict (id) do update set
  title = excluded.title,
  category = excluded.category,
  difficulty = excluded.difficulty,
  summary = excluded.summary,
  content = excluded.content,
  examples = excluded.examples;

insert into public.lessons (id, slug, title, category, difficulty, content, takeaways, sort_order)
values
  ('lesson-range-first', 'range-first-thinking', '从单手牌转向范围', 'GTO 基础', 'beginner', 'GTO 学习的第一步是停止只看自己的两张牌。你需要估计自己和对手的范围，判断谁有范围优势、谁有坚果优势、哪些牌适合下注、哪些牌适合过牌保护整体范围。', '["先问范围，再问单手牌。", "范围优势适合高频小注。", "坚果优势支持更大下注尺度。"]'::jsonb, 4),
  ('lesson-bet-sizing', 'bet-sizing-basics', '下注尺度的基本逻辑', 'GTO 基础', 'intermediate', '小注通常用于范围优势明显、想用大量牌施压的牌面；大注通常用于两极化范围，强牌拿价值，诈唬牌制造弃牌收益。不要把所有牌都用同一个尺度处理。', '["小注偏高频和范围压力。", "大注偏两极化。", "中等牌不适合无脑打大。"]'::jsonb, 5),
  ('lesson-defense-frequency', 'defense-frequency', '防守频率和 MDF', 'GTO 防守', 'intermediate', 'MDF 给你一个防守下限，避免对手任意 bluff 都赚钱。但实战不是机械按公式跟注：范围劣势、阻断牌差、对手诈唬不足时，可以低于 MDF；对手过度 bluff 时，可以高于 MDF。', '["MDF 是框架，不是按钮。", "优先保留有 equity 和好阻断的牌。", "对手诈唬不足时少抓。"]'::jsonb, 6),
  ('lesson-exploit-map', 'exploit-map', '常见漏洞和调整地图', '剥削策略', 'beginner', '剥削策略要把对手漏洞翻译成你的行动。弃牌太多就提高 bluff 和小注频率；跟注太多就减少 bluff，扩大价值；下注太少就多偷底池；加注太少就更放心薄价值。', '["对过度弃牌者多 bluff。", "对跟注站多价值少诈唬。", "对被动玩家的大注少逞强。"]'::jsonb, 7),
  ('lesson-blockers', 'blockers-and-unblockers', '阻断牌和反阻断', '翻后策略', 'intermediate', '好的 bluff 候选通常阻断对手强价值牌，同时不阻断对手会弃掉的弱牌。好的 bluff-catch 也类似：阻断对手价值牌，不阻断对手错过听牌。', '["阻断价值牌有利于 bluff。", "不阻断对手错过听牌有利于抓诈唬。", "阻断牌只是辅助，不替代范围判断。"]'::jsonb, 8),
  ('lesson-mental-model', 'simple-study-loop', '个人练习循环', '学习方法', 'beginner', '单人训练最有效的方式是固定循环：先学概念，再做题，错题归类，然后复盘错因。每次只盯一个主题，比如 BTN vs BB c-bet，连续练到能解释原因再换主题。', '["按主题练，不要随机乱刷。", "每题都说出范围理由。", "错题按概念归类。"]'::jsonb, 9)
on conflict (id) do update set
  title = excluded.title,
  category = excluded.category,
  difficulty = excluded.difficulty,
  content = excluded.content,
  takeaways = excluded.takeaways,
  sort_order = excluded.sort_order;

insert into public.questions (id, type, category, difficulty, prompt, options, answer, explanation, metadata)
values
  ('q-utg-k9o', 'preflop', '翻前范围', 'beginner', '6 人桌，你在 UTG 拿到 K9o。没人行动前，标准学习策略更倾向怎么做？', '["开池加注", "弃牌", "平跟", "最小 3-bet"]'::jsonb, '弃牌', 'UTG 后面还有 5 个玩家未行动，需要更紧的开池范围。K9o 被主导风险高，翻后可玩性也一般。', '{"heroPosition": "UTG", "hand": "K9o"}'::jsonb),
  ('q-bb-defend-76s', 'preflop', '盲注防守', 'intermediate', 'BTN 开池到 2.5bb，你在 BB 拿到 76s。没有特殊对手信息时，更常见的学习思路是什么？', '["通常可以防守", "必须弃牌", "只应该全下", "永远 3-bet"]'::jsonb, '通常可以防守', 'BB 已投入大盲，面对 BTN 宽范围开池， suited connector 有可玩性和隐含价值，常见策略会包含跟注防守。', '{"heroPosition": "BB", "hand": "76s"}'::jsonb),
  ('q-small-cbet-purpose', 'concept', '下注尺度', 'intermediate', '在 A72r 这类干燥且翻前进攻者有范围优势的牌面，小注 c-bet 的主要逻辑是什么？', '["用整个范围低成本施压", "只代表暗三条", "因为小注永远不会被加注", "为了保护所有空气牌到摊牌"]'::jsonb, '用整个范围低成本施压', '范围优势明显、牌面干燥时，小注能让很多边缘牌和空气牌获得即时 fold equity，同时保持风险可控。', '{"board": "A72r", "potType": "single-raised-pot"}'::jsonb),
  ('q-wet-board-cbet', 'concept', '牌面纹理', 'intermediate', 'BTN 开池，BB 跟注。翻牌 987 两同花，BB 过牌。相比 A72r，BTN 应该如何调整？', '["更谨慎，降低自动 c-bet", "任何两张牌都下注", "只用 1bb 下注", "永远全下"]'::jsonb, '更谨慎，降低自动 c-bet', '987 两同花更连接 BB 防守范围，BB 有更多两对、顺子、强听牌。BTN 自动高频小注会更容易被反击。', '{"heroPosition": "BTN", "board": "9h8h7c", "potType": "single-raised-pot"}'::jsonb),
  ('q-overfold-exploit', 'exploit', '剥削策略', 'beginner', '你观察到对手面对转牌第二枪弃牌明显过多。最直接的剥削调整是什么？', '["减少转牌 bluff", "增加转牌 bluff 和半诈唬", "只用坚果下注", "翻前不再开池"]'::jsonb, '增加转牌 bluff 和半诈唬', '对手过度弃牌时，你的 bluff 需要的成功率更容易达成，可以扩大施压频率，尤其选择有 equity 或好阻断的牌。', '{"villainType": "over-folder"}'::jsonb),
  ('q-underbluff-river', 'exploit', '剥削策略', 'intermediate', '一个非常被动的玩家河牌突然大注。长期观察他几乎不 bluff。你拿到普通 bluff-catcher，应该如何调整？', '["按 MDF 强行跟注", "倾向弃牌", "必然加注 bluff", "忽略对手信息"]'::jsonb, '倾向弃牌', 'MDF 假设对手有足够 bluff。若对手严重 bluff 不足，普通抓诈牌的 EV 会下降，剥削上可以过度弃牌。', '{"villainType": "passive-underbluffer"}'::jsonb),
  ('q-blocker-bluff', 'concept', '阻断牌', 'intermediate', '河牌同花完成，你想选择 bluff 候选。哪类牌通常更适合？', '["持有高张同花阻断牌", "阻断对手所有错过听牌", "完全随机选", "只选最弱无阻断牌"]'::jsonb, '持有高张同花阻断牌', '高张同花阻断牌减少对手持有强同花的组合，使你的大注 bluff 更容易成功。但仍要结合范围和对手弃牌能力。', '{"board": "flush-complete"}'::jsonb),
  ('q-thin-value', 'exploit', '价值下注', 'intermediate', '对手经常用第三对、A 高跟到河牌。你拿到顶对弱踢脚，河牌没有明显听牌完成。剥削上更常见的调整是？', '["考虑薄价值下注", "所有顶对都过牌", "把顶对转成 bluff", "只下注坚果"]'::jsonb, '考虑薄价值下注', '对手跟注过宽时，很多原本边缘的牌可以变成价值下注。关键是判断更差牌是否会支付。', '{"villainType": "loose-caller"}'::jsonb),
  ('q-pot-odds', 'concept', '数学基础', 'beginner', '底池 100，对手下注 100。你跟注 100 后总底池 300。你大约需要多少胜率才能跟注不亏？', '["25%", "33%", "50%", "67%"]'::jsonb, '33%', '需要胜率 = 跟注金额 / 跟注后总底池 = 100 / 300 = 33.3%。', '{}'::jsonb),
  ('q-polarized-bet', 'concept', '下注结构', 'intermediate', '河牌使用大注时，理论上你的下注范围通常更应该是什么结构？', '["强价值牌 + 合适 bluff", "全部中等牌", "只有空气牌", "任何对子都下注"]'::jsonb, '强价值牌 + 合适 bluff', '大注给对手更差价格，通常需要两极化：强价值牌能被较强跟注范围支付，bluff 靠弃牌收益盈利。', '{}'::jsonb)
on conflict (id) do update set
  type = excluded.type,
  category = excluded.category,
  difficulty = excluded.difficulty,
  prompt = excluded.prompt,
  options = excluded.options,
  answer = excluded.answer,
  explanation = excluded.explanation,
  metadata = excluded.metadata;
