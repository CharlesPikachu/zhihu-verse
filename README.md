<div align="center">

# 🌌 ZHIHU://VERSE

**用 Zhihu CLI，把知乎变成一个可以探索、碰撞、游戏和回顾的知识宇宙。**

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
  <a href="./README.md"><strong>简体中文</strong></a>
  ·
  <a href="./README_EN.md">English</a>
</p>

<p>
  <a href="https://charlespikachu.github.io/zhihu-verse/"><strong>🌐 在线体验</strong></a>
  ·
  <a href="https://www.zhihu.com/question/2068735236100154306/answer/2069250015713875761"><strong>📖 项目介绍</strong></a>
  ·
  <a href="https://developer.zhihu.com/docs?key=zhihu_cli"><strong>🧩 Zhihu CLI 文档</strong></a>
</p>

</div>

---

## 🌠 这是什么？

**ZHIHU://VERSE** 是一个由 **Zhihu CLI** 驱动的交互式实验场。

它不是把开放平台接口逐个做成普通 Demo，而是把 **知乎搜索、全网搜索、直答、热榜、个人内容、关注、收藏、收藏夹、PDF 解析和 PPT 生成** 等能力重新组合成 **9 个可玩的实验**：探索知识节点、让两个概念发生“对撞”、构建知识图谱、从收藏中出题、把热榜做成跑酷游戏，以及生成属于自己的内容星球和年度回顾。

**不配置任何凭据也可以直接体验。** 进入 Demo 模式即可试玩完整交互；连接自己的 Access Secret 后，则可以切换到真实知乎数据。

> 项目的设计思路、交互逻辑与完整介绍见：[知乎回答](https://www.zhihu.com/question/2068735236100154306/answer/2069250015713875761)。

---

## 🚀 快速开始

### 1. 本地启动

```bash
git clone https://github.com/CharlesPikachu/zhihu-verse.git
cd zhihu-verse
python -m http.server 4173
```

然后打开：

```text
http://127.0.0.1:4173
```

### 2. 选择数据模式

| 模式 | 是否需要 Access Secret | 适合做什么 |
| --- | :---: | --- |
| `ENTER DEMO` | ❌ | 直接体验全部实验和交互。 |
| `CONNECT ZHIHU` | ✅ | 连接自己的 Access Secret，读取真实知乎数据。 |
| `OFFLINE / DEMO` | — | 在当前可用的数据模式之间切换。 |

> [!IMPORTANT]
> **Access Secret 是敏感凭据。** 请勿提交到 GitHub 仓库、Issue、公开日志或截图中。

### 3. CORS / Cloudflare Worker

如果浏览器直连知乎开放平台遇到 CORS，可以部署 `worker/` 中的 Cloudflare Worker，并在 `config.js` 中填写 Worker 地址：

```js
window.ZHIHU_VERSE_CONFIG = {
  proxyUrl: 'https://your-worker.workers.dev',
  defaultTransport: 'auto'
};
```

### 4. GitHub Pages

仓库已经包含：

```text
.github/workflows/deploy-pages.yml
```

将仓库的 **Pages Source** 设置为 **GitHub Actions**，即可使用现有工作流部署。

---

## 🎮 9 个实验

### 01. 🔭 EXPLORE — 双域探索

- **功能：** 把知乎与全网搜索结果变成可继续展开的空间节点。
- **Zhihu CLI：** 知乎搜索 · 全网搜索 · 直答
- **使用方式：** 输入主题，选择「知乎 / 全网 / 混合」后点击 `LAUNCH`。点击节点可查看来源与摘要；`EXPAND` 从当前节点继续探索，`ZHIDA EXPLAIN` 调用直答解释当前节点。
- **演示：** [▶ 查看 MP4](https://raw.githubusercontent.com/CharlesPikachu/zhihu-verse/refs/heads/main/docs/1.%20EXPLORE%20%E2%80%94%20%E5%8F%8C%E5%9F%9F%E6%8E%A2%E7%B4%A2.mp4)

### 02. ⚛️ COLLIDER — 知识对撞

- **功能：** 寻找两个看似无关概念之间的知识路径。
- **Zhihu CLI：** 直答 · 知乎搜索
- **使用方式：** 输入左右两个概念并点击 `COLLIDE`。系统先生成中间知识路径，再用知乎搜索补充和验证各个节点。
- **演示：** [▶ 查看 MP4](https://raw.githubusercontent.com/CharlesPikachu/zhihu-verse/refs/heads/main/docs/2.%20COLLIDER%20%E2%80%94%20%E7%9F%A5%E8%AF%86%E5%AF%B9%E6%92%9E.mp4)

### 03. 🕸️ GRAPH — 知识图谱

- **功能：** 围绕主题自动展开知乎 × 全网双源知识图谱。
- **Zhihu CLI：** 直答 · 知乎搜索 · 全网搜索
- **使用方式：** 输入主题并选择图谱深度，点击 `BUILD GRAPH`。系统拆分关键分支并补充真实搜索结果，点击节点即可查看详情与来源。
- **演示：** [▶ 查看 MP4](https://raw.githubusercontent.com/CharlesPikachu/zhihu-verse/refs/heads/main/docs/3.%20GRAPH%20%E2%80%94%20%E7%9F%A5%E8%AF%86%E5%9B%BE%E8%B0%B1.mp4)

### 04. 🧠 ZHIDA ARENA — 直答问答

- **功能：** 从自选主题或个人收藏中动态生成五题知识挑战。
- **Zhihu CLI：** 直答 · 用户收藏 · 收藏夹列表 · 收藏夹内容
- **使用方式：** 选择「自选主题」直接出题，或选择「根据我的收藏」读取当前账号收藏后生成题目；每题提交后即时显示解释、得分和连胜。
- **演示：** [▶ 查看 MP4](https://raw.githubusercontent.com/CharlesPikachu/zhihu-verse/refs/heads/main/docs/4.%20ZHIDA%20ARENA%20%E2%80%94%20%E7%9B%B4%E7%AD%94%E9%97%AE%E7%AD%94.mp4)

### 05. 🏃 RUNNER — 问题跑酷

- **功能：** 把知乎热榜和搜索问题变成 Chrome Dino 风格的障碍。
- **Zhihu CLI：** 热榜 · 知乎搜索
- **使用方式：** 点击 `START / RESTART` 开始。空格 / ↑ / 点击用于跳跃，↓ / S 用于下蹲；`REFRESH QUESTION POOL` 可以刷新问题池。
- **演示：** [▶ 查看 MP4](https://raw.githubusercontent.com/CharlesPikachu/zhihu-verse/refs/heads/main/docs/5.%20RUNNER%20%E2%80%94%20%E9%97%AE%E9%A2%98%E8%B7%91%E9%85%B7.mp4)

### 06. 🪐 MY MEMORY — 记忆星球

- **功能：** 把个人创作、收藏、收藏夹和关注聚合成可探索星球。
- **Zhihu CLI：** 用户内容 · 用户关注 · 用户收藏 · 收藏夹列表 · 收藏夹内容 · 直答
- **使用方式：** 连接 Access Secret 后点击 `ASSEMBLE PLANET`。`TIME DEPTH` 控制时间范围，`AI THEME SCAN` 使用直答概括当前内容的主要主题。
- **演示：** [▶ 查看 MP4](https://raw.githubusercontent.com/CharlesPikachu/zhihu-verse/refs/heads/main/docs/6.%20MY%20MEMORY%20%E2%80%94%20%E8%AE%B0%E5%BF%86%E6%98%9F%E7%90%83.mp4)

### 07. 📅 RECAP — 年度 / 月度回顾

- **功能：** 根据个人公开创作与收藏生成时间线、关键词和高光。
- **Zhihu CLI：** 用户内容 · 用户收藏 · 收藏夹内容 · 直答
- **使用方式：** 选择年份和月份后点击 `GENERATE`。系统整理时间线、关键词和内容高光；`ZHIDA COMMENT` 可生成简评，并支持导出 `1080 × 2480` PNG 长图。
- **演示：** [▶ 查看 MP4](https://raw.githubusercontent.com/CharlesPikachu/zhihu-verse/refs/heads/main/docs/7.%20RECAP%20%E2%80%94%20%E5%B9%B4%E5%BA%A6%E6%9C%88%E5%BA%A6%E5%9B%9E%E9%A1%BE.mp4)

### 08. 💫 LIVE — 热榜超新星

- **功能：** 把多次热榜快照串成时间序列，观察话题排名变化。
- **Zhihu CLI：** 知乎热榜
- **使用方式：** 点击 `SCAN NOW` 保存当前热榜。积累两份以上快照后即可观察排名变化；快速上涨的话题会触发超新星效果，`REPLAY` 可以回放历史快照。
- **演示：** [▶ 查看 MP4](https://raw.githubusercontent.com/CharlesPikachu/zhihu-verse/refs/heads/main/docs/8.%20LIVE%20%E2%80%94%20%E7%83%AD%E6%A6%9C%E8%B6%85%E6%96%B0%E6%98%9F.mp4)

### 09. 🧰 TOOLS LAB — PDF / PPT

- **功能：** 把开放平台 PDF 解析和 PPT 生成做成可视化操作面板。
- **Zhihu CLI：** PDF 文件上传 · PDF 解析任务 · PPT 生成任务
- **使用方式：** PDF 区选择文件后点击 `UPLOAD + PARSE`；PPT 区输入知乎回答或专栏链接后点击 `CREATE PPT`；两类任务都可以使用 `CHECK STATUS` 查询状态。
- **演示：** [▶ 查看 MP4](https://raw.githubusercontent.com/CharlesPikachu/zhihu-verse/refs/heads/main/docs/9.%20TOOLS%20LAB%20%E2%80%94%20PDF%20PPT.mp4)

> 具体接口、参数和开放能力以 [Zhihu CLI 官方文档](https://developer.zhihu.com/docs?key=zhihu_cli) 为准。

---

## 🌟 Star History

<a href="https://www.star-history.com/?repos=CharlesPikachu%2Fzhihu-verse&type=date&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=CharlesPikachu/zhihu-verse&type=date&theme=dark&legend=top-left&sealed_token=_bPohUsyf1fNtXjJmb2QE30xly1HTKhkgQLYoQXS8wDNNEx86OPAtUmTfoO6tjVrLK-WeeiwzVpSW12GoiQHTUoYi1-1AbjUkO9Kdq8QzLw_4AsgnV0icQ" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=CharlesPikachu/zhihu-verse&type=date&legend=top-left&sealed_token=_bPohUsyf1fNtXjJmb2QE30xly1HTKhkgQLYoQXS8wDNNEx86OPAtUmTfoO6tjVrLK-WeeiwzVpSW12GoiQHTUoYi1-1AbjUkO9Kdq8QzLw_4AsgnV0icQ" />
   <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=CharlesPikachu/zhihu-verse&type=date&legend=top-left&sealed_token=_bPohUsyf1fNtXjJmb2QE30xly1HTKhkgQLYoQXS8wDNNEx86OPAtUmTfoO6tjVrLK-WeeiwzVpSW12GoiQHTUoYi1-1AbjUkO9Kdq8QzLw_4AsgnV0icQ" />
 </picture>
</a>

如果你喜欢这个项目，欢迎点一个 ⭐ **Star**。它会让更多人发现 ZHIHU://VERSE，也能支持后续维护和新实验继续生长。

---

## ☕ 赞助

如果 ZHIHU://VERSE 对你的学习、研究或开发有帮助，可以通过 [GitHub Sponsors](https://github.com/sponsors/CharlesPikachu) 或赞赏码支持后续维护。

| 微信赞赏码 | 支付宝赞赏码 |
| :---: | :---: |
| <img src="https://raw.githubusercontent.com/CharlesPikachu/zhihu-verse/main/.github/pictures/wechat_reward.jpg" width="240" alt="WeChat Appreciation" /> | <img src="https://raw.githubusercontent.com/CharlesPikachu/zhihu-verse/main/.github/pictures/alipay_reward.png" width="240" alt="Alipay Appreciation" /> |
