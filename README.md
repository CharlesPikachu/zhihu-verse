<div align="center">

<img src="./assets/favicon.svg" width="96" alt="ZHIHU://VERSE" />

# ZHIHU://VERSE

一个由 Zhihu CLI 驱动的交互式知乎实验场

把搜索、直答、热榜、个人内容与开放平台工具组合成知识宇宙、小游戏和可视化体验。

[简体中文](./README.md) · [English](./README_EN.md)

[![Live Demo](https://img.shields.io/badge/Live%20Demo-ZHIHU%3A%2F%2FVERSE-00E5FF?style=for-the-badge)](https://charlespikachu.github.io/zhihu-verse/)

[![GitHub Stars](https://img.shields.io/github/stars/CharlesPikachu/zhihu-verse?style=flat-square)](https://github.com/CharlesPikachu/zhihu-verse/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/CharlesPikachu/zhihu-verse?style=flat-square)](https://github.com/CharlesPikachu/zhihu-verse/forks)
[![Last Commit](https://img.shields.io/github/last-commit/CharlesPikachu/zhihu-verse?style=flat-square)](https://github.com/CharlesPikachu/zhihu-verse/commits/main)
[![GitHub Pages](https://github.com/CharlesPikachu/zhihu-verse/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/CharlesPikachu/zhihu-verse/actions/workflows/deploy-pages.yml)

</div>

## 🌌 ZHIHU://VERSE 基本介绍

ZHIHU://VERSE 不是单一的 API 示例页面，而是一个围绕 Zhihu CLI 构建的交互式实验场。项目将知乎搜索、全网搜索、直答、热榜、用户内容、关注、收藏、收藏夹，以及 PDF 解析和 PPT 生成等能力重新组合为 9 个独立实验，让知乎开放平台的数据与能力以更直观、更具探索性的方式呈现。

你可以在 Demo 模式下直接体验界面与交互，也可以连接自己的 Access Secret，使用真实知乎数据完成搜索、知识图谱构建、个人内容回顾、收藏问答、热榜追踪等操作。

- 🌐 在线体验：[ZHIHU://VERSE](https://charlespikachu.github.io/zhihu-verse/)
- 📖 项目介绍与设计说明：[知乎回答](https://www.zhihu.com/question/2068735236100154306/answer/2069250015713875761)
- 🧩 Zhihu CLI 文档：[知乎开放平台文档](https://developer.zhihu.com/docs?key=zhihu_cli)

如果这个项目对你有帮助，欢迎点一个 ⭐ Star。

## 🚀 运行与 Access Secret

(1) 本地运行

```bash
git clone https://github.com/CharlesPikachu/zhihu-verse.git
cd zhihu-verse
python -m http.server 4173
```

然后打开 `http://127.0.0.1:4173`。

(2) Demo 模式

首次进入时，可以点击「ENTER DEMO」直接体验，不需要 Access Secret。Demo 模式适合快速浏览主要交互效果；如果希望调用真实知乎数据，则需要连接自己的 Access Secret。

(3) 连接 Access Secret

点击右上角「OFFLINE / DEMO」，或首页的「CONNECT ZHIHU」，填入自己的 Access Secret 即可。

个人创作、关注、收藏、收藏夹等接口默认读取当前调用方本人的公开数据，因此 ZHIHU://VERSE 统一使用 Access Secret 访问这些能力。

> Access Secret 属于敏感凭据，请勿提交到 GitHub 仓库、Issue、公开日志或截图中。

(4) CORS 与 Cloudflare Worker

如果浏览器直接请求知乎开放平台时遇到 CORS，可以部署 `worker/` 目录中的 Cloudflare Worker，并在 `config.js` 中填写 Worker 地址：

```js
window.ZHIHU_VERSE_CONFIG = {
  proxyUrl: 'https://your-worker.workers.dev',
  defaultTransport: 'auto'
};
```

(5) GitHub Pages

仓库已经包含 `.github/workflows/deploy-pages.yml`。在仓库设置中将 Pages Source 选择为「GitHub Actions」，即可使用现有工作流部署。

## ✨ 主要功能

1. 🔭 EXPLORE — 双域探索

   *功能：* 将普通搜索结果转化为可继续展开的空间节点，在同一界面中探索知乎内容、全网信息及其关联关系。

   *用了 Zhihu CLI 哪些能力：* 知乎搜索、全网搜索、直答。

   *使用方式：* 输入问题或主题，选择「知乎 / 全网 / 混合」后点击「LAUNCH」。点击节点可查看摘要、作者、互动信息和原始来源；「EXPAND」会以当前节点继续搜索，「ZHIDA EXPLAIN」可调用直答进一步解释该节点。

   *演示 Demo：* [▶ 直接打开 / 下载 MP4](https://raw.githubusercontent.com/CharlesPikachu/zhihu-verse/main/docs/1.%20EXPLORE%20%E2%80%94%20%E5%8F%8C%E5%9F%9F%E6%8E%A2%E7%B4%A2.mp4)

2. ⚛️ COLLIDER — 知识对撞

   *功能：* 在两个看似无关的概念之间寻找可解释、可验证的知识路径。

   *用了 Zhihu CLI 哪些能力：* 直答、知乎搜索。

   *使用方式：* 在左右两侧输入两个概念并点击「COLLIDE」。系统先由直答生成中间知识路径，再调用知乎搜索对中间节点进行补充与验证。

   *演示 Demo：* [▶ 直接打开 / 下载 MP4](https://raw.githubusercontent.com/CharlesPikachu/zhihu-verse/main/docs/2.%20COLLIDER%20%E2%80%94%20%E7%9F%A5%E8%AF%86%E5%AF%B9%E6%92%9E.mp4)

3. 🕸️ GRAPH — 知识图谱

   *功能：* 围绕指定主题自动构建由知乎与全网信息共同组成的多层知识图谱。

   *用了 Zhihu CLI 哪些能力：* 直答、知乎搜索、全网搜索。

   *使用方式：* 输入主题并选择图谱深度，然后点击「BUILD GRAPH」。系统先拆分关键分支，再为各分支补充真实搜索结果；点击任意节点可查看详情和来源。

   *演示 Demo：* [▶ 直接打开 / 下载 MP4](https://raw.githubusercontent.com/CharlesPikachu/zhihu-verse/main/docs/3.%20GRAPH%20%E2%80%94%20%E7%9F%A5%E8%AF%86%E5%9B%BE%E8%B0%B1.mp4)

4. 🧠 ZHIDA ARENA — 直答问答

   *功能：* 根据指定主题或个人收藏内容动态生成五题知识挑战，并提供即时解释与计分。

   *用了 Zhihu CLI 哪些能力：* 直答、用户收藏、收藏夹列表、收藏夹内容。

   *使用方式：* 可选择「自选主题」后输入主题开始答题；也可以选择「根据我的收藏」，系统会读取当前账号的收藏内容并交由直答生成题目。每题提交后即时显示解释、得分和连胜。

   *演示 Demo：* [▶ 直接打开 / 下载 MP4](https://raw.githubusercontent.com/CharlesPikachu/zhihu-verse/main/docs/4.%20ZHIDA%20ARENA%20%E2%80%94%20%E7%9B%B4%E7%AD%94%E9%97%AE%E7%AD%94.mp4)

5. 🏃 RUNNER — 问题跑酷

   *功能：* 将知乎热榜和搜索问题转化为跑酷障碍，形成类似 Chrome 小恐龙的交互式小游戏。

   *用了 Zhihu CLI 哪些能力：* 热榜、知乎搜索。

   *使用方式：* 点击「START / RESTART」开始。地面问题可通过空格、↑ 或点击画布跳跃，并支持二段跳；出现紫色空中问题时，可按 ↓ 或 S 下蹲。「REFRESH QUESTION POOL」可重新生成题库。

   *演示 Demo：* [▶ 直接打开 / 下载 MP4](https://raw.githubusercontent.com/CharlesPikachu/zhihu-verse/main/docs/5.%20RUNNER%20%E2%80%94%20%E9%97%AE%E9%A2%98%E8%B7%91%E9%85%B7.mp4)

6. 🪐 MY MEMORY — 记忆星球

   *功能：* 将个人创作、收藏、收藏夹与关注内容聚合为可探索的个人知识星球。

   *用了 Zhihu CLI 哪些能力：* 用户内容、用户关注、用户收藏、收藏夹列表、收藏夹内容、直答。

   *使用方式：* 连接 Access Secret 后点击「ASSEMBLE PLANET」。通过「TIME DEPTH」调整时间范围；「AI THEME SCAN」会调用直答，对当前内容中的主要主题进行概括。

   *演示 Demo：* [▶ 直接打开 / 下载 MP4](https://raw.githubusercontent.com/CharlesPikachu/zhihu-verse/main/docs/6.%20MY%20MEMORY%20%E2%80%94%20%E8%AE%B0%E5%BF%86%E6%98%9F%E7%90%83.mp4)

7. 📅 RECAP — 年度 / 月度回顾

   *功能：* 根据个人公开创作与收藏数据生成年度或月度内容回顾，并支持导出分享长图。

   *用了 Zhihu CLI 哪些能力：* 用户内容、用户收藏、收藏夹内容、直答。

   *使用方式：* 选择年份和月份后点击「GENERATE」。系统会整理活动时间线、关键词与内容高光；「ZHIDA COMMENT」可生成简短回顾，「EXPORT LONG POSTER」可导出 1080 × 2480 的 PNG 分享长图。

   *演示 Demo：* [▶ 直接打开 / 下载 MP4](https://raw.githubusercontent.com/CharlesPikachu/zhihu-verse/main/docs/7.%20RECAP%20%E2%80%94%20%E5%B9%B4%E5%BA%A6%E6%9C%88%E5%BA%A6%E5%9B%9E%E9%A1%BE.mp4)

8. 💫 LIVE — 热榜超新星

   *功能：* 将多次知乎热榜快照串联成时间序列，用于观察话题排名变化与快速上升趋势。

   *用了 Zhihu CLI 哪些能力：* 知乎热榜。

   *使用方式：* 点击「SCAN NOW」保存当前热榜。积累两份以上快照后即可比较排名变化；快速上涨的话题会触发超新星效果，「REPLAY」可回看历史快照。

   *演示 Demo：* [▶ 直接打开 / 下载 MP4](https://raw.githubusercontent.com/CharlesPikachu/zhihu-verse/main/docs/8.%20LIVE%20%E2%80%94%20%E7%83%AD%E6%A6%9C%E8%B6%85%E6%96%B0%E6%98%9F.mp4)

9. 🧰 TOOLS LAB — PDF / PPT

   *功能：* 提供知乎开放平台 PDF 解析与 PPT 生成能力的可视化操作面板。

   *用了 Zhihu CLI 哪些能力：* PDF 文件上传、PDF 解析任务创建与查询、PPT 生成任务创建与查询。

   *使用方式：* PDF 区域选择文件后点击「UPLOAD + PARSE」，再通过「CHECK STATUS」查询解析结果；PPT 区域输入知乎回答或专栏文章链接并选择页数，点击「CREATE PPT」创建任务，再使用「CHECK STATUS」查询生成状态。

   *演示 Demo：* [▶ 直接打开 / 下载 MP4](https://raw.githubusercontent.com/CharlesPikachu/zhihu-verse/main/docs/9.%20TOOLS%20LAB%20%E2%80%94%20PDF%20PPT.mp4)


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

## ☕ 赞助

如果你喜欢 ZHIHU://VERSE，或者这个项目为你的学习、研究或开发带来了帮助，可以通过 GitHub Sponsors 或赞赏码支持后续维护与更新。

<div align="center">

[![GitHub Sponsors](https://img.shields.io/badge/GitHub%20Sponsors-Sponsor-EA4AAA?style=for-the-badge&logo=githubsponsors&logoColor=white)](https://github.com/sponsors/CharlesPikachu)

</div>

| 微信赞赏码 | 支付宝赞赏码 |
| :--: | :--: |
| <img src="https://raw.githubusercontent.com/CharlesPikachu/musicdl/master/.github/pictures/wechat_reward.jpg" width="260" alt="WeChat Appreciation QR Code" /> | <img src="https://raw.githubusercontent.com/CharlesPikachu/musicdl/master/.github/pictures/alipay_reward.png" width="260" alt="Alipay Appreciation QR Code" /> |

<div align="center">

ZHIHU://VERSE · Explore Zhihu as a universe.

</div>
