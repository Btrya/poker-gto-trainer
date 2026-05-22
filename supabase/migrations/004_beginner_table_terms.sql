insert into public.terms (id, slug, title, category, difficulty, summary, content, examples)
values
  ('term-button', 'button', '按钮位 BTN', '牌桌位置', 'beginner', '按钮位是每手牌最后行动优势最明显的位置。', 'BTN 是 Button，也叫庄位或按钮位。德扑里按钮会每手顺时针移动。翻牌后，按钮位通常最后行动，所以能看到别人先怎么做，再决定下注、过牌或跟注，这是很大的信息优势。', '["前面都弃牌时，BTN 可以用比前位更宽的范围开池。", "BTN vs BB 是最常见的单挑训练场景之一。"]'::jsonb),
  ('term-blinds', 'small-blind-big-blind', '小盲 / 大盲', '牌桌位置', 'beginner', '每手牌开始前强制投入的两个盲注。', '按钮左边是小盲 SB，小盲左边是大盲 BB。盲注是强制投入，用来让底池一开始就有筹码。盲注位翻后通常位置不好，所以即使已经投入筹码，也不能什么牌都硬防守。', '["盲注 10/20 表示小盲先放 10，大盲先放 20。", "BB 面对 BTN 开池时，因为已经投入大盲，防守范围会比其他位置宽。"]'::jsonb),
  ('term-position', 'position', '位置', '牌桌位置', 'beginner', '你在一手牌中行动顺序的相对位置。', '位置决定你能不能后行动。后行动可以先看到对手选择，信息更多，错误更少。新手学习德扑时，位置比单手牌牌力更重要：同一手 KJo，在 BTN 可能能玩，在 UTG 通常就太松。', '["BTN 是最好的位置。", "UTG 是前位，后面很多人没行动，所以范围要紧。"]'::jsonb),
  ('term-streets', 'streets', '翻前 / 翻牌 / 转牌 / 河牌', '基本规则', 'beginner', '一手德扑分成四个主要决策阶段。', '翻前是只拿到两张手牌时的阶段；翻牌是发出三张公共牌；转牌是第四张公共牌；河牌是第五张公共牌。每个阶段都可能有下注、跟注、加注、弃牌或过牌。', '["A♠K♠ 翻前很强，但翻牌没中也不一定能一直下注。", "河牌没有后续发牌，决策更接近最终摊牌。"]'::jsonb),
  ('term-community-cards', 'community-cards', '公共牌', '基本规则', 'beginner', '桌面上所有玩家都能使用的牌。', '德州扑克每个玩家有两张私有手牌，桌面最多五张公共牌。最终从两张手牌和五张公共牌里选出最好的五张牌比大小。', '["你拿 A♠K♠，桌面 A♥7♦2♣，你至少有一对 A。", "如果公共牌自己已经是顺子，所有还在牌局的人都能使用这副顺子。"]'::jsonb),
  ('term-pot', 'pot', '底池', '基本规则', 'beginner', '所有玩家已经投入、等待争夺的筹码。', '底池是这手牌的奖金池。下注和跟注会让底池变大。很多决策都要看底池大小，比如底池赔率、下注尺度、bluff 需要成功的频率。', '["底池 100，你下注 50，就是半池下注。", "对手下注越大，你跟注需要的胜率通常越高。"]'::jsonb),
  ('term-check-call-bet-raise-fold', 'actions', '过牌 / 下注 / 跟注 / 加注 / 弃牌', '基本动作', 'beginner', '德扑里最常用的五类行动。', '过牌 check 是没人下注时选择不下注；下注 bet 是主动投入筹码；跟注 call 是补齐对手下注；加注 raise 是在对手下注基础上再提高价格；弃牌 fold 是放弃这手牌，不再争夺底池。', '["没人下注时你不能 call，只能 check 或 bet。", "有人下注后，你可以 fold、call 或 raise。"]'::jsonb),
  ('term-showdown', 'showdown', '摊牌', '基本规则', 'beginner', '河牌后仍有多人未弃牌时，比牌决定赢家。', '如果最后还有两个或更多玩家没有弃牌，就进入摊牌。系统会比较每个人最好的五张牌。也有很多手牌不摊牌就结束，因为其他人都弃牌了。', '["你下注，所有人弃牌，你不用亮牌也能赢底池。", "河牌你跟注后双方摊牌，比谁的五张牌更大。"]'::jsonb),
  ('term-all-in', 'all-in', 'All-in 全下', '基本动作', 'beginner', '把自己剩余筹码全部投入这手牌。', 'All-in 是把当前剩余筹码全部放进底池。全下后你不能再做更多行动，只等待后续发牌和结算。多人全下时可能出现边池，这会让结算更复杂。', '["短码玩家翻前可能用强牌直接 all-in。", "多人筹码不同全下时，需要按每个人可争夺的金额分主池和边池。"]'::jsonb)
on conflict (id) do update set
  title = excluded.title,
  category = excluded.category,
  difficulty = excluded.difficulty,
  summary = excluded.summary,
  content = excluded.content,
  examples = excluded.examples;
