<div align="center">

<img src="./assets/favicon.svg" width="88" alt="ZHIHU://VERSE">

# ZHIHU://VERSE

Powered by Zhihu CLI — turn Zhihu into a universe you can explore, collide, play, and revisit.

[Live Demo](https://charlespikachu.github.io/zhihu-verse/) · [Project Introduction](https://www.zhihu.com/question/2068735236100154306/answer/2069250015713875761) · [Zhihu CLI Docs](https://developer.zhihu.com/docs?key=zhihu_cli)  
[简体中文](./README.md) · [English](./README_EN.md)

<br>

![Stars](https://img.shields.io/github/stars/CharlesPikachu/zhihu-verse?style=flat-square)
![Forks](https://img.shields.io/github/forks/CharlesPikachu/zhihu-verse?style=flat-square)
![Last Commit](https://img.shields.io/github/last-commit/CharlesPikachu/zhihu-verse?style=flat-square)

</div>

---

## 🌌 About ZHIHU://VERSE

ZHIHU://VERSE is an interactive playground powered by Zhihu CLI.

Instead of exposing Open Platform endpoints as isolated demos, it recombines search, Zhida, Hot List, personal content, favorites, collections, PDF parsing, and PPT generation into nine experiments. You can explore knowledge nodes, collide two concepts, build graphs, generate quizzes from your favorites, turn trending questions into a runner game, or create your own content planet and yearly recap.

No credentials are required for Demo Mode. Connect an Access Secret when you want to use live Zhihu data.

> For the design rationale and a full walkthrough, see the [Zhihu introduction](https://www.zhihu.com/question/2068735236100154306/answer/2069250015713875761).

## 🚀 Run & Access Secret

```bash
git clone https://github.com/CharlesPikachu/zhihu-verse.git
cd zhihu-verse
python -m http.server 4173
```

Open `http://127.0.0.1:4173`.

- `ENTER DEMO`: explore all experiments without an Access Secret.
- `CONNECT ZHIHU`: connect your own Access Secret and use live Zhihu data.
- `OFFLINE / DEMO`: switch the current data mode.

> [!IMPORTANT]
> Treat your Access Secret as a sensitive credential. Do not commit it to the repository or expose it in issues, public logs, or screenshots.

<details>
<summary>Browser blocked by CORS?</summary>

Deploy the Cloudflare Worker in `worker/`, then set its URL in `config.js`:

```js
window.ZHIHU_VERSE_CONFIG = {
  proxyUrl: 'https://your-worker.workers.dev',
  defaultTransport: 'auto'
};
```

</details>

<details>
<summary>Deploy with GitHub Pages</summary>

The repository already contains `.github/workflows/deploy-pages.yml`. Set Pages Source to `GitHub Actions`.

</details>

## ✨ Features & Demos

| Experiment | What it does | Demo |
| --- | --- | :---: |
| 🔭 `EXPLORE`<br>Dual-domain Exploration | Turn Zhihu and web search results into expandable spatial nodes. | [▶ MP4](https://raw.githubusercontent.com/CharlesPikachu/zhihu-verse/refs/heads/main/docs/1.%20EXPLORE%20%E2%80%94%20%E5%8F%8C%E5%9F%9F%E6%8E%A2%E7%B4%A2.mp4) |
| ⚛️ `COLLIDER`<br>Knowledge Collider | Find a knowledge path between two seemingly unrelated concepts. | [▶ MP4](https://raw.githubusercontent.com/CharlesPikachu/zhihu-verse/refs/heads/main/docs/2.%20COLLIDER%20%E2%80%94%20%E7%9F%A5%E8%AF%86%E5%AF%B9%E6%92%9E.mp4) |
| 🕸️ `GRAPH`<br>Knowledge Graph | Build a multi-level graph from both Zhihu and web information. | [▶ MP4](https://raw.githubusercontent.com/CharlesPikachu/zhihu-verse/refs/heads/main/docs/3.%20GRAPH%20%E2%80%94%20%E7%9F%A5%E8%AF%86%E5%9B%BE%E8%B0%B1.mp4) |
| 🧠 `ZHIDA ARENA`<br>Zhida Quiz | Generate a five-question challenge from a topic or personal favorites. | [▶ MP4](https://raw.githubusercontent.com/CharlesPikachu/zhihu-verse/refs/heads/main/docs/4.%20ZHIDA%20ARENA%20%E2%80%94%20%E7%9B%B4%E7%AD%94%E9%97%AE%E7%AD%94.mp4) |
| 🏃 `RUNNER`<br>Question Runner | Turn Hot List items and search questions into Chrome-Dino-style obstacles. | [▶ MP4](https://raw.githubusercontent.com/CharlesPikachu/zhihu-verse/refs/heads/main/docs/5.%20RUNNER%20%E2%80%94%20%E9%97%AE%E9%A2%98%E8%B7%91%E9%85%B7.mp4) |
| 🪐 `MY MEMORY`<br>Memory Planet | Aggregate creations, favorites, collections, and follows into a personal content planet. | [▶ MP4](https://raw.githubusercontent.com/CharlesPikachu/zhihu-verse/refs/heads/main/docs/6.%20MY%20MEMORY%20%E2%80%94%20%E8%AE%B0%E5%BF%86%E6%98%9F%E7%90%83.mp4) |
| 📅 `RECAP`<br>Yearly / Monthly Recap | Generate a yearly or monthly recap from public creations and favorites. | [▶ MP4](https://raw.githubusercontent.com/CharlesPikachu/zhihu-verse/refs/heads/main/docs/7.%20RECAP%20%E2%80%94%20%E5%B9%B4%E5%BA%A6%E6%9C%88%E5%BA%A6%E5%9B%9E%E9%A1%BE.mp4) |
| 💫 `LIVE`<br>Hot List Supernova | Connect Hot List snapshots into a time series to reveal ranking changes. | [▶ MP4](https://raw.githubusercontent.com/CharlesPikachu/zhihu-verse/refs/heads/main/docs/8.%20LIVE%20%E2%80%94%20%E7%83%AD%E6%A6%9C%E8%B6%85%E6%96%B0%E6%98%9F.mp4) |
| 🧰 `TOOLS LAB`<br>PDF / PPT | Expose PDF parsing and PPT generation through a visual control panel. | [▶ MP4](https://raw.githubusercontent.com/CharlesPikachu/zhihu-verse/refs/heads/main/docs/9.%20TOOLS%20LAB%20%E2%80%94%20PDF%20PPT.mp4) |

<details>
<summary>View detailed usage for all experiments</summary>

<br>

<details>
<summary>01 · 🔭 EXPLORE / Dual-domain Exploration</summary>

<br>

`Function`  
Turn Zhihu and web search results into expandable spatial nodes.

`Zhihu CLI`  
Zhihu Search · Web Search · Zhida

`Usage`  
Enter a topic, choose Zhihu / Web / Mixed, and click `LAUNCH`. Open nodes for source details; `EXPAND` continues from the current node and `ZHIDA EXPLAIN` asks Zhida to explain it.

`Demo`  
[▶ Open / download MP4](https://raw.githubusercontent.com/CharlesPikachu/zhihu-verse/refs/heads/main/docs/1.%20EXPLORE%20%E2%80%94%20%E5%8F%8C%E5%9F%9F%E6%8E%A2%E7%B4%A2.mp4)

</details>

<details>
<summary>02 · ⚛️ COLLIDER / Knowledge Collider</summary>

<br>

`Function`  
Find a knowledge path between two seemingly unrelated concepts.

`Zhihu CLI`  
Zhida · Zhihu Search

`Usage`  
Enter one concept on each side and click `COLLIDE`. The app generates an intermediate path, then uses Zhihu Search to supplement and verify the nodes.

`Demo`  
[▶ Open / download MP4](https://raw.githubusercontent.com/CharlesPikachu/zhihu-verse/refs/heads/main/docs/2.%20COLLIDER%20%E2%80%94%20%E7%9F%A5%E8%AF%86%E5%AF%B9%E6%92%9E.mp4)

</details>

<details>
<summary>03 · 🕸️ GRAPH / Knowledge Graph</summary>

<br>

`Function`  
Build a multi-level graph from both Zhihu and web information.

`Zhihu CLI`  
Zhida · Zhihu Search · Web Search

`Usage`  
Enter a topic, choose graph depth, and click `BUILD GRAPH`. The app expands key branches and attaches real search results; click a node for details and sources.

`Demo`  
[▶ Open / download MP4](https://raw.githubusercontent.com/CharlesPikachu/zhihu-verse/refs/heads/main/docs/3.%20GRAPH%20%E2%80%94%20%E7%9F%A5%E8%AF%86%E5%9B%BE%E8%B0%B1.mp4)

</details>

<details>
<summary>04 · 🧠 ZHIDA ARENA / Zhida Quiz</summary>

<br>

`Function`  
Generate a five-question challenge from a topic or personal favorites.

`Zhihu CLI`  
Zhida · User Favorites · Collection Lists · Collection Content

`Usage`  
Choose a custom topic or "Based on My Favorites". The app generates questions from live content and shows explanations, score, and streak after each answer.

`Demo`  
[▶ Open / download MP4](https://raw.githubusercontent.com/CharlesPikachu/zhihu-verse/refs/heads/main/docs/4.%20ZHIDA%20ARENA%20%E2%80%94%20%E7%9B%B4%E7%AD%94%E9%97%AE%E7%AD%94.mp4)

</details>

<details>
<summary>05 · 🏃 RUNNER / Question Runner</summary>

<br>

`Function`  
Turn Hot List items and search questions into Chrome-Dino-style obstacles.

`Zhihu CLI`  
Hot List · Zhihu Search

`Usage`  
Click `START / RESTART`. Use Space / ↑ / click to jump and ↓ / S to crouch. `REFRESH QUESTION POOL` reloads the question set.

`Demo`  
[▶ Open / download MP4](https://raw.githubusercontent.com/CharlesPikachu/zhihu-verse/refs/heads/main/docs/5.%20RUNNER%20%E2%80%94%20%E9%97%AE%E9%A2%98%E8%B7%91%E9%85%B7.mp4)

</details>

<details>
<summary>06 · 🪐 MY MEMORY / Memory Planet</summary>

<br>

`Function`  
Aggregate creations, favorites, collections, and follows into a personal content planet.

`Zhihu CLI`  
User Content · User Follows · User Favorites · Collection Lists · Collection Content · Zhida

`Usage`  
Connect an Access Secret and click `ASSEMBLE PLANET`. `TIME DEPTH` adjusts the time range, while `AI THEME SCAN` summarizes dominant themes with Zhida.

`Demo`  
[▶ Open / download MP4](https://raw.githubusercontent.com/CharlesPikachu/zhihu-verse/refs/heads/main/docs/6.%20MY%20MEMORY%20%E2%80%94%20%E8%AE%B0%E5%BF%86%E6%98%9F%E7%90%83.mp4)

</details>

<details>
<summary>07 · 📅 RECAP / Yearly / Monthly Recap</summary>

<br>

`Function`  
Generate a yearly or monthly recap from public creations and favorites.

`Zhihu CLI`  
User Content · User Favorites · Collection Content · Zhida

`Usage`  
Choose a year and month, then click `GENERATE`. The app builds a timeline, keywords, and highlights; `ZHIDA COMMENT` adds a short recap and a 1080 × 2480 PNG poster can be exported.

`Demo`  
[▶ Open / download MP4](https://raw.githubusercontent.com/CharlesPikachu/zhihu-verse/refs/heads/main/docs/7.%20RECAP%20%E2%80%94%20%E5%B9%B4%E5%BA%A6%E6%9C%88%E5%BA%A6%E5%9B%9E%E9%A1%BE.mp4)

</details>

<details>
<summary>08 · 💫 LIVE / Hot List Supernova</summary>

<br>

`Function`  
Connect Hot List snapshots into a time series to reveal ranking changes.

`Zhihu CLI`  
Zhihu Hot List

`Usage`  
Click `SCAN NOW` to save the current Hot List. With two or more snapshots, ranking movement becomes visible; fast-rising topics trigger a supernova effect and `REPLAY` replays history.

`Demo`  
[▶ Open / download MP4](https://raw.githubusercontent.com/CharlesPikachu/zhihu-verse/refs/heads/main/docs/8.%20LIVE%20%E2%80%94%20%E7%83%AD%E6%A6%9C%E8%B6%85%E6%96%B0%E6%98%9F.mp4)

</details>

<details>
<summary>09 · 🧰 TOOLS LAB / PDF / PPT</summary>

<br>

`Function`  
Expose PDF parsing and PPT generation through a visual control panel.

`Zhihu CLI`  
PDF Upload · PDF Parsing Tasks · PPT Generation Tasks

`Usage`  
Choose a PDF and click `UPLOAD + PARSE`, or enter a Zhihu answer / column URL and click `CREATE PPT`. Use `CHECK STATUS` to query either task.

`Demo`  
[▶ Open / download MP4](https://raw.githubusercontent.com/CharlesPikachu/zhihu-verse/refs/heads/main/docs/9.%20TOOLS%20LAB%20%E2%80%94%20PDF%20PPT.mp4)

</details>

</details>

## 🌟 Star History

<div align="center">

[![Star History](https://img.shields.io/badge/Star_History-View_Trend-181717?style=for-the-badge&logo=github)](https://www.repostars.dev/?repos=CharlesPikachu%2Fzhihu-verse&theme=dark)

</div>

## ☕ Sponsorship

If ZHIHU://VERSE has been useful to you, you can support future maintenance through GitHub Sponsors or the appreciation QR codes below.

<div align="center">

[![GitHub Sponsors](https://img.shields.io/badge/GitHub_Sponsors-Sponsor-ea4aaa?style=for-the-badge&logo=githubsponsors&logoColor=white)](https://github.com/sponsors/CharlesPikachu)

<br><br>

| WeChat Appreciation | Alipay Appreciation |
| :--: | :--: |
| <img src="https://raw.githubusercontent.com/CharlesPikachu/musicdl/master/.github/pictures/wechat_reward.jpg" width="220" alt="WeChat Appreciation QR Code"> | <img src="https://raw.githubusercontent.com/CharlesPikachu/musicdl/master/.github/pictures/alipay_reward.png" width="220" alt="Alipay Appreciation QR Code"> |

</div>
