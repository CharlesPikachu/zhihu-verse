<div align="center">

<img src="./assets/favicon.svg" width="96" alt="ZHIHU://VERSE" />

# ZHIHU://VERSE

An interactive Zhihu playground powered by Zhihu CLI

Transform search, direct answers, trending topics, personal content, and Open Platform tools into a knowledge universe of interactive experiments, mini-games, and visualizations.

[简体中文](./README.md) · [English](./README_EN.md)

[![Live Demo](https://img.shields.io/badge/Live%20Demo-ZHIHU%3A%2F%2FVERSE-00E5FF?style=for-the-badge)](https://charlespikachu.github.io/zhihu-verse/)

[![GitHub Stars](https://img.shields.io/github/stars/CharlesPikachu/zhihu-verse?style=flat-square)](https://github.com/CharlesPikachu/zhihu-verse/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/CharlesPikachu/zhihu-verse?style=flat-square)](https://github.com/CharlesPikachu/zhihu-verse/forks)
[![Last Commit](https://img.shields.io/github/last-commit/CharlesPikachu/zhihu-verse?style=flat-square)](https://github.com/CharlesPikachu/zhihu-verse/commits/main)
[![GitHub Pages](https://github.com/CharlesPikachu/zhihu-verse/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/CharlesPikachu/zhihu-verse/actions/workflows/deploy-pages.yml)

</div>

## 🌌 About ZHIHU://VERSE

ZHIHU://VERSE is more than a collection of isolated API examples. It is an interactive playground built around Zhihu CLI, combining Zhihu Search, Web Search, Zhida, Hot List, user content, follows, favorites, collections, PDF parsing, and PPT generation into nine standalone experiments.

You can explore the interface immediately in Demo Mode, or connect your own Access Secret to work with live Zhihu data for search, knowledge-graph construction, personal recaps, collection-based quizzes, trending-topic tracking, and more.

- 🌐 Live Demo: [ZHIHU://VERSE](https://charlespikachu.github.io/zhihu-verse/)
- 📖 Project introduction and design notes: [Zhihu answer](https://www.zhihu.com/question/2068735236100154306/answer/2069250015713875761)
- 🧩 Zhihu CLI documentation: [Zhihu Open Platform](https://developer.zhihu.com/docs?key=zhihu_cli)

If you find the project useful, a ⭐ Star is always appreciated.

## 🚀 Run & Access Secret

(1) Run locally

```bash
git clone https://github.com/CharlesPikachu/zhihu-verse.git
cd zhihu-verse
python -m http.server 4173
```

Then open `http://127.0.0.1:4173`.

(2) Demo Mode

Click "ENTER DEMO" on your first visit to explore the interface without an Access Secret. Demo Mode is intended for quickly previewing the main interactions; connect your own Access Secret to use live Zhihu data.

(3) Connect an Access Secret

Click "OFFLINE / DEMO" in the upper-right corner, or "CONNECT ZHIHU" on the landing page, and enter your Access Secret.

Endpoints for personal creations, follows, favorites, and collections read the public data associated with the current caller, so ZHIHU://VERSE consistently uses the Access Secret for these capabilities.

> Treat your Access Secret as a sensitive credential. Do not commit it to a repository or expose it in issues, public logs, or screenshots.

(4) CORS & Cloudflare Worker

If direct browser requests to the Zhihu Open Platform are blocked by CORS, deploy the Cloudflare Worker in `worker/` and set its URL in `config.js`:

```js
window.ZHIHU_VERSE_CONFIG = {
  proxyUrl: 'https://your-worker.workers.dev',
  defaultTransport: 'auto'
};
```

(5) GitHub Pages

The repository already includes `.github/workflows/deploy-pages.yml`. Set the repository Pages Source to "GitHub Actions" to deploy with the existing workflow.

## ✨ Features

1. 🔭 EXPLORE — Dual-domain Exploration

   *Function:* Turn ordinary search results into expandable spatial nodes and explore Zhihu content, web results, and their relationships in one interface.

   *Zhihu CLI capabilities:* Zhihu Search, Web Search, Zhida.

   *Usage:* Enter a question or topic, choose "Zhihu / Web / Mixed", and click "LAUNCH". Open a node to inspect its summary, author, engagement metadata, and source; "EXPAND" continues the search from the selected node, while "ZHIDA EXPLAIN" asks Zhida to explain it.

   *Demo:* [▶ Open / download MP4](https://raw.githubusercontent.com/CharlesPikachu/zhihu-verse/main/docs/1.%20EXPLORE%20%E2%80%94%20%E5%8F%8C%E5%9F%9F%E6%8E%A2%E7%B4%A2.mp4)

2. ⚛️ COLLIDER — Knowledge Collider

   *Function:* Discover an interpretable and verifiable knowledge path between two seemingly unrelated concepts.

   *Zhihu CLI capabilities:* Zhida, Zhihu Search.

   *Usage:* Enter one concept on each side and click "COLLIDE". Zhida first proposes intermediate connections, then Zhihu Search supplements and verifies the intermediate nodes.

   *Demo:* [▶ Open / download MP4](https://raw.githubusercontent.com/CharlesPikachu/zhihu-verse/main/docs/2.%20COLLIDER%20%E2%80%94%20%E7%9F%A5%E8%AF%86%E5%AF%B9%E6%92%9E.mp4)

3. 🕸️ GRAPH — Knowledge Graph

   *Function:* Automatically build a multi-level knowledge graph around a topic using both Zhihu and web information.

   *Zhihu CLI capabilities:* Zhida, Zhihu Search, Web Search.

   *Usage:* Enter a topic, choose the graph depth, and click "BUILD GRAPH". The system first expands several key branches and then attaches real search results to each branch. Click any node to inspect details and sources.

   *Demo:* [▶ Open / download MP4](https://raw.githubusercontent.com/CharlesPikachu/zhihu-verse/main/docs/3.%20GRAPH%20%E2%80%94%20%E7%9F%A5%E8%AF%86%E5%9B%BE%E8%B0%B1.mp4)

4. 🧠 ZHIDA ARENA — Zhida Quiz

   *Function:* Dynamically generate a five-question knowledge challenge from a selected topic or the user's favorites, with instant explanations and scoring.

   *Zhihu CLI capabilities:* Zhida, user favorites, collection lists, collection content.

   *Usage:* Choose "Custom Topic" and enter a topic, or select "Based on My Favorites" to let the app read the current account's saved content and generate questions with Zhida. Explanations, score, and streak are shown after every answer.

   *Demo:* [▶ Open / download MP4](https://raw.githubusercontent.com/CharlesPikachu/zhihu-verse/main/docs/4.%20ZHIDA%20ARENA%20%E2%80%94%20%E7%9B%B4%E7%AD%94%E9%97%AE%E7%AD%94.mp4)

5. 🏃 RUNNER — Question Runner

   *Function:* Turn Zhihu Hot List items and search questions into obstacles in a Chrome-Dino-style runner game.

   *Zhihu CLI capabilities:* Hot List, Zhihu Search.

   *Usage:* Click "START / RESTART". Jump over ground questions with Space, ↑, or a canvas click; double jumps are supported. Crouch with ↓ or S when a purple airborne question appears. "REFRESH QUESTION POOL" reloads the question set.

   *Demo:* [▶ Open / download MP4](https://raw.githubusercontent.com/CharlesPikachu/zhihu-verse/main/docs/5.%20RUNNER%20%E2%80%94%20%E9%97%AE%E9%A2%98%E8%B7%91%E9%85%B7.mp4)

6. 🪐 MY MEMORY — Memory Planet

   *Function:* Aggregate personal creations, favorites, collections, and follows into an explorable personal knowledge planet.

   *Zhihu CLI capabilities:* User content, user follows, user favorites, collection lists, collection content, Zhida.

   *Usage:* Connect an Access Secret and click "ASSEMBLE PLANET". Adjust the time range with "TIME DEPTH"; "AI THEME SCAN" uses Zhida to summarize the dominant themes in the current content.

   *Demo:* [▶ Open / download MP4](https://raw.githubusercontent.com/CharlesPikachu/zhihu-verse/main/docs/6.%20MY%20MEMORY%20%E2%80%94%20%E8%AE%B0%E5%BF%86%E6%98%9F%E7%90%83.mp4)

7. 📅 RECAP — Yearly / Monthly Recap

   *Function:* Generate a yearly or monthly recap from public creations and favorite data, with support for exporting a shareable long poster.

   *Zhihu CLI capabilities:* User content, user favorites, collection content, Zhida.

   *Usage:* Choose a year and month, then click "GENERATE". The page builds an activity timeline, keywords, and highlights; "ZHIDA COMMENT" generates a short recap, and "EXPORT LONG POSTER" exports a 1080 × 2480 PNG poster.

   *Demo:* [▶ Open / download MP4](https://raw.githubusercontent.com/CharlesPikachu/zhihu-verse/main/docs/7.%20RECAP%20%E2%80%94%20%E5%B9%B4%E5%BA%A6%E6%9C%88%E5%BA%A6%E5%9B%9E%E9%A1%BE.mp4)

8. 💫 LIVE — Hot List Supernova

   *Function:* Connect multiple Hot List snapshots into a time series to reveal ranking changes and fast-rising topics.

   *Zhihu CLI capabilities:* Zhihu Hot List.

   *Usage:* Click "SCAN NOW" to save the current Hot List. Once at least two snapshots exist, ranking movements become visible; rapidly rising topics trigger a supernova effect, and "REPLAY" replays saved snapshots.

   *Demo:* [▶ Open / download MP4](https://raw.githubusercontent.com/CharlesPikachu/zhihu-verse/main/docs/8.%20LIVE%20%E2%80%94%20%E7%83%AD%E6%A6%9C%E8%B6%85%E6%96%B0%E6%98%9F.mp4)

9. 🧰 TOOLS LAB — PDF / PPT

   *Function:* Provide a visual control panel for Zhihu Open Platform PDF parsing and PPT generation.

   *Zhihu CLI capabilities:* PDF file upload, PDF parsing task creation/status queries, PPT generation task creation/status queries.

   *Usage:* In the PDF panel, select a file and click "UPLOAD + PARSE", then use "CHECK STATUS" to query the result. In the PPT panel, enter a Zhihu answer or column URL, choose the number of slides, click "CREATE PPT", and use "CHECK STATUS" to query progress.

   *Demo:* [▶ Open / download MP4](https://raw.githubusercontent.com/CharlesPikachu/zhihu-verse/main/docs/9.%20TOOLS%20LAB%20%E2%80%94%20PDF%20PPT.mp4)


## 🌟 Star History

<div align="center">

<a href="https://repostars.dev/?repos=CharlesPikachu%2Fzhihu-verse&theme=dark">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://repostars.dev/api/embed?repo=CharlesPikachu%2Fzhihu-verse&theme=dark" />
    <source media="(prefers-color-scheme: light)" srcset="https://repostars.dev/api/embed?repo=CharlesPikachu%2Fzhihu-verse&theme=light" />
    <img alt="ZHIHU://VERSE Star History" src="https://repostars.dev/api/embed?repo=CharlesPikachu%2Fzhihu-verse&theme=light" />
  </picture>
</a>

</div>

## ☕ Sponsorship

If you enjoy ZHIHU://VERSE, or if it has been useful for your learning, research, or development work, you can support future maintenance and improvements through GitHub Sponsors or the appreciation QR codes below.

<div align="center">

[![GitHub Sponsors](https://img.shields.io/badge/GitHub%20Sponsors-Sponsor-EA4AAA?style=for-the-badge&logo=githubsponsors&logoColor=white)](https://github.com/sponsors/CharlesPikachu)

</div>

| WeChat Appreciation | Alipay Appreciation |
| :--: | :--: |
| <img src="https://raw.githubusercontent.com/CharlesPikachu/musicdl/master/.github/pictures/wechat_reward.jpg" width="260" alt="WeChat Appreciation QR Code" /> | <img src="https://raw.githubusercontent.com/CharlesPikachu/musicdl/master/.github/pictures/alipay_reward.png" width="260" alt="Alipay Appreciation QR Code" /> |

<div align="center">

ZHIHU://VERSE · Explore Zhihu as a universe.

</div>
