# 🤖 STORK ORACLE 自动验证机器人

[English](README_EN.md) | 简体中文

![Node Version](https://img.shields.io/badge/Node.js-22.x-brightgreen)
![License](https://img.shields.io/badge/License-MIT-blue)
![Language](https://img.shields.io/badge/Language-中文-red)

## 📖 项目介绍

STORK ORACLE 自动验证机器人是一个专为 STORK ORACLE 网络设计的自动化工具。它能帮助您轻松参与数据验证工作，支持多账号管理和灵活的代理配置。

### 🔥 前置准备

1. 下载并安装 Chrome 插件：[Stork Verify](https://chromewebstore.google.com/detail/stork-verify/knnliglhgkmlblppdejchidfihjnockl)
2. 使用电子邮件注册账号
3. 注册时填写邀请码：`5LUXWB9MN4`

### ✨ 核心功能

- 🚀 多账号并行验证（支持批量管理）
- 🔐 灵活的代理配置（HTTP/HTTPS/SOCKS）
- 💾 Token 自动管理与刷新
- 📊 实时验证统计展示
- 🔄 智能错误重试机制
- 🌐 全面的代理支持
- ⚡ 自动分组处理，避免请求限制
- 🧹 定期内存清理，保证稳定性

## 🎯 使用准备

### 1️⃣ Node.js 环境安装

1. 安装 nvm（Node 版本管理器）：
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash

# 根据您的 shell 执行以下命令之一
source ~/.bashrc   # 如果使用 bash
source ~/.zshrc    # 如果使用 zsh
```

2. 安装 Node.js 22：
```bash
nvm install 22
nvm list
```

3. 设置默认版本：
```bash
nvm use 22
nvm alias default 22
```

4. 验证安装：
```bash
node -v   # 预期输出: v22.13.1
nvm current # 预期输出: v22.13.1
npm -v    # 预期输出: 10.9.2
```

### 2️⃣ 环境要求

- Node.js 22.x 或更高版本
- 稳定的网络环境
- 支持 Windows/Linux/MacOS

### 2️⃣ 快速开始

1. 克隆项目并安装依赖：
```bash
git clone https://github.com/mumumusf/STORK.git
cd STORK
npm install
```

2. 配置账号信息（两种方式）：

   A. 手动输入模式：
   ```bash
   node index.js
   # 选择选项 1，按提示输入账号信息
   ```

   B. 配置文件模式（推荐）：
   ```bash
   # 编辑 accounts.txt 文件
   # 格式：邮箱----密码----代理地址
   ```

## 📝 账号配置说明

### accounts.txt 格式说明

1. 基本格式：
```bash
# 邮箱----密码----代理地址
account@gmail.com----password----127.0.0.1:7890:user:pass
```

2. 字段说明：
   - 邮箱：您的登录邮箱
   - 密码：账号密码
   - 代理地址：可选，支持多种格式

3. 代理格式示例：
```bash
# 基础格式
127.0.0.1:8080

# 带认证信息
127.0.0.1:8080:username:password

# 指定协议（支持 http/https/socks4/socks5）
http://127.0.0.1:8080
socks5://127.0.0.1:1080
```

## 🚀 运行说明

### 运行模式

1. 手动输入模式：
   - 适合首次使用或测试
   - 交互式输入账号信息
   - 可以逐个添加账号

2. 配置文件模式：
   - 适合批量运行多个账号
   - 支持自动分组（每组10个账号）
   - 组间自动间隔10秒启动

### 错误处理机制

1. 请求限制处理：
   - 自动等待3分钟后重试
   - 最多重试3次
   - 显示重试进度和剩余次数

2. 验证间隔：
   - 默认每30秒验证一次
   - 可通过修改配置调整

3. 内存管理：
   - 每5分钟自动清理内存
   - 优化长期运行稳定性

## 💻 后台运行说明

### 1. Linux/MacOS 使用 Screen

1. 安装 Screen：
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install screen

# CentOS/RHEL
sudo yum install screen

# MacOS
brew install screen
```

2. Screen 基本操作：
```bash
# 创建新会话
screen -S stork-bot

# 启动程序
node index.js

# 常用快捷键：
# Ctrl + A, D    分离会话（保持程序运行）
# Ctrl + A, K    关闭当前会话
# Ctrl + A, ?    查看所有快捷键
```

3. 会话管理：
```bash
# 查看所有会话
screen -ls

# 恢复指定会话
screen -r stork-bot

# 清理无法恢复的会话
screen -wipe
```

4. 多账号管理示例：
```bash
# 创建多个会话运行不同账号组
screen -S stork-bot1    # 第一组账号
screen -S stork-bot2    # 第二组账号
screen -S stork-bot3    # 第三组账号

# 在每个会话中运行程序
node index.js
```

### 2. Windows 使用方法

1. 使用 PowerShell 后台运行：
```powershell
Start-Process -NoNewWindow node index.js
```

2. 或使用 Windows Terminal 多标签页：
- 打开 Windows Terminal
- 按 Ctrl + Shift + T 创建新标签页
- 在每个标签页运行不同账号组

## ⚙️ 性能优化建议

1. 账号管理：
   - 建议每台服务器运行 5-10 个账号
   - 不同账号使用不同代理IP
   - 账号分组运行，避免过载

2. 代理设置：
   - 使用稳定的代理服务器
   - 定期更换代理地址
   - 确保代理延迟在可接受范围

3. 系统资源：
   - 监控CPU和内存使用情况
   - 保持足够的网络带宽
   - 定期检查日志信息

## 🔍 运行监控

程序会实时显示验证状态：
```bash
=============================================
   STORK ORACLE 自动机器人 - AIRDROP INSIDERS
=============================================
账号：account@example.com
✓ 有效验证：xxx
✗ 无效验证：xxx
↻ 最后验证时间：yyyy-mm-dd HH:MM:SS
👥 推荐使用次数：xxx
=============================================
```

## ⚠️ 注意事项

1. 安全建议：
   - 定期更改账号密码
   - 不要泄露配置文件
   - 使用安全的代理服务器

2. 运行建议：
   - 使用 screen 保持程序后台运行
   - 定期使用 `screen -ls` 检查会话状态
   - 如遇会话异常，使用 `screen -wipe` 清理
   - Windows 用户建议使用 Windows Terminal
   - 为不同账号组创建独立会话

3. 配置建议：
   - 使用 UTF-8 编码保存配置文件
   - 定期备份重要数据
   - 遵循配置文件格式规范

## 🆘 常见问题

1. "Too many requests" 错误：
   - 属于正常现象，程序会自动处理
   - 等待3分钟后自动重试
   - 最多重试3次

2. 代理连接问题：
   - 检查代理格式是否正确
   - 确认代理服务器是否可用
   - 尝试更换代理地址

3. 验证失败问题：
   - 检查网络连接
   - 确认账号状态
   - 查看错误日志

## 📱 技术支持

如遇问题，请提供：
1. 完整的错误日志
2. 运行环境信息
3. 详细的操作步骤

联系方式：
- Twitter：[@YOYOMYOYOA](https://x.com/YOYOMYOYOA)
- Telegram：[@YOYOZKS](https://t.me/YOYOZKS)

## ⚖️ 免责声明

1. 本程序仅供学习交流使用
2. 禁止用于商业用途
3. 使用本程序产生的任何后果由用户自行承担

---
Made with ❤️ by [@YOYOMYOYOA](https://x.com/YOYOMYOYOA)