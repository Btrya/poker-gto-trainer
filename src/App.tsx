import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Brain,
  CheckCircle2,
  CircleUserRound,
  Database,
  GraduationCap,
  Layers3,
  LogIn,
  LogOut,
  RotateCcw,
  Sparkles,
  Target,
} from "lucide-react";
import { lessons as fallbackLessons, questions as fallbackQuestions, terms as fallbackTerms } from "./sampleData";
import { isSupabaseConfigured, supabase } from "./supabase";
import type { Attempt, Lesson, Question, Term } from "./types";

type Section = "overview" | "terms" | "lessons" | "practice";

const navItems: Array<{ id: Section; label: string; icon: typeof BookOpen }> = [
  { id: "overview", label: "总览", icon: Target },
  { id: "terms", label: "术语库", icon: BookOpen },
  { id: "lessons", label: "策略课", icon: GraduationCap },
  { id: "practice", label: "练习", icon: Brain },
];

function App() {
  const [section, setSection] = useState<Section>("overview");
  const [terms, setTerms] = useState<Term[]>(fallbackTerms);
  const [lessons, setLessons] = useState<Lesson[]>(fallbackLessons);
  const [questions, setQuestions] = useState<Question[]>(fallbackQuestions);
  const [attempts, setAttempts] = useState<Attempt[]>(() => readLocalAttempts());
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
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

  return (
    <div className="app-shell">
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

      <main className="content">
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
          <h2>先建立基准策略，再学习如何偏离它。</h2>
          <p>
            这个版本把术语、GTO 基础、剥削调整和互动题库放在一个学习流里。后面接上 Supabase 后，你可以直接在云端维护题库和同步个人进度。
          </p>
          <button className="primary-action" onClick={onStartPractice} type="button">
            <Brain size={18} aria-hidden="true" />
            开始练习
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
      <StatCard label="题目" value={questionCount} detail="翻前、概念、剥削策略" />
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

export default App;
