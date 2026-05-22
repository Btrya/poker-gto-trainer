export type Suit = "s" | "h" | "d" | "c";
export type Rank = "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "T" | "J" | "Q" | "K" | "A";
export type Card = `${Rank}${Suit}`;
export type Street = "preflop" | "flop" | "turn" | "river" | "showdown";
export type PlayerAction = "fold" | "call" | "check" | "bet";
export type BotType = "beginner" | "calling-station" | "tight-weak" | "aggressive" | "balanced";

export type PokerPlayer = {
  id: string;
  name: string;
  botType?: BotType;
  isHero: boolean;
  stack: number;
  hole: Card[];
  folded: boolean;
  contribution: number;
  hasActed: boolean;
};

export type PokerGame = {
  players: PokerPlayer[];
  deck: Card[];
  board: Card[];
  pot: number;
  currentBet: number;
  dealerIndex: number;
  actionIndex: number;
  street: Street;
  handNumber: number;
  smallBlind: number;
  bigBlind: number;
  message: string;
  history: string[];
  lastWinners: string[];
};

const ranks: Rank[] = ["2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K", "A"];
const suits: Suit[] = ["s", "h", "d", "c"];

const rankValue: Record<Rank, number> = {
  "2": 2,
  "3": 3,
  "4": 4,
  "5": 5,
  "6": 6,
  "7": 7,
  "8": 8,
  "9": 9,
  T: 10,
  J: 11,
  Q: 12,
  K: 13,
  A: 14,
};

const handNames = ["高牌", "一对", "两对", "三条", "顺子", "同花", "葫芦", "四条", "同花顺"];

const botTypes: BotType[] = ["beginner", "calling-station", "tight-weak", "aggressive", "balanced"];

const botProfiles: Record<
  BotType,
  {
    label: string;
    description: string;
    looseness: number;
    aggression: number;
    bluff: number;
    priceSensitivity: number;
    drawChase: number;
    valueThreshold: number;
  }
> = {
  beginner: {
    label: "新手",
    description: "牌强就下注，牌弱就过牌，偶尔做不稳定跟注。",
    looseness: 0.5,
    aggression: 0.38,
    bluff: 0.08,
    priceSensitivity: 0.78,
    drawChase: 0.45,
    valueThreshold: 0.68,
  },
  "calling-station": {
    label: "跟注站",
    description: "跟注过宽，诈唬少，更容易用边缘牌看到下一张。",
    looseness: 0.9,
    aggression: 0.24,
    bluff: 0.03,
    priceSensitivity: 0.42,
    drawChase: 0.78,
    valueThreshold: 0.72,
  },
  "tight-weak": {
    label: "紧弱",
    description: "入池偏紧，面对压力弃牌过多，适合练习剥削性施压。",
    looseness: 0.25,
    aggression: 0.22,
    bluff: 0.04,
    priceSensitivity: 1.1,
    drawChase: 0.34,
    valueThreshold: 0.76,
  },
  aggressive: {
    label: "激进",
    description: "下注和加压频率高，会用听牌和弱牌施压。",
    looseness: 0.62,
    aggression: 0.82,
    bluff: 0.22,
    priceSensitivity: 0.62,
    drawChase: 0.65,
    valueThreshold: 0.58,
  },
  balanced: {
    label: "均衡",
    description: "接近基础训练模型，价值下注、半诈唬和防守频率更克制。",
    looseness: 0.52,
    aggression: 0.55,
    bluff: 0.12,
    priceSensitivity: 0.72,
    drawChase: 0.58,
    valueThreshold: 0.64,
  },
};

export function getBotProfile(type?: BotType) {
  return type ? botProfiles[type] : null;
}

export function createPokerGame(botCount: number, previous?: PokerGame): PokerGame {
  const playerCount = Math.min(6, Math.max(2, botCount + 1));
  const deck = shuffle(createDeck());
  const dealerIndex = previous ? (previous.dealerIndex + 1) % playerCount : 0;
  const players: PokerPlayer[] = Array.from({ length: playerCount }, (_, index) => ({
    id: index === 0 ? "hero" : `bot-${index}`,
    name: index === 0 ? "你" : `Bot ${index}`,
    botType: index === 0 ? undefined : previous?.players[index]?.botType ?? botTypes[(index - 1) % botTypes.length],
    isHero: index === 0,
    stack: previous?.players[index]?.stack && previous.players[index].stack > 0 ? previous.players[index].stack : 1000,
    hole: [deck.pop()!, deck.pop()!],
    folded: false,
    contribution: 0,
    hasActed: false,
  }));

  const smallBlind = 10;
  const bigBlind = 20;
  const sbIndex = nextIndex(dealerIndex, players.length);
  const bbIndex = nextIndex(sbIndex, players.length);
  postBlind(players[sbIndex], smallBlind);
  postBlind(players[bbIndex], bigBlind);

  const game: PokerGame = {
    players,
    deck,
    board: [],
    pot: smallBlind + bigBlind,
    currentBet: bigBlind,
    dealerIndex,
    actionIndex: nextIndex(bbIndex, players.length),
    street: "preflop",
    handNumber: (previous?.handNumber ?? 0) + 1,
    smallBlind,
    bigBlind,
    message: "新一手开始。翻前行动从大盲左侧开始。",
    history: [`第 ${(previous?.handNumber ?? 0) + 1} 手开始，盲注 ${smallBlind}/${bigBlind}`],
    lastWinners: [],
  };

  return runBotsUntilHero(game);
}

export function act(game: PokerGame, action: PlayerAction): PokerGame {
  if (game.street === "showdown") return game;

  const nextGame = cloneGame(game);
  const player = nextGame.players[nextGame.actionIndex];
  const toCall = Math.max(0, nextGame.currentBet - player.contribution);

  if (!player.isHero || player.folded) return nextGame;

  applyAction(nextGame, player, action, toCall);
  return runBotsUntilHero(nextGame);
}

export function heroToCall(game: PokerGame): number {
  const hero = game.players.find((player) => player.isHero);
  return hero ? Math.max(0, game.currentBet - hero.contribution) : 0;
}

export function activePlayers(game: PokerGame): PokerPlayer[] {
  return game.players.filter((player) => !player.folded);
}

export function cardLabel(card: Card): string {
  const rank = card[0] as Rank;
  const suit = card[1] as Suit;
  const suitLabel: Record<Suit, string> = { s: "♠", h: "♥", d: "♦", c: "♣" };
  return `${rank}${suitLabel[suit]}`;
}

export function cardTone(card: Card): "red" | "black" {
  return card.endsWith("h") || card.endsWith("d") ? "red" : "black";
}

export function describeBestHand(cards: Card[]): string {
  return handNames[evaluateCards(cards).category];
}

function runBotsUntilHero(game: PokerGame): PokerGame {
  let nextGame = cloneGame(game);
  let guard = 0;

  while (nextGame.street !== "showdown" && !nextGame.players[nextGame.actionIndex]?.isHero && guard < 80) {
    const player = nextGame.players[nextGame.actionIndex];
    if (!player || player.folded) {
      nextGame.actionIndex = nextActiveIndex(nextGame, nextGame.actionIndex);
      guard += 1;
      continue;
    }

    const toCall = Math.max(0, nextGame.currentBet - player.contribution);
    const action = chooseBotAction(nextGame, player, toCall);
    applyAction(nextGame, player, action, toCall);
    guard += 1;
  }

  return nextGame;
}

function applyAction(game: PokerGame, player: PokerPlayer, action: PlayerAction, toCall: number) {
  if (action === "fold") {
    player.folded = true;
    player.hasActed = true;
    game.history = [`${player.name} 弃牌`, ...game.history];
  } else if (action === "call") {
    const amount = Math.min(toCall, player.stack);
    player.stack -= amount;
    player.contribution += amount;
    game.pot += amount;
    player.hasActed = true;
    game.history = [`${player.name} 跟注 ${amount}`, ...game.history];
  } else if (action === "bet") {
    const raiseSize = Math.max(game.bigBlind, Math.round(game.pot * 0.55));
    const targetContribution = game.currentBet > 0 ? game.currentBet + raiseSize : raiseSize;
    const amount = Math.min(Math.max(0, targetContribution - player.contribution), player.stack);
    player.stack -= amount;
    player.contribution += amount;
    game.pot += amount;
    game.currentBet = player.contribution;
    game.players.forEach((seat) => {
      if (!seat.folded && seat.id !== player.id) seat.hasActed = false;
    });
    player.hasActed = true;
    game.history = [`${player.name} ${game.currentBet > raiseSize ? "加注" : "下注"} ${amount}`, ...game.history];
  } else {
    player.hasActed = true;
    game.history = [`${player.name} 过牌`, ...game.history];
  }

  settleIfNeeded(game);
}

function settleIfNeeded(game: PokerGame) {
  const livePlayers = activePlayers(game);
  if (livePlayers.length === 1) {
    awardPot(game, [livePlayers[0]], `${livePlayers[0].name} 赢下底池 ${game.pot}`);
    return;
  }

  if (!isBettingRoundComplete(game)) {
    game.actionIndex = nextActiveIndex(game, game.actionIndex);
    return;
  }

  advanceStreet(game);
}

function advanceStreet(game: PokerGame) {
  game.players.forEach((player) => {
    player.contribution = 0;
    player.hasActed = false;
  });
  game.currentBet = 0;

  if (game.street === "preflop") {
    game.board = [game.deck.pop()!, game.deck.pop()!, game.deck.pop()!];
    game.street = "flop";
    game.message = "翻牌圈。观察牌面谁更有范围优势。";
  } else if (game.street === "flop") {
    game.board = [...game.board, game.deck.pop()!];
    game.street = "turn";
    game.message = "转牌圈。注意第二枪和听牌 equity。";
  } else if (game.street === "turn") {
    game.board = [...game.board, game.deck.pop()!];
    game.street = "river";
    game.message = "河牌圈。大注通常更两极化。";
  } else {
    showdown(game);
    return;
  }

  game.history = [`进入${streetLabel(game.street)}：${game.board.map(cardLabel).join(" ")}`, ...game.history];
  game.actionIndex = firstPostflopIndex(game);
}

function showdown(game: PokerGame) {
  const livePlayers = activePlayers(game);
  const ranked = livePlayers.map((player) => ({
    player,
    value: evaluateCards([...player.hole, ...game.board]).value,
  }));
  const best = Math.max(...ranked.map((seat) => seat.value));
  const winners = ranked.filter((seat) => seat.value === best).map((seat) => seat.player);
  awardPot(game, winners, `${winners.map((winner) => winner.name).join("、")} 摊牌赢下底池 ${game.pot}`);
}

function awardPot(game: PokerGame, winners: PokerPlayer[], message: string) {
  const share = Math.floor(game.pot / winners.length);
  winners.forEach((winner) => {
    winner.stack += share;
  });
  game.lastWinners = winners.map((winner) => winner.id);
  game.message = message;
  game.history = [message, ...game.history];
  game.pot = 0;
  game.street = "showdown";
}

function chooseBotAction(game: PokerGame, player: PokerPlayer, toCall: number): PlayerAction {
  const profile = botProfiles[player.botType ?? "balanced"];
  const madeStrength = estimateStrength(game, player);
  const drawStrength = estimateDrawStrength(game, player);
  const strength = Math.min(0.98, madeStrength + drawStrength * profile.drawChase);
  const pressure = toCall / Math.max(1, game.pot + toCall);

  if (toCall > 0) {
    if (strength > 0.74 && profile.aggression > 0.7 && Math.random() < 0.18) return "bet";
    const callScore = strength + profile.looseness * 0.16 - pressure * profile.priceSensitivity;
    if (callScore > 0.46) return "call";
    if (drawStrength > 0.16 && pressure < 0.28 + profile.looseness * 0.08 && Math.random() < profile.drawChase) return "call";
    return "fold";
  }

  if (madeStrength > profile.valueThreshold) return "bet";
  if (drawStrength > 0.18 && Math.random() < profile.aggression * 0.55) return "bet";
  if (madeStrength > 0.48 && Math.random() < profile.aggression * 0.22) return "bet";
  if (madeStrength < 0.38 && Math.random() < profile.bluff) return "bet";
  return "check";
}

function estimateStrength(game: PokerGame, player: PokerPlayer): number {
  if (game.street === "preflop") {
    const [a, b] = player.hole;
    const ar = rankValue[a[0] as Rank];
    const br = rankValue[b[0] as Rank];
    const high = Math.max(ar, br);
    const low = Math.min(ar, br);
    const pair = ar === br ? 0.3 : 0;
    const suited = a[1] === b[1] ? 0.08 : 0;
    const connected = Math.abs(ar - br) <= 2 ? 0.08 : 0;
    return Math.min(0.95, high / 18 + low / 36 + pair + suited + connected);
  }

  const evaluated = evaluateCards([...player.hole, ...game.board]);
  return Math.min(0.95, evaluated.category / 8 + evaluated.kickers[0] / 80);
}

function estimateDrawStrength(game: PokerGame, player: PokerPlayer): number {
  if (game.street === "preflop" || game.board.length < 3) return 0;

  const cards = [...player.hole, ...game.board];
  const suitCounts = suits.map((suit) => cards.filter((card) => card[1] === suit).length);
  const flushDraw = Math.max(...suitCounts) === 4 ? 0.2 : 0;
  const values = [...new Set(cards.map((card) => rankValue[card[0] as Rank]))].sort((a, b) => a - b);
  if (values.includes(14)) values.unshift(1);

  let straightDraw = 0;
  for (let start = 1; start <= 10; start += 1) {
    const window = [start, start + 1, start + 2, start + 3, start + 4];
    const hits = window.filter((value) => values.includes(value)).length;
    if (hits === 4) straightDraw = Math.max(straightDraw, 0.16);
  }

  return Math.min(0.32, flushDraw + straightDraw);
}

function isBettingRoundComplete(game: PokerGame): boolean {
  return activePlayers(game).every((player) => player.hasActed && player.contribution === game.currentBet);
}

function firstPostflopIndex(game: PokerGame): number {
  return nextActiveIndex(game, game.dealerIndex);
}

function nextActiveIndex(game: PokerGame, fromIndex: number): number {
  let index = fromIndex;
  for (let i = 0; i < game.players.length; i += 1) {
    index = nextIndex(index, game.players.length);
    if (!game.players[index].folded) return index;
  }
  return index;
}

function nextIndex(index: number, length: number): number {
  return (index + 1) % length;
}

function postBlind(player: PokerPlayer, blind: number) {
  player.stack -= blind;
  player.contribution += blind;
}

function createDeck(): Card[] {
  return ranks.flatMap((rank) => suits.map((suit) => `${rank}${suit}` as Card));
}

function shuffle(cards: Card[]): Card[] {
  const copy = [...cards];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function cloneGame(game: PokerGame): PokerGame {
  return {
    ...game,
    players: game.players.map((player) => ({ ...player, hole: [...player.hole] })),
    deck: [...game.deck],
    board: [...game.board],
    history: [...game.history],
    lastWinners: [...game.lastWinners],
  };
}

function evaluateCards(cards: Card[]): { category: number; kickers: number[]; value: number } {
  const values = cards.map((card) => rankValue[card[0] as Rank]).sort((a, b) => b - a);
  const counts = new Map<number, number>();
  values.forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1));

  const flushSuit = suits.find((suit) => cards.filter((card) => card[1] === suit).length >= 5);
  const flushValues = flushSuit
    ? cards
        .filter((card) => card[1] === flushSuit)
        .map((card) => rankValue[card[0] as Rank])
        .sort((a, b) => b - a)
    : [];
  const straightHigh = findStraight(values);
  const straightFlushHigh = flushSuit ? findStraight(flushValues) : 0;
  const grouped = [...counts.entries()].sort((a, b) => b[1] - a[1] || b[0] - a[0]);

  if (straightFlushHigh) return pack(8, [straightFlushHigh]);

  const quads = grouped.find(([, count]) => count === 4);
  if (quads) return pack(7, [quads[0], ...values.filter((value) => value !== quads[0]).slice(0, 1)]);

  const trips = grouped.filter(([, count]) => count === 3).map(([value]) => value);
  const pairs = grouped.filter(([, count]) => count === 2).map(([value]) => value);
  if (trips.length && (pairs.length || trips.length > 1)) {
    return pack(6, [trips[0], trips[1] ?? pairs[0]]);
  }

  if (flushSuit) return pack(5, flushValues.slice(0, 5));
  if (straightHigh) return pack(4, [straightHigh]);
  if (trips.length) return pack(3, [trips[0], ...values.filter((value) => value !== trips[0]).slice(0, 2)]);
  if (pairs.length >= 2) {
    return pack(2, [pairs[0], pairs[1], ...values.filter((value) => value !== pairs[0] && value !== pairs[1]).slice(0, 1)]);
  }
  if (pairs.length === 1) return pack(1, [pairs[0], ...values.filter((value) => value !== pairs[0]).slice(0, 3)]);
  return pack(0, values.slice(0, 5));
}

function findStraight(values: number[]): number {
  const unique = [...new Set(values)];
  if (unique.includes(14)) unique.push(1);
  const sorted = unique.sort((a, b) => b - a);

  for (let i = 0; i <= sorted.length - 5; i += 1) {
    const run = sorted.slice(i, i + 5);
    if (run[0] - run[4] === 4) return run[0];
  }
  return 0;
}

function pack(category: number, kickers: number[]) {
  const padded = [...kickers, 0, 0, 0, 0, 0].slice(0, 5);
  const value = [category, ...padded].reduce((total, part) => total * 15 + part, 0);
  return { category, kickers: padded, value };
}

function streetLabel(street: Street): string {
  const labels: Record<Street, string> = {
    preflop: "翻前",
    flop: "翻牌",
    turn: "转牌",
    river: "河牌",
    showdown: "摊牌",
  };
  return labels[street];
}
