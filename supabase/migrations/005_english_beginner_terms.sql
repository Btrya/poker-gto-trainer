insert into public.terms (id, slug, title, category, difficulty, summary, content, examples)
values
  ('term-bluff', 'bluff', 'Bluff 诈唬', '常用英文', 'beginner', '牌不够强时下注，希望对手弃掉更好的牌。', 'Bluff 不是乱吓人，而是利用对手会弃牌这一点来赢底池。好的 bluff 通常要考虑牌面、你的范围、对手类型、下注尺度和阻断牌。对很爱跟注的人，bluff 通常要减少。', '["你河牌错过同花，但拿着阻断坚果同花的 A，可以作为某些 bluff 候选。", "对跟注站少 bluff，多价值下注。"]'::jsonb),
  ('term-call', 'call', 'Call 跟注', '常用英文', 'beginner', '补齐对手下注金额，继续留在牌局中。', 'Call 是跟注。有人下注 50，你也放入 50 就是 call。跟注前要想：我需要多少胜率？对手可能有什么牌？后面还会不会继续被下注？', '["对手下注 50，你跟 50，这就是 call。", "用只能赢 bluff 的牌 call，叫 bluff-catch。"]'::jsonb),
  ('term-raise', 'raise', 'Raise 加注', '常用英文', 'beginner', '在对手下注基础上提高价格。', 'Raise 是加注。加注会让对手付出更高价格才能继续。加注可以是价值加注，也可以是 bluff 或半诈唬。新手不要看到强牌才加注，也不要用完全没理由的牌乱加注。', '["对手下注 50，你加到 150，这就是 raise。", "强听牌有时可以 raise，既有成牌机会，也有弃牌收益。"]'::jsonb),
  ('term-check', 'check', 'Check 过牌', '常用英文', 'beginner', '没人下注时选择不下注，把行动交给后面的人。', 'Check 是过牌。只有当前没有人下注时才能 check。过牌不等于放弃，有时是控池，有时是诱导对手 bluff，有时是因为牌面不适合你下注。', '["BB 翻牌先行动，经常可以 check 给翻前进攻者。", "中等摊牌价值牌经常适合 check。"]'::jsonb),
  ('term-fold', 'fold', 'Fold 弃牌', '常用英文', 'beginner', '放弃这手牌，不再争夺当前底池。', 'Fold 是弃牌。弃牌不是怂，而是避免继续投入负 EV 筹码。GTO 防守会要求你保留足够牌继续，但面对明显不 bluff 的玩家，剥削上可以多弃牌。', '["紧弱玩家面对大注经常 fold 过多。", "河牌对手严重 bluff 不足时，普通抓诈牌可以 fold。"]'::jsonb)
on conflict (id) do update set
  title = excluded.title,
  category = excluded.category,
  difficulty = excluded.difficulty,
  summary = excluded.summary,
  content = excluded.content,
  examples = excluded.examples;
