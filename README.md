# AI 桌面助手
基于 Electron + DeepSeek API 开发的桌面 AI 助手，支持多角色切换、情绪表情包、游戏碎碎念等功能，通过透明毛玻璃窗口融入桌面环境。
## 功能特性
- **多角色人格**：5 个预设角色，支持自定义 system prompt
- **情绪表情包**：根据 AI 回复内容识别情绪，自动匹配本地 WebP 表情包
- **游戏碎碎念**：定时生成游戏评论，支持 5 种风格（吐槽 / 鼓励 / 迷惑 / 玩梗 / 观众）
- **音乐感知**（开发中）：尝试读取网易云音乐播放信息，生成音乐评论
- **透明毛玻璃界面**：无边框、始终置顶、融入桌面
- **全局快捷键**：`Ctrl + Shift + Space` 一键唤出 / 隐藏
- **窗口位置记忆**：关闭时保存位置，下次启动自动恢复
## 技术栈
| 技术 | 用途 |
|:---|:---|
| Electron | 桌面应用框架 |
| Node.js | 后端运行时 |
| DeepSeek API | AI 对话核心 |
| HTML / CSS / JavaScript | 界面与交互 |
| dotenv | 环境变量管理 |
## 项目结构
ai-desktop/
├── images/
│ └── emojis/ # 表情包素材
├── .env # 环境变量（API Key）
├── index.html # 主界面
├── main.js # Electron 主进程
├── renderer.js # 渲染进程逻辑
├── style.css # 样式
├── package.json # 项目配置
├── 启动.bat # 一键启动脚本
└── README.md # 项目说明
## 快速开始
### 环境要求
- Node.js v24+
- Windows 10/11
### 安装
```bash
git clone https://github.com/7iaoWen/ai-desktop.git
cd ai-desktop
npm install
###配置
创建 .env 文件，填入你的 DeepSeek API Key：
DEEPSEEK_API_KEY=sk-你的密钥
###运行
双击 启动.bat，或者：
npm start
##使用说明
操作	                                效果
Ctrl + Shift + Space	唤出 / 隐藏窗口
点击 🎮	                        开启 / 关闭碎碎念模式
点击 ⚙️	                        打开设置面板
拖拽 ⠿	                        移动窗口位置
点击 ⏻	                        退出应用