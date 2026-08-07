<div align="center">

# 🌌 ZHIHU://VERSE

**Powered by Zhihu CLI — turn Zhihu into a knowledge universe you can explore, collide, play, and revisit.**

<p>
  <a href="https://charlespikachu.github.io/zhihu-verse/">
    <img src="https://img.shields.io/badge/Live%20Demo-ENTER%20THE%20VERSE-00C853?style=for-the-badge&logo=githubpages&logoColor=white" alt="Live Demo" />
  </a>
</p>

<p>
  <a href="https://developer.zhihu.com/docs?key=zhihu_cli"><img src="https://img.shields.io/badge/Powered%20by-Zhihu%20CLI-0084FF?style=flat-square" alt="Powered by Zhihu CLI" /></a>
  <a href="https://github.com/CharlesPikachu/zhihu-verse/actions/workflows/deploy-pages.yml"><img src="https://github.com/CharlesPikachu/zhihu-verse/actions/workflows/deploy-pages.yml/badge.svg?branch=main" alt="Deploy GitHub Pages" /></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/license-Apache--2.0-blue?style=flat-square" alt="License" /></a>
  <a href="https://github.com/CharlesPikachu/zhihu-verse/stargazers"><img src="https://img.shields.io/github/stars/CharlesPikachu/zhihu-verse?style=flat-square&logo=github&label=Stars" alt="GitHub stars" /></a>
  <a href="https://github.com/CharlesPikachu/zhihu-verse/network/members"><img src="https://img.shields.io/github/forks/CharlesPikachu/zhihu-verse?style=flat-square&logo=github&label=Forks" alt="GitHub forks" /></a>
  <a href="https://github.com/CharlesPikachu/zhihu-verse/issues"><img src="https://img.shields.io/github/issues/CharlesPikachu/zhihu-verse?style=flat-square&logo=github" alt="GitHub issues" /></a>
  <img src="https://img.shields.io/github/last-commit/CharlesPikachu/zhihu-verse?style=flat-square&logo=github" alt="Last commit" />
</p>

<p>
  <a href="./README.md">简体中文</a>
  ·
  <a href="./README_EN.md"><strong>English</strong></a>
</p>

<p>
  <a href="https://charlespikachu.github.io/zhihu-verse/"><strong>🌐 Live Demo</strong></a>
  ·
  <a href="https://www.zhihu.com/question/2068735236100154306/answer/2069250015713875761"><strong>📖 Project Introduction</strong></a>
  ·
  <a href="https://developer.zhihu.com/docs?key=zhihu_cli"><strong>🧩 Zhihu CLI Docs</strong></a>
</p>

</div>

---

## 🌠 What is ZHIHU://VERSE?

**ZHIHU://VERSE** is an interactive playground powered by **Zhihu CLI**.

Instead of turning Open Platform endpoints into isolated API demos, it recombines **Zhihu Search, Web Search, Zhida, Hot List, personal content, follows, favorites, collections, PDF parsing, and PPT generation** into **nine playable experiments**. Explore knowledge nodes, collide two concepts, build a knowledge graph, generate quizzes from your favorites, turn trending questions into a runner game, or create your own memory planet and yearly recap.

**No credentials are required to start.** Enter Demo Mode to explore the complete interaction flow, then connect your own Access Secret whenever you want to work with live Zhihu data.

> For the design rationale, interaction ideas, and a complete project introduction, see the [Zhihu post](https://www.zhihu.com/question/2068735236100154306/answer/2069250015713875761).

---

## 🚀 Quick Start

### 1. Run Locally

```bash
git clone https://github.com/CharlesPikachu/zhihu-verse.git
cd zhihu-verse
python -m http.server 4173
```

Then open:

```text
http://127.0.0.1:4173
```

### 2. Choose a Data Mode

| Mode | Access Secret Required | Best for |
| --- | :---: | --- |
| `ENTER DEMO` | ❌ | Explore every experiment and its interactions immediately. |
| `CONNECT ZHIHU` | ✅ | Connect your own Access Secret and use live Zhihu data. |
| `OFFLINE / DEMO` | — | Switch between the currently available data modes. |

> [!IMPORTANT]
> **Treat your Access Secret as a sensitive credential.** Do not commit it to the repository or expose it in issues, public logs, or screenshots.

### 3. CORS / Cloudflare Worker

If direct browser requests to the Zhihu Open Platform are blocked by CORS, deploy the Cloudflare Worker in `worker/` and set its URL in `config.js`:

```js
window.ZHIHU_VERSE_CONFIG = {
  proxyUrl: 'https://your-worker.workers.dev',
  defaultTransport: 'auto'
};
```

### 4. GitHub Pages

The repository already includes:

```text
.github/workflows/deploy-pages.yml
```

Set the repository's **Pages Source** to **GitHub Actions** to deploy with the existing workflow.

---

## 🎮 Nine Experiments

### 01. 🔭 EXPLORE — Dual-domain Exploration

- **What it does:** Turn Zhihu and web search results into expandable spatial nodes.
- **Zhihu CLI:** Zhihu Search · Web Search · Zhida
- **How to use it:** Enter a topic, choose Zhihu / Web / Mixed, and click `LAUNCH`. Open a node to inspect its source and summary; `EXPAND` continues exploring from the current node, while `ZHIDA EXPLAIN` asks Zhida to explain it.
- **Demo:** [▶ View MP4](https://raw.githubusercontent.com/CharlesPikachu/zhihu-verse/refs/heads/main/docs/1.%20EXPLORE%20%E2%80%94%20%E5%8F%8C%E5%9F%9F%E6%8E%A2%E7%B4%A2.mp4)

### 02. ⚛️ COLLIDER — Knowledge Collider

- **What it does:** Find a knowledge path between two seemingly unrelated concepts.
- **Zhihu CLI:** Zhida · Zhihu Search
- **How to use it:** Enter one concept on each side and click `COLLIDE`. The app first generates an intermediate knowledge path, then uses Zhihu Search to supplement and verify its nodes.
- **Demo:** [▶ View MP4](https://raw.githubusercontent.com/CharlesPikachu/zhihu-verse/refs/heads/main/docs/2.%20COLLIDER%20%E2%80%94%20%E7%9F%A5%E8%AF%86%E5%AF%B9%E6%92%9E.mp4)

### 03. 🕸️ GRAPH — Knowledge Graph

- **What it does:** Build a multi-level graph around a topic from Zhihu and the web.
- **Zhihu CLI:** Zhida · Zhihu Search · Web Search
- **How to use it:** Enter a topic, choose the graph depth, and click `BUILD GRAPH`. The app expands key branches and adds real search results; click any node to inspect its details and sources.
- **Demo:** [▶ View MP4](https://raw.githubusercontent.com/CharlesPikachu/zhihu-verse/refs/heads/main/docs/3.%20GRAPH%20%E2%80%94%20%E7%9F%A5%E8%AF%86%E5%9B%BE%E8%B0%B1.mp4)

### 04. 🧠 ZHIDA ARENA — Zhida Quiz

- **What it does:** Generate a five-question challenge from a topic or personal favorites.
- **Zhihu CLI:** Zhida · User Favorites · Collection Lists · Collection Content
- **How to use it:** Choose a custom topic, or select “Based on My Favorites” to read the current account's saved content and generate questions. Explanations, scores, and streaks are shown after each answer.
- **Demo:** [▶ View MP4](https://raw.githubusercontent.com/CharlesPikachu/zhihu-verse/refs/heads/main/docs/4.%20ZHIDA%20ARENA%20%E2%80%94%20%E7%9B%B4%E7%AD%94%E9%97%AE%E7%AD%94.mp4)

### 05. 🏃 RUNNER — Question Runner

- **What it does:** Turn Hot List items and search questions into Chrome-Dino-style obstacles.
- **Zhihu CLI:** Hot List · Zhihu Search
- **How to use it:** Click `START / RESTART`. Use Space / ↑ / click to jump and ↓ / S to crouch; `REFRESH QUESTION POOL` refreshes the question pool.
- **Demo:** [▶ View MP4](https://raw.githubusercontent.com/CharlesPikachu/zhihu-verse/refs/heads/main/docs/5.%20RUNNER%20%E2%80%94%20%E9%97%AE%E9%A2%98%E8%B7%91%E9%85%B7.mp4)

### 06. 🪐 MY MEMORY — Memory Planet

- **What it does:** Aggregate creations, favorites, collections, and follows into an explorable planet.
- **Zhihu CLI:** User Content · User Follows · User Favorites · Collection Lists · Collection Content · Zhida
- **How to use it:** Connect an Access Secret and click `ASSEMBLE PLANET`. `TIME DEPTH` controls the time range, while `AI THEME SCAN` uses Zhida to summarize the main themes in your content.
- **Demo:** [▶ View MP4](https://raw.githubusercontent.com/CharlesPikachu/zhihu-verse/refs/heads/main/docs/6.%20MY%20MEMORY%20%E2%80%94%20%E8%AE%B0%E5%BF%86%E6%98%9F%E7%90%83.mp4)

### 07. 📅 RECAP — Yearly / Monthly Recap

- **What it does:** Build a timeline, keywords, and highlights from public creations and favorites.
- **Zhihu CLI:** User Content · User Favorites · Collection Content · Zhida
- **How to use it:** Choose a year and month, then click `GENERATE`. The app builds a timeline, keywords, and content highlights; `ZHIDA COMMENT` generates a short recap, and a `1080 × 2480` PNG poster can be exported.
- **Demo:** [▶ View MP4](https://raw.githubusercontent.com/CharlesPikachu/zhihu-verse/refs/heads/main/docs/7.%20RECAP%20%E2%80%94%20%E5%B9%B4%E5%BA%A6%E6%9C%88%E5%BA%A6%E5%9B%9E%E9%A1%BE.mp4)

### 08. 💫 LIVE — Hot List Supernova

- **What it does:** Connect Hot List snapshots into a time series and reveal ranking movement.
- **Zhihu CLI:** Zhihu Hot List
- **How to use it:** Click `SCAN NOW` to save the current Hot List. Once two or more snapshots exist, ranking movement becomes visible; fast-rising topics trigger a supernova effect, and `REPLAY` replays saved history.
- **Demo:** [▶ View MP4](https://raw.githubusercontent.com/CharlesPikachu/zhihu-verse/refs/heads/main/docs/8.%20LIVE%20%E2%80%94%20%E7%83%AD%E6%A6%9C%E8%B6%85%E6%96%B0%E6%98%9F.mp4)

### 09. 🧰 TOOLS LAB — PDF / PPT

- **What it does:** Turn Open Platform PDF parsing and PPT generation into a visual control panel.
- **Zhihu CLI:** PDF Upload · PDF Parsing Tasks · PPT Generation Tasks
- **How to use it:** Choose a PDF and click `UPLOAD + PARSE`; or enter a Zhihu answer / column URL and click `CREATE PPT`. Use `CHECK STATUS` to query either task.
- **Demo:** [▶ View MP4](https://raw.githubusercontent.com/CharlesPikachu/zhihu-verse/refs/heads/main/docs/9.%20TOOLS%20LAB%20%E2%80%94%20PDF%20PPT.mp4)



### Zhihu CLI Coverage

| Experiment     | Zhihu Search | Web Search | Zhida | Hot List | User Content / Follows | Favorites / Collections | PDF / PPT |
| -------------- | :----------: | :--------: | :---: | :------: | :--------------------: | :---------------------: | :-------: |
| 🔭 EXPLORE     |      ✅       |     ✅      |   ✅   |    —     |           —            |            —            |     —     |
| ⚛️ COLLIDER    |      ✅       |     —      |   ✅   |    —     |           —            |            —            |     —     |
| 🕸️ GRAPH      |      ✅       |     ✅      |   ✅   |    —     |           —            |            —            |     —     |
| 🧠 ZHIDA ARENA |      —       |     —      |   ✅   |    —     |           —            |            ✅            |     —     |
| 🏃 RUNNER      |      ✅       |     —      |   —   |    ✅     |           —            |            —            |     —     |
| 🪐 MY MEMORY   |      —       |     —      |   ✅   |    —     |           ✅            |            ✅            |     —     |
| 📅 RECAP       |      —       |     —      |   ✅   |    —     |           ✅            |            ✅            |     —     |
| 💫 LIVE        |      —       |     —      |   —   |    ✅     |           —            |            —            |     —     |
| 🧰 TOOLS LAB   |      —       |     —      |   —   |    —     |           —            |            —            |     ✅     |

> For endpoint definitions, parameters, and currently available capabilities, refer to the [official Zhihu CLI documentation](https://developer.zhihu.com/docs?key=zhihu_cli).

---

## 🌟 Star History

<a href="https://www.star-history.com/?repos=CharlesPikachu%2Fzhihu-verse&type=date&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=CharlesPikachu/zhihu-verse&type=date&theme=dark&legend=top-left&sealed_token=_bPohUsyf1fNtXjJmb2QE30xly1HTKhkgQLYoQXS8wDNNEx86OPAtUmTfoO6tjVrLK-WeeiwzVpSW12GoiQHTUoYi1-1AbjUkO9Kdq8QzLw_4AsgnV0icQ" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=CharlesPikachu/zhihu-verse&type=date&legend=top-left&sealed_token=_bPohUsyf1fNtXjJmb2QE30xly1HTKhkgQLYoQXS8wDNNEx86OPAtUmTfoO6tjVrLK-WeeiwzVpSW12GoiQHTUoYi1-1AbjUkO9Kdq8QzLw_4AsgnV0icQ" />
   <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=CharlesPikachu/zhihu-verse&type=date&legend=top-left&sealed_token=_bPohUsyf1fNtXjJmb2QE30xly1HTKhkgQLYoQXS8wDNNEx86OPAtUmTfoO6tjVrLK-WeeiwzVpSW12GoiQHTUoYi1-1AbjUkO9Kdq8QzLw_4AsgnV0icQ" />
 </picture>
</a>

If you enjoy the project, consider giving it a ⭐ **Star**. It helps more people discover ZHIHU://VERSE and supports future maintenance and new experiments.

---

## ☕ Sponsorship

If ZHIHU://VERSE has been useful for your learning, research, or development, you can support future maintenance through [GitHub Sponsors](https://github.com/sponsors/CharlesPikachu) or the appreciation QR codes below.

| WeChat Appreciation | Alipay Appreciation |
| :---: | :---: |
| <img src="https://raw.githubusercontent.com/CharlesPikachu/zhihu-verse/main/.github/pictures/wechat_reward.jpg" width="240" alt="WeChat Appreciation" /> | <img src="https://raw.githubusercontent.com/CharlesPikachu/zhihu-verse/main/.github/pictures/alipay_reward.png" width="240" alt="Alipay Appreciation" /> |

---

<div align="center">

The code in this project is primarily generated and iteratively refined with **GPT-5.6 Sol (High)**, with human verification, debugging, and maintenance.

**ZHIHU://VERSE · Explore Zhihu as a universe.**

</div>
