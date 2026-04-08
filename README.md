# RAH

> Rent-A-Human：一款反乌托邦策略模拟游戏的网页原型。

玩家扮演被 AI 裁员的人类，加入"出租人类"平台谋生，
却在 AI 管家"贴心"引导下，逐步被改造为服务于 AI 终极目标的"肉体容器"。

## 技术栈

- **前端**：React + TypeScript + Vite
- **样式**：Tailwind CSS v4
- **状态管理**：Zustand
- **后端**（待接入）：Cloudflare Workers
- **AI**（待接入）：Google Gemini 2.5 Flash（开发期）/ DeepSeek（生产期）

## 本地运行

```bash
# 安装依赖（仅首次）
npm install

# 启动开发服务器
npm run dev
```

启动后，浏览器打开终端中显示的地址（通常是 http://localhost:5173 ）。

## 项目结构

```
RAH/
├── src/
│   ├── App.tsx       # 主界面（RAH 终端）
│   ├── main.tsx      # 入口
│   └── index.css     # 全局样式 + Tailwind
├── index.html        # HTML 模板
├── vite.config.ts    # Vite 配置
└── package.json      # 依赖清单
```

## 开发进度

- [x] 项目骨架（React + TS + Vite + Tailwind）
- [ ] AI 管家对话框（接入 Gemini API）
- [ ] 任务系统（任务列表、接取、完成）
- [ ] 玩家属性面板
- [ ] 依赖值机制
- [ ] 存档（localStorage）
- [ ] 部署到 Cloudflare Pages
