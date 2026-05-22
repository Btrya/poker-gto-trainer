# Poker GTO Trainer PRD

## 1. Product Goal

Build a single-player Texas Hold'em learning product for beginners who want to understand real poker flow, basic terminology, GTO concepts, and exploitative adjustments.

The product should not feel like a quiz app only. The core experience is a playable poker training table with bots, supported by glossary, short lessons, quizzes, and post-hand review.

This is a play-money learning tool. It must not support real-money gambling, deposits, withdrawals, rake, or debt tracking.

## 2. Target Users

Primary user:

- Knows little or nothing about Texas Hold'em.
- Does not understand terms like BTN, blind, pot, bluff, range, equity.
- Wants to play hands on mobile H5 while learning.
- Wants simple explanations after decisions.

Secondary user:

- Already knows basic rules.
- Wants to practice against different opponent types.
- Wants to learn when to use GTO baseline and when to exploit.

## 3. Product Principles

- Play first, explain nearby.
- Use beginner Chinese first, English poker terms second.
- Every advanced concept needs a plain-language explanation.
- H5 must be treated as a primary surface, not a secondary responsive layout.
- Bot logic should be transparent enough for learning.
- GTO content should be labeled as simplified unless backed by solver data.
- Avoid pretending the app is a real solver before it has solver-backed spots.

## 4. Current State

Already implemented:

- Vite + React + TypeScript frontend.
- Supabase-ready glossary, lessons, questions, and attempts schema.
- H5 layout, bottom navigation, PWA manifest.
- Beginner glossary and GTO/exploit glossary.
- Quiz-style question training.
- Playable single-player poker table.
- 1-5 bots.
- Basic hand dealing, streets, blinds, pot, showdown.
- Bot profiles: beginner, calling station, tight-weak, aggressive, balanced.
- Simple bot decision logic based on hand strength, board, draw strength, price, and profile.

Known limitations:

- No full no-limit betting tree.
- No custom bet sizing.
- No side pots.
- No all-in flow.
- No hand replay.
- No per-hand review scoring.
- No real GTO solver output.
- Bot strategy is heuristic, not solver-based.
- Supabase content management is SQL/table-editor only.

## 5. Core User Flows

### 5.1 First-Time Beginner Flow

1. User opens site on mobile.
2. Sees direct entry to playable poker table.
3. Starts with default 3 bots.
4. App explains current street and legal actions in plain Chinese.
5. User plays a hand.
6. App shows result and a short review.
7. User taps unfamiliar terms to open glossary.

### 5.2 Study Flow

1. User opens glossary.
2. Reads beginner terms: BTN, blinds, pot, check, call, raise, fold.
3. Reads GTO basics: range, equity, MDF, blocker.
4. Takes quiz questions.
5. Mistakes are saved to progress.

### 5.3 Bot Practice Flow

1. User starts a new table.
2. Chooses bot count.
3. Chooses bot types or uses mixed table.
4. Plays hands.
5. Review explains which opponent type was exploitable and why.

### 5.4 H5 Flow

1. User opens on mobile browser.
2. Bottom nav remains reachable.
3. Poker table fits without horizontal scroll.
4. Primary action buttons are thumb-friendly.
5. User can add app to home screen.

## 6. Feature Roadmap

### P0: Make Current Game Legitimately Usable

Goal: Make the playable table feel coherent and understandable.

Features:

- Manual bot type selection before starting a hand.
- Clear bot type labels and short descriptions.
- Legal action rules:
  - Check only when no bet to call.
  - Call only when facing a bet.
  - Bet when no bet exists.
  - Raise when facing a bet.
- Add bet sizing buttons:
  - 1/3 pot
  - 1/2 pot
  - pot
  - all-in placeholder or disabled until all-in is implemented.
- Improve action history readability.
- Add hand result panel:
  - winner
  - winning hand type
  - hero hand type
  - pot won
- Add simple in-hand helper:
  - "你现在需要跟注 X，跟注后底池 Y，需要约 Z% 胜率。"
- Save played hand count locally and optionally to Supabase.

Acceptance criteria:

- A beginner can play 10 hands without needing to understand hidden mechanics.
- Mobile layout has no horizontal scroll at 375px.
- User can tell what each bot type means.

### P1: Beginner Learning Layer

Goal: Make the app teach basic poker language and flow.

Features:

- Glossary search/filter by:
  - beginner
  - rules
  - position
  - actions
  - GTO
  - exploit
- In-game term links:
  - BTN
  - SB/BB
  - pot
  - check/call/raise/fold
  - bluff
- Add "What just happened?" explanations after each street.
- Add beginner lesson path:
  1. What is Texas Hold'em?
  2. How a hand flows.
  3. Positions and blinds.
  4. Hand rankings.
  5. What is a range?
  6. What is value bet vs bluff?

Acceptance criteria:

- A beginner can understand the table labels from the glossary.
- English terms that appear in UI have glossary entries.

### P2: Better Bot Strategy

Goal: Make bots behave like recognizable opponent types.

Features:

- Bot profile config:
  - VPIP tendency
  - preflop tightness
  - aggression frequency
  - bluff frequency
  - call-down frequency
  - draw-chasing tendency
  - fold-to-cbet tendency
- Preflop opening ranges by position.
- BB defend heuristic against different open sizes.
- Postflop board texture detection:
  - dry board
  - wet board
  - paired board
  - monotone board
  - high-card board
  - low-connected board
- Draw detection:
  - flush draw
  - open-ended straight draw
  - gutshot
  - overcards
- Bot action log reasons:
  - "跟注站：价格不贵，所以用中对继续。"
  - "紧弱：面对转牌大注弃牌。"

Acceptance criteria:

- Calling station visibly calls too much.
- Tight-weak visibly folds too much.
- Aggressive bot visibly bets/raises more.
- Bot action explanations match actual profile logic.

### P3: Hand Review and Coaching

Goal: Turn gameplay into learning.

Features:

- Post-hand review:
  - hero decision list
  - pot odds at each call point
  - hand strength by street
  - whether action was value/bluff/protection/check-back
- Mark review labels:
  - good
  - questionable
  - exploit candidate
  - concept to study
- Link review to glossary/lesson.
- Save hand history to Supabase.
- "Replay hand" view.

Acceptance criteria:

- After a hand, user gets at least one useful learning note.
- User can revisit previous hands.

### P4: GTO/Exploit Training Spots

Goal: Add structured training beyond free play.

Features:

- Spot trainer:
  - BTN vs BB single-raised pot
  - CO vs BTN 3-bet pot
  - BB defend spots
  - c-bet spots
  - river bluff-catch spots
- Each spot stores:
  - positions
  - stack depth
  - pot type
  - board
  - hero hand
  - recommended action
  - explanation
  - source/confidence
- Label answers as:
  - simplified theory
  - exploit adjustment
  - solver-backed
- Add source fields:
  - source
  - assumptions
  - confidence

Acceptance criteria:

- User can practice a repeated scenario type.
- Content clearly says whether it is simplified or solver-backed.

### P5: Content Management

Goal: Make content easy to update without redeploying.

Features:

- Admin-only content editor.
- CRUD for terms, lessons, questions, spots.
- Draft/published status.
- Sort order.
- Tags.
- Basic source tracking.
- Import/export CSV or JSON.

Acceptance criteria:

- New terms and questions can be added from an admin UI.
- Public users only see published content.

### P6: Accounts and Progress

Goal: Make progress useful across devices.

Features:

- Supabase magic-link login.
- Save:
  - quiz attempts
  - played hands
  - hand reviews
  - weak categories
  - glossary viewed
  - lesson completion
- Dashboard:
  - hands played
  - quiz accuracy
  - weak concepts
  - recommended next lesson

Acceptance criteria:

- Logged-in user sees the same progress on mobile and desktop.

### P7: Full Poker Engine Improvements

Goal: Move from practice engine to stronger poker simulation.

Features:

- Full no-limit raise rules.
- Multiple raises per street.
- All-in support.
- Side pot support.
- Stack-size aware betting.
- Table reset/rebuy play-money.
- Dealer/blind movement correctness for heads-up and multiway.
- Better showdown and split-pot handling.

Acceptance criteria:

- Common no-limit Texas Hold'em hand flows are supported correctly.

## 7. Data Model Additions

Potential tables:

```sql
bot_profiles
- id
- slug
- title
- description
- config jsonb

hands
- id
- user_id
- played_at
- bot_config jsonb
- hero_cards jsonb
- board jsonb
- actions jsonb
- result jsonb

spots
- id
- type
- category
- difficulty
- positions jsonb
- stack_bb integer
- pot_type text
- board jsonb
- hero_hand text
- options jsonb
- recommendation text
- explanation text
- source text
- assumptions text
- confidence text
- published boolean

term_links
- id
- term_id
- label
- aliases jsonb
```

## 8. Bot Design

Initial bot types:

- Beginner: simple made-hand driven, inconsistent calls.
- Calling Station: calls too wide, rarely bluffs.
- Tight-Weak: folds too often under pressure.
- Aggressive: bets/raises too often, includes bluffs.
- Balanced: restrained baseline bot.

Decision inputs:

- Position.
- Street.
- Hole cards.
- Board cards.
- Current bet and pot.
- Hand category.
- Kicker strength.
- Draws.
- Bot profile parameters.
- Randomizer for mixed behavior.

Future decision inputs:

- Hero observed tendencies.
- Previous actions in hand.
- Stack-to-pot ratio.
- Range advantage.
- Nut advantage.
- Board texture.

## 9. H5 Requirements

- 375px width is a required target.
- No horizontal scroll.
- Bottom nav must not cover primary actions.
- Buttons minimum 44px height.
- Inputs use 16px font size.
- iOS safe area support.
- Poker table must remain readable at 5 bots.
- Action panel should stack below table on mobile.
- Long Chinese text must wrap cleanly.

## 10. Non-Goals

- Real-money gambling.
- Multiplayer with friends.
- Payment or chip cash-out.
- Commercial-grade anti-cheat.
- Claiming solver accuracy without actual solver data.

## 11. Suggested Build Order

1. P0 manual bot type selection and better action buttons.
2. P0 result panel and pot-odds helper.
3. P1 glossary search/filter and more beginner lessons.
4. P2 board texture/draw detection and bot action reasons.
5. P3 hand review.
6. P6 save hands/progress to Supabase.
7. P4 spot trainer with source/confidence fields.
8. P5 admin content editor.
9. P7 full no-limit engine improvements.

