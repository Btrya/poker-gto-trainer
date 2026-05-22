import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Brain,
  CheckCircle2,
  CircleUserRound,
  Database,
  GraduationCap,
  HelpCircle,
  Layers3,
  LogIn,
  LogOut,
  Move,
  Play,
  RotateCcw,
  Sparkles,
  Target,
} from "lucide-react";
import { lessons as fallbackLessons, questions as fallbackQuestions, terms as fallbackTerms } from "./sampleData";
import { isSupabaseConfigured, supabase } from "./supabase";
import {
  act,
  actNextBot,
  cardLabel,
  cardTone,
  createPokerGame,
  describeBestHand,
  getBotProfile,
  heroToCall,
  shouldBotAct,
  type PokerActionEvent,
  type PlayerAction,
  type PokerGame,
  type PokerPlayer,
} from "./pokerEngine";
import type { Attempt, Lesson, Question, Term } from "./types";

type Section = "overview" | "terms" | "lessons" | "practice" | "quiz";

const navItems: Array<{ id: Section; label: string; icon: typeof BookOpen }> = [
  { id: "overview", label: "总览", icon: Target },
  { id: "terms", label: "术语库", icon: BookOpen },
  { id: "lessons", label: "策略课", icon: GraduationCap },
  { id: "practice", label: "牌局", icon: Play },
  { id: "quiz", label: "题库", icon: Brain },
];

function App() {
  const [section, setSection] = useState<Section>("overview");
  const [terms, setTerms] = useState<Term[]>(fallbackTerms);
  const [lessons, setLessons] = useState<Lesson[]>(fallbackLessons);
  const [questions, setQuestions] = useState<Question[]>(fallbackQuestions);
  const [attempts, setAttempts] = useState<Attempt[]>(() => readLocalAttempts());
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [botCount, setBotCount] = useState(3);
  const [animationEnabled, setAnimationEnabled] = useState(true);
  const [pokerGame, setPokerGame] = useState<PokerGame>(() => createPokerGame(3));
  const [actionEvent, setActionEvent] = useState<PokerActionEvent | null>(null);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [authEmail, setAuthEmail] = useState("");
  const [authMessage, setAuthMessage] = useState("");

  const activeQuestion = questions[activeQuestionIndex] ?? fallbackQuestions[0];
  const answeredCurrent = attempts.find((attempt) => attempt.questionId === activeQuestion.id);

  const stats = useMemo(() => {
    const correct = attempts.filter((attempt) => attempt.isCorrect).length;
    const total = attempts.length;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
    const weakCategory = questions
      .map((question) => {
        const related = attempts.filter((attempt) => attempt.questionId === question.id);
        return { category: question.category, misses: related.filter((attempt) => !attempt.isCorrect).length };
      })
      .sort((a, b) => b.misses - a.misses)[0]?.category;

    return { correct, total, accuracy, weakCategory: weakCategory ?? "暂无" };
  }, [attempts, questions]);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    async function loadCloudData() {
      const [{ data: termRows }, { data: lessonRows }, { data: questionRows }, { data: sessionData }] =
        await Promise.all([
          supabase!.from("terms").select("*").order("created_at", { ascending: true }),
          supabase!.from("lessons").select("*").order("sort_order", { ascending: true }),
          supabase!.from("questions").select("*").order("created_at", { ascending: true }),
          supabase!.auth.getSession(),
        ]);

      if (termRows?.length) setTerms(termRows as Term[]);
      if (lessonRows?.length) setLessons(lessonRows as Lesson[]);
      if (questionRows?.length) setQuestions(questionRows as Question[]);
      setSessionEmail(sessionData.session?.user.email ?? null);

      if (sessionData.session?.user.id) {
        const { data: attemptRows } = await supabase!
          .from("attempts")
          .select("question_id, selected_answer, is_correct, created_at")
          .eq("user_id", sessionData.session.user.id)
          .order("created_at", { ascending: false });

        if (attemptRows) {
          setAttempts(
            attemptRows.map((row) => ({
              questionId: row.question_id,
              selectedAnswer: row.selected_answer,
              isCorrect: row.is_correct,
              createdAt: row.created_at,
            })),
          );
        }
      }
    }

    void loadCloudData();
  }, []);

  useEffect(() => {
    localStorage.setItem("poker-gto-attempts", JSON.stringify(attempts));
  }, [attempts]);

  useEffect(() => {
    if (!animationEnabled || actionEvent || !shouldBotAct(pokerGame)) return;

    const timer = window.setTimeout(() => {
      const result = actNextBot(pokerGame);
      setPokerGame(result.game);
      setActionEvent(result.event);
    }, 520);

    return () => window.clearTimeout(timer);
  }, [actionEvent, animationEnabled, pokerGame]);

  useEffect(() => {
    if (!animationEnabled && shouldBotAct(pokerGame)) {
      setPokerGame((current) => resolveBotsSync(current));
    }
  }, [animationEnabled, pokerGame]);

  useEffect(() => {
    if (!actionEvent) return;

    const timer = window.setTimeout(() => {
      setActionEvent(null);
    }, 620);

    return () => window.clearTimeout(timer);
  }, [actionEvent]);

  async function handleMagicLink(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || !authEmail) return;

    const { error } = await supabase.auth.signInWithOtp({
      email: authEmail,
      options: { emailRedirectTo: window.location.origin },
    });

    setAuthMessage(error ? error.message : "登录链接已发送，去邮箱点一下就能同步进度。");
  }

  async function handleSignOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    setSessionEmail(null);
    setAttempts(readLocalAttempts());
  }

  async function submitAnswer(answer: string) {
    const isCorrect = answer === activeQuestion.answer;
    const nextAttempt: Attempt = {
      questionId: activeQuestion.id,
      selectedAnswer: answer,
      isCorrect,
      createdAt: new Date().toISOString(),
    };

    setSelectedAnswer(answer);
    setAttempts((current) => [nextAttempt, ...current.filter((attempt) => attempt.questionId !== activeQuestion.id)]);

    if (supabase) {
      const { data } = await supabase.auth.getSession();
      const userId = data.session?.user.id;
      if (userId) {
        await supabase.from("attempts").insert({
          user_id: userId,
          question_id: activeQuestion.id,
          selected_answer: answer,
          is_correct: isCorrect,
        });
      }
    }
  }

  function nextQuestion() {
    setSelectedAnswer("");
    setActiveQuestionIndex((index) => (index + 1) % questions.length);
  }

  function resetLocalProgress() {
    setAttempts([]);
    localStorage.removeItem("poker-gto-attempts");
  }

  function startNewPokerHand(nextBotCount = botCount) {
    setBotCount(nextBotCount);
    setActionEvent(null);
    setPokerGame((current) => {
      const nextGame = createPokerGame(nextBotCount, current);
      return animationEnabled ? nextGame : resolveBotsSync(nextGame);
    });
  }

  function handlePokerAction(action: PlayerAction) {
    setPokerGame((current) => {
      const result = act(current, action);
      setActionEvent(animationEnabled ? result.event : null);
      return animationEnabled ? result.game : resolveBotsSync(result.game);
    });
  }

  return (
    <div className={`app-shell section-${section}`}>
      <aside className="sidebar" aria-label="主导航">
        <div className="brand">
          <span className="brand-mark">
            <Layers3 size={22} aria-hidden="true" />
          </span>
          <div>
            <strong>GTO Trainer</strong>
            <span>德扑学习训练器</span>
          </div>
        </div>

        <nav className="nav-list">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                className={section === item.id ? "nav-button active" : "nav-button"}
                key={item.id}
                onClick={() => setSection(item.id)}
                type="button"
              >
                <Icon size={18} aria-hidden="true" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="sync-panel">
          <div className="sync-title">
            <Database size={18} aria-hidden="true" />
            Supabase
          </div>
          <p>{isSupabaseConfigured ? "已配置云端连接，可同步题库和练习记录。" : "未配置环境变量，当前使用本地示例数据预览。"}</p>
        </div>
      </aside>

      <main className={`content content-${section}`}>
        <header className="topbar">
          <div>
            <p className="eyebrow">Single Player Study Lab</p>
            <h1>用结构化练习学习 GTO 和剥削策略</h1>
          </div>
          <AuthPanel
            authEmail={authEmail}
            authMessage={authMessage}
            isConfigured={isSupabaseConfigured}
            onEmailChange={setAuthEmail}
            onSignIn={handleMagicLink}
            onSignOut={handleSignOut}
            sessionEmail={sessionEmail}
          />
        </header>

        {section === "overview" && (
          <Overview
            lessonCount={lessons.length}
            questionCount={questions.length}
            stats={stats}
            termCount={terms.length}
            onStartPractice={() => setSection("practice")}
          />
        )}

        {section === "terms" && <Terms terms={terms} />}
        {section === "lessons" && <Lessons lessons={lessons} />}
        {section === "practice" && (
          <PokerPractice
            botCount={botCount}
            game={pokerGame}
            onAction={handlePokerAction}
            actionEvent={animationEnabled ? actionEvent : null}
            animationEnabled={animationEnabled}
            onBotCountChange={startNewPokerHand}
            onToggleAnimation={setAnimationEnabled}
            onNewHand={() => startNewPokerHand()}
          />
        )}
        {section === "quiz" && (
          <Practice
            activeQuestion={activeQuestion}
            answeredCurrent={answeredCurrent}
            onNext={nextQuestion}
            onReset={resetLocalProgress}
            onSubmit={submitAnswer}
            questionNumber={activeQuestionIndex + 1}
            selectedAnswer={selectedAnswer}
            totalQuestions={questions.length}
          />
        )}
      </main>
    </div>
  );
}

function AuthPanel({
  authEmail,
  authMessage,
  isConfigured,
  onEmailChange,
  onSignIn,
  onSignOut,
  sessionEmail,
}: {
  authEmail: string;
  authMessage: string;
  isConfigured: boolean;
  onEmailChange: (value: string) => void;
  onSignIn: (event: React.FormEvent<HTMLFormElement>) => void;
  onSignOut: () => void;
  sessionEmail: string | null;
}) {
  if (!isConfigured) {
    return (
      <div className="account-pill">
        <CircleUserRound size={18} aria-hidden="true" />
        本地预览
      </div>
    );
  }

  if (sessionEmail) {
    return (
      <div className="account-box">
        <span>{sessionEmail}</span>
        <button className="icon-button" onClick={onSignOut} type="button" aria-label="退出登录">
          <LogOut size={18} aria-hidden="true" />
        </button>
      </div>
    );
  }

  return (
    <form className="login-form" onSubmit={onSignIn}>
      <label htmlFor="email">邮箱登录</label>
      <div>
        <input
          id="email"
          onChange={(event) => onEmailChange(event.target.value)}
          placeholder="you@example.com"
          type="email"
          value={authEmail}
        />
        <button type="submit" aria-label="发送登录链接">
          <LogIn size={18} aria-hidden="true" />
        </button>
      </div>
      {authMessage && <small>{authMessage}</small>}
    </form>
  );
}

function Overview({
  lessonCount,
  onStartPractice,
  questionCount,
  stats,
  termCount,
}: {
  lessonCount: number;
  onStartPractice: () => void;
  questionCount: number;
  stats: { accuracy: number; correct: number; total: number; weakCategory: string };
  termCount: number;
}) {
  return (
    <section className="dashboard-grid">
      <div className="hero-panel">
        <div className="hero-copy">
          <p className="eyebrow">今日训练重点</p>
          <h2>先坐下来打几手，再用术语和题库补概念。</h2>
          <p>
            牌局训练支持设置机器人数量，按真实德扑流程发牌、行动、摊牌和结算。术语库会从按钮位、大小盲、底池这些基础概念讲起，再逐步进入 GTO 和剥削策略。
          </p>
          <button className="primary-action" onClick={onStartPractice} type="button">
            <Play size={18} aria-hidden="true" />
            开始牌局
          </button>
        </div>
        <div className="table-visual" aria-label="扑克训练桌示意">
          <div className="felt">
            <span className="seat top">BTN</span>
            <span className="seat left">BB</span>
            <span className="seat right">CO</span>
            <div className="board-cards">
              <span>A</span>
              <span>7</span>
              <span>2</span>
            </div>
          </div>
        </div>
      </div>

      <StatCard label="术语" value={termCount} detail="GTO / EV / MDF / blocker" />
      <StatCard label="课程" value={lessonCount} detail="短内容，适合反复看" />
      <StatCard label="题库" value={questionCount} detail="翻前、概念、剥削策略" />
      <StatCard label="正确率" value={`${stats.accuracy}%`} detail={`${stats.correct}/${stats.total} 已完成`} />

      <div className="wide-panel">
        <div>
          <p className="eyebrow">下一步</p>
          <h3>最值得先补的是：{stats.weakCategory}</h3>
        </div>
        <p>
          MVP 阶段先覆盖最基础但最常用的决策：位置范围、下注频率、MDF、对手类型。等题库稳定后，再加入更细的牌面纹理和下注尺度训练。
        </p>
      </div>
    </section>
  );
}

function PokerPractice({
  actionEvent,
  animationEnabled,
  botCount,
  game,
  onAction,
  onBotCountChange,
  onToggleAnimation,
  onNewHand,
}: {
  actionEvent: PokerActionEvent | null;
  animationEnabled: boolean;
  botCount: number;
  game: PokerGame;
  onAction: (action: PlayerAction) => void;
  onBotCountChange: (count: number) => void;
  onToggleAnimation: (enabled: boolean) => void;
  onNewHand: () => void;
}) {
  const hero = game.players.find((player) => player.isHero)!;
  const toCall = heroToCall(game);
  const canCheck = toCall === 0;
  const isShowdown = game.street === "showdown";
  const waitingForBot = shouldBotAct(game) || Boolean(actionEvent);
  const [panelOffset, setPanelOffset] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState<{
    x: number;
    y: number;
    panelX: number;
    panelY: number;
    rect: DOMRect;
  } | null>(null);
  const panelStyle = {
    "--panel-x": `${panelOffset.x}px`,
    "--panel-y": `${panelOffset.y}px`,
  } as React.CSSProperties;

  function handlePanelPointerDown(event: React.PointerEvent<HTMLButtonElement>) {
    const panel = event.currentTarget.closest(".action-panel");
    if (!panel) return;

    event.currentTarget.setPointerCapture(event.pointerId);
    setDragStart({
      x: event.clientX,
      y: event.clientY,
      panelX: panelOffset.x,
      panelY: panelOffset.y,
      rect: panel.getBoundingClientRect(),
    });
  }

  function handlePanelPointerMove(event: React.PointerEvent<HTMLButtonElement>) {
    if (!dragStart) return;

    const deltaX = event.clientX - dragStart.x;
    const deltaY = event.clientY - dragStart.y;
    const minLeft = 8;
    const maxLeft = Math.max(minLeft, window.innerWidth - dragStart.rect.width - 8);
    const minTop = 82;
    const maxTop = Math.max(minTop, window.innerHeight - dragStart.rect.height - 8);
    const desiredLeft = clamp(dragStart.rect.left + deltaX, minLeft, maxLeft);
    const desiredTop = clamp(dragStart.rect.top + deltaY, minTop, maxTop);
    const nextX = dragStart.panelX + desiredLeft - dragStart.rect.left;
    const nextY = dragStart.panelY + desiredTop - dragStart.rect.top;

    setPanelOffset({ x: nextX, y: nextY });
  }

  function stopPanelDrag(event: React.PointerEvent<HTMLButtonElement>) {
    event.currentTarget.releasePointerCapture(event.pointerId);
    setDragStart(null);
  }

  return (
    <section className="play-layout">
      <article className="poker-table-panel">
        <div className="play-toolbar">
          <div>
            <p className="eyebrow">Hand #{game.handNumber}</p>
            <h2>单人实战牌局</h2>
          </div>
          <label className="bot-select">
            机器人
            <select value={botCount} onChange={(event) => onBotCountChange(Number(event.target.value))}>
              {[1, 2, 3, 4, 5].map((count) => (
                <option key={count} value={count}>
                  {count} 个
                </option>
              ))}
            </select>
          </label>
          <label className="animation-toggle">
            <input checked={animationEnabled} onChange={(event) => onToggleAnimation(event.target.checked)} type="checkbox" />
            动画
          </label>
        </div>

        <div className="poker-felt" aria-label="德扑牌桌">
          <div className="community-board">
            {Array.from({ length: 5 }).map((_, index) => {
              const card = game.board[index];
              return card ? <CardView card={card} key={card} /> : <span className="empty-card" key={index} />;
            })}
          </div>
          <div className="pot-display">底池 {game.pot}</div>
          {actionEvent && <ActionBurst event={actionEvent} total={game.players.length} />}
          {game.players.map((player, index) => (
            <PlayerSeat
              active={game.actionIndex === index && !isShowdown}
              blind={game.smallBlindIndex === index ? "SB" : game.bigBlindIndex === index ? "BB" : undefined}
              dealer={game.dealerIndex === index}
              key={player.id}
              player={player}
              reveal={player.isHero || isShowdown}
              total={game.players.length}
              index={index}
              winner={game.lastWinners.includes(player.id)}
            />
          ))}
        </div>
      </article>

      <aside className="action-panel" style={panelStyle}>
        <div className="panel-title">
          <Sparkles size={18} aria-hidden="true" />
          当前决策
          <button
            aria-label="拖动调整决策栏位置，双击复位"
            className="decision-drag-handle"
            onDoubleClick={() => setPanelOffset({ x: 0, y: 0 })}
            onPointerCancel={stopPanelDrag}
            onPointerDown={handlePanelPointerDown}
            onPointerMove={handlePanelPointerMove}
            onPointerUp={stopPanelDrag}
            title="拖动调整决策栏位置，双击复位"
            type="button"
          >
            <Move size={16} aria-hidden="true" />
          </button>
        </div>
        <p>{game.message}</p>
        <div className="hero-hand">
          {hero.hole.map((card) => (
            <CardView card={card} key={card} />
          ))}
          {game.board.length > 0 && <span>{describeBestHand([...hero.hole, ...game.board])}</span>}
        </div>

        {!isShowdown ? (
          <div className="action-grid">
            <button className="secondary-action" disabled={waitingForBot} onClick={() => onAction("fold")} type="button">
              弃牌
            </button>
            <button className="secondary-action" disabled={waitingForBot} onClick={() => onAction(canCheck ? "check" : "call")} type="button">
              {canCheck ? "过牌" : `跟注 ${toCall}`}
            </button>
            <button className="primary-action" disabled={waitingForBot} onClick={() => onAction("bet")} type="button">
              {canCheck ? "下注" : "加压"}
            </button>
          </div>
        ) : (
          <button className="primary-action" onClick={onNewHand} type="button">
            下一手
          </button>
        )}

        <div className="tip-box">
          <HelpCircle size={16} aria-hidden="true" />
          <span>第一版机器人是规则模型，不是 solver。目标是练流程、位置、下注和复盘。</span>
        </div>

        <div className="hand-history">
          {game.history.slice(0, 7).map((line) => (
            <span key={line}>{line}</span>
          ))}
        </div>
      </aside>
    </section>
  );
}

function ActionBurst({ event, total }: { event: PokerActionEvent; total: number }) {
  const angle = -90 + event.playerIndex * (360 / total);
  const radius = 37;
  const x = 50 + radius * Math.cos((angle * Math.PI) / 180);
  const y = 50 + radius * Math.sin((angle * Math.PI) / 180);
  const isFold = event.action === "fold";
  const isCheck = event.action === "check";

  return (
    <div className={`action-burst ${event.action}`} style={{ left: `${x}%`, top: `${y}%` }}>
      <span>{event.label}</span>
      {isFold ? (
        <div className="fold-cards">
          <i />
          <i />
        </div>
      ) : isCheck ? (
        <div className="check-pulse">过</div>
      ) : (
        <div className="chip-stack">
          <i />
          <i />
          <i />
        </div>
      )}
    </div>
  );
}

function PlayerSeat({
  active,
  blind,
  dealer,
  index,
  player,
  reveal,
  total,
  winner,
}: {
  active: boolean;
  blind?: "SB" | "BB";
  dealer: boolean;
  index: number;
  player: PokerPlayer;
  reveal: boolean;
  total: number;
  winner: boolean;
}) {
  const angle = -90 + index * (360 / total);
  const radius = 37;
  const x = 50 + radius * Math.cos((angle * Math.PI) / 180);
  const y = 50 + radius * Math.sin((angle * Math.PI) / 180);

  return (
    <div
      className={`player-seat ${active ? "acting" : ""} ${player.folded ? "folded" : ""} ${winner ? "winner" : ""}`}
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      <div className="mini-cards">
        {player.hole.map((card, cardIndex) => (reveal ? <CardView card={card} compact key={card} /> : <span className="card-back" key={cardIndex} />))}
      </div>
      <strong>
        {player.name}
        <span className="position-chips">
          {dealer && <span className="dealer-chip">D</span>}
          {blind && <span className="blind-chip">{blind}</span>}
        </span>
      </strong>
      <span>{player.folded ? "已弃牌" : `${player.stack} 筹码`}</span>
      {player.botType && <em>{getBotProfile(player.botType)?.label}</em>}
    </div>
  );
}

function CardView({ card, compact = false }: { card: string; compact?: boolean }) {
  return <span className={`playing-card ${cardTone(card as never)} ${compact ? "compact" : ""}`}>{cardLabel(card as never)}</span>;
}

function StatCard({ detail, label, value }: { detail: string; label: string; value: number | string }) {
  return (
    <article className="stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{detail}</p>
    </article>
  );
}

function Terms({ terms }: { terms: Term[] }) {
  return (
    <section className="card-grid">
      {terms.map((term) => (
        <article className="learn-card" key={term.id}>
          <div className="card-heading">
            <span>{term.category}</span>
            <span>{term.difficulty}</span>
          </div>
          <h2>{term.title}</h2>
          <p className="summary">{term.summary}</p>
          <p>{term.content}</p>
          <ul>
            {term.examples.map((example) => (
              <li key={example}>{example}</li>
            ))}
          </ul>
        </article>
      ))}
    </section>
  );
}

function Lessons({ lessons }: { lessons: Lesson[] }) {
  return (
    <section className="lesson-list">
      {lessons.map((lesson, index) => (
        <article className="lesson-row" key={lesson.id}>
          <div className="lesson-index">{String(index + 1).padStart(2, "0")}</div>
          <div>
            <div className="card-heading">
              <span>{lesson.category}</span>
              <span>{lesson.difficulty}</span>
            </div>
            <h2>{lesson.title}</h2>
            <p>{lesson.content}</p>
            <div className="takeaways">
              {lesson.takeaways.map((takeaway) => (
                <span key={takeaway}>{takeaway}</span>
              ))}
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}

function Practice({
  activeQuestion,
  answeredCurrent,
  onNext,
  onReset,
  onSubmit,
  questionNumber,
  selectedAnswer,
  totalQuestions,
}: {
  activeQuestion: Question;
  answeredCurrent?: Attempt;
  onNext: () => void;
  onReset: () => void;
  onSubmit: (answer: string) => void;
  questionNumber: number;
  selectedAnswer: string;
  totalQuestions: number;
}) {
  const chosen = selectedAnswer || answeredCurrent?.selectedAnswer || "";
  const isAnswered = Boolean(chosen);

  return (
    <section className="practice-layout">
      <article className="question-panel">
        <div className="card-heading">
          <span>
            {questionNumber}/{totalQuestions}
          </span>
          <span>{activeQuestion.category}</span>
        </div>
        <h2>{activeQuestion.prompt}</h2>

        <div className="meta-row">
          {Object.entries(activeQuestion.metadata).map(([key, value]) =>
            value ? (
              <span key={key}>
                {key}: {value}
              </span>
            ) : null,
          )}
        </div>

        <div className="answer-list">
          {activeQuestion.options.map((option) => {
            const isSelected = chosen === option;
            const isCorrect = option === activeQuestion.answer;
            const className = isAnswered
              ? isCorrect
                ? "answer-option correct"
                : isSelected
                  ? "answer-option wrong"
                  : "answer-option muted"
              : "answer-option";

            return (
              <button className={className} disabled={isAnswered} key={option} onClick={() => onSubmit(option)} type="button">
                <span>{option}</span>
                {isAnswered && isCorrect && <CheckCircle2 size={18} aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      </article>

      <aside className="explain-panel">
        <div className="panel-title">
          <Sparkles size={18} aria-hidden="true" />
          解析
        </div>
        {isAnswered ? (
          <>
            <strong>{chosen === activeQuestion.answer ? "这手选得合理" : "这手需要复盘"}</strong>
            <p>{activeQuestion.explanation}</p>
            <button className="primary-action" onClick={onNext} type="button">
              下一题
            </button>
          </>
        ) : (
          <p>先根据位置、范围和对手类型做选择。提交后这里会显示推荐思路。</p>
        )}
        <button className="secondary-action" onClick={onReset} type="button">
          <RotateCcw size={16} aria-hidden="true" />
          清空本地进度
        </button>
      </aside>
    </section>
  );
}

function readLocalAttempts(): Attempt[] {
  try {
    return JSON.parse(localStorage.getItem("poker-gto-attempts") ?? "[]") as Attempt[];
  } catch {
    return [];
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function resolveBotsSync(game: PokerGame): PokerGame {
  let current = game;
  let guard = 0;

  while (shouldBotAct(current) && guard < 80) {
    current = actNextBot(current).game;
    guard += 1;
  }

  return current;
}

export default App;
