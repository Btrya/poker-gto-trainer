# GTO Poker Trainer

单人版德扑 GTO / 剥削策略学习训练器。前端使用 Vite + React + TypeScript，数据和个人练习记录可接 Supabase，部署目标是 Vercel。

## 本地运行

```bash
pnpm install
pnpm dev
```

没有配置 Supabase 时，应用会使用 `src/sampleData.ts` 的示例内容，练习记录暂存在浏览器本地。

## 你需要在 Supabase 做什么

1. 打开 Supabase，新建一个 project。
2. 进入 `SQL Editor`，依次执行：
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_seed_content.sql`
   - `supabase/migrations/003_expand_learning_content.sql`
3. 进入 `Authentication > Providers`，确认 `Email` provider 开启。
4. 进入 `Authentication > URL Configuration`：
   - 本地开发时把 `Site URL` 设为 `http://localhost:5173`
   - 部署到 Vercel 后改成你的正式域名
   - `Redirect URLs` 加上 `http://localhost:5173` 和你的正式域名
5. 进入 `Project Settings > API`，复制：
   - `Project URL`
   - `anon public` key

## 本地环境变量

复制 `.env.example` 为 `.env.local`：

```bash
VITE_SUPABASE_URL=你的 Project URL
VITE_SUPABASE_ANON_KEY=你的 anon public key
```

## Vercel 部署

1. 把这个目录推到 GitHub。
2. 在 Vercel 新建项目并选择该 repo。
3. Framework 选择 Vite，默认构建命令是 `pnpm build`，输出目录是 `dist`。
4. 在 Vercel 的 `Environment Variables` 添加：
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. 绑定你的域名。
6. 回到 Supabase，把 Authentication 的 Site URL 和 Redirect URLs 改成你的域名。

## 后续可以扩展

- 题库后台管理
- 错题本和薄弱分类统计
- 翻前 range 矩阵练习
- 牌面纹理训练
- 每日训练计划
- 预计算 GTO 答案库

## H5 支持

当前界面已经按移动端 H5 做了适配：

- 手机端底部固定 Tab 导航
- iOS 安全区适配
- 移动端触控按钮尺寸
- 输入框 16px，避免 iOS 自动放大
- PWA manifest 和图标，可从手机浏览器添加到主屏幕
