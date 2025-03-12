# 🤖 STORK ORACLE Automated Verification Bot

English | [简体中文](README.md)

![Node Version](https://img.shields.io/badge/Node.js-22.x-brightgreen)
![License](https://img.shields.io/badge/License-MIT-blue)
![Language](https://img.shields.io/badge/Language-English-blue)

## 📖 Project Introduction

STORK ORACLE Automated Verification Bot is a specialized tool designed for the STORK ORACLE network. It helps you easily participate in data validation work, supporting multi-account management and flexible proxy configuration.

### 🔥 Prerequisites

1. Download and install Chrome plugin: [Stork Verify](https://chromewebstore.google.com/detail/stork-verify/knnliglhgkmlblppdejchidfihjnockl)
2. Register using email
3. Use invitation code: `5LUXWB9MN4`

### ✨ Core Features

- 🚀 Parallel multi-account verification (batch management support)
- 🔐 Flexible proxy configuration (HTTP/HTTPS/SOCKS)
- 💾 Automatic token management and refresh
- 📊 Real-time verification statistics
- 🔄 Smart error retry mechanism
- 🌐 Comprehensive proxy support
- ⚡ Automatic grouping to avoid request limits
- 🧹 Regular memory cleanup for stability

## 🎯 Getting Started

### 1️⃣ Node.js Environment Setup

1. Install nvm (Node Version Manager):
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash

# Execute one of the following based on your shell
source ~/.bashrc   # for bash
source ~/.zshrc    # for zsh
```

2. Install Node.js 22:
```bash
nvm install 22
nvm list
```

3. Set default version:
```bash
nvm use 22
nvm alias default 22
```

4. Verify installation:
```bash
node -v   # Expected output: v22.13.1
nvm current # Expected output: v22.13.1
npm -v    # Expected output: 10.9.2
```

### 2️⃣ System Requirements

- Node.js 22.x or higher
- Stable network connection
- Supports Windows/Linux/MacOS

### 3️⃣ Quick Start

1. Clone project and install dependencies:
```bash
git clone https://github.com/mumumusf/STORK.git
cd STORK
npm install
```

2. Configure account information (two methods):

   A. Manual input mode:
   ```bash
   node index.js
   # Select option 1, follow prompts to input account info
   ```

   B. Configuration file mode (recommended):
   ```bash
   # Edit accounts.txt file
   # Format: email----password----proxy
   ```

## 📝 Account Configuration

### accounts.txt Format Guide

1. Basic format:
```bash
# email----password----proxy
account@gmail.com----password----127.0.0.1:7890:user:pass
```

2. Field description:
   - Email: Your login email
   - Password: Account password
   - Proxy: Optional, supports various formats

3. Proxy format examples:
```bash
# Basic format
127.0.0.1:8080

# With authentication
127.0.0.1:8080:username:password

# With protocol (supports http/https/socks4/socks5)
http://127.0.0.1:8080
socks5://127.0.0.1:1080
```

## 🚀 Operation Guide

### Running Modes

1. Manual input mode:
   - Suitable for first-time use or testing
   - Interactive account input
   - Add accounts one by one

2. Configuration file mode:
   - Ideal for batch running multiple accounts
   - Supports automatic grouping (10 accounts per group)
   - 10-second interval between group starts

### Error Handling

1. Request limit handling:
   - Automatic 3-minute wait before retry
   - Maximum 3 retry attempts
   - Displays retry progress and remaining attempts

2. Verification interval:
   - Default 30-second verification interval
   - Configurable through settings

3. Memory management:
   - Automatic memory cleanup every 5 minutes
   - Optimizes long-term stability

## 💻 Background Running Guide

### 1. Linux/MacOS Using Screen

1. Install Screen:
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install screen

# CentOS/RHEL
sudo yum install screen

# MacOS
brew install screen
```

2. Basic Screen operations:
```bash
# Create new session
screen -S stork-bot

# Start program
node index.js

# Common shortcuts:
# Ctrl + A, D    Detach session (keep running)
# Ctrl + A, K    Kill current session
# Ctrl + A, ?    View all shortcuts
```

3. Session management:
```bash
# List all sessions
screen -ls

# Resume specific session
screen -r stork-bot

# Clean up dead sessions
screen -wipe
```

4. Multi-account management example:
```bash
# Create multiple sessions for different account groups
screen -S stork-bot1    # First group
screen -S stork-bot2    # Second group
screen -S stork-bot3    # Third group

# Run program in each session
node index.js
```

### 2. Windows Methods

1. Using PowerShell background running:
```powershell
Start-Process -NoNewWindow node index.js
```

2. Or using Windows Terminal tabs:
- Open Windows Terminal
- Press Ctrl + Shift + T for new tab
- Run different account groups in separate tabs

## ⚙️ Performance Optimization

1. Account management:
   - Recommended 5-10 accounts per server
   - Use different proxy IPs for different accounts
   - Group accounts to avoid overload

2. Proxy settings:
   - Use stable proxy servers
   - Regularly rotate proxy addresses
   - Ensure acceptable proxy latency

3. System resources:
   - Monitor CPU and memory usage
   - Maintain sufficient bandwidth
   - Regular log checking

## 🔍 Running Monitor

Program displays verification status in real-time:
```bash
=============================================
   STORK ORACLE Bot - AIRDROP INSIDERS
=============================================
Account: account@example.com
✓ Valid verifications: xxx
✗ Invalid verifications: xxx
↻ Last verification time: yyyy-mm-dd HH:MM:SS
👥 Recommended usage count: xxx
=============================================
```

## ⚠️ Important Notes

1. Security recommendations:
   - Change account passwords regularly
   - Keep configuration files secure
   - Use secure proxy servers

2. Running recommendations:
   - Use screen for background running
   - Regular `screen -ls` checks
   - Clean up abnormal sessions with `screen -wipe`
   - Windows users should use Windows Terminal
   - Create separate sessions for different account groups

3. Configuration recommendations:
   - Save files in UTF-8 encoding
   - Regular data backups
   - Follow configuration file format

## 🆘 Common Issues

1. "Too many requests" error:
   - Normal occurrence, handled automatically
   - 3-minute wait before retry
   - Maximum 3 retry attempts

2. Proxy connection issues:
   - Check proxy format
   - Verify proxy server availability
   - Try alternative proxy addresses

3. Verification failures:
   - Check network connection
   - Verify account status
   - Review error logs

## 📱 Technical Support

When reporting issues, please provide:
1. Complete error logs
2. Environment information
3. Detailed steps to reproduce

Contact:
- Twitter: [@YOYOMYOYOA](https://x.com/YOYOMYOYOA)
- Telegram: [@YOYOZKS](https://t.me/YOYOZKS)

## ⚖️ Disclaimer

1. This program is for educational purposes only
2. Commercial use is prohibited
3. Users are responsible for any consequences of using this program

---
Made with ❤️ by [@YOYOMYOYOA](https://x.com/YOYOMYOYOA) 