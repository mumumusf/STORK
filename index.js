// 导入所需的依赖包
import AmazonCognitoIdentity from 'amazon-cognito-identity-js';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { Worker, isMainThread, parentPort, workerData } from 'worker_threads';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { SocksProxyAgent } from 'socks-proxy-agent';
import displayBanner from './banner.js';
import { fileURLToPath } from 'url';

// 设置 __dirname（在 ES 模块中需要）
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 显示启动横幅
displayBanner();

// 创建 readline 接口
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 设置 Cognito 认证环境
const cognitoEnv = {
  userAgent: 'node',
  region: 'ap-northeast-1',
  clientId: '5msns4n49hmg3dftp2tp1t2iuh',
  userPoolId: 'ap-northeast-1_M22I44OpC'
};

// 设置环境变量
process.env.AWS_NODEJS_CONNECTION_REUSE_ENABLED = '1';

// 提示用户输入
function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

// 获取当前时间戳
function getTimestamp() {
  const now = new Date();
  return now.toISOString().replace('T', ' ').substr(0, 19);
}

// 获取格式化的日期时间
function getFormattedDate() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
}

// 日志记录函数
function log(message, type = 'INFO') {
  console.log(`[${getFormattedDate()}] [${type}] ${message}`);
}

// 从用户输入获取配置
async function getUserInput() {
  console.log('\n欢迎使用 STORK ORACLE 自动机器人！');
  console.log('请按提示输入以下信息：\n');
  
  const accounts = [];
  let continueAdding = true;

  while (continueAdding) {
    console.log(`\n正在配置第 ${accounts.length + 1} 个账号:`);
    const email = await prompt('请输入邮箱: ');
    const password = await prompt('请输入密码: ');
    const proxy = await prompt('请输入代理地址 (格式: ip:port:user:pass，直接回车跳过): ');
    
    if (email && password) {
      accounts.push({
        username: email,
        password: password,
        proxy: proxy || ''
      });

      const addMore = await prompt('\n是否继续添加账号? (y/n): ');
      continueAdding = addMore.toLowerCase() === 'y';
    } else {
      log('邮箱和密码不能为空，请重新输入', 'WARN');
    }
  }

  return accounts;
}

// 从文本文件加载账号信息
async function loadAccountsFromTextFile() {
  try {
    const configPath = path.join(__dirname, 'accounts.txt');
    if (!fs.existsSync(configPath)) {
      log('未找到配置文件 accounts.txt', 'WARN');
      return null;
    }
    const fileContent = await fs.promises.readFile(configPath, 'utf8');
    const accounts = [];
    
    // 按行分割并处理每一行
    const lines = fileContent.split('\n');
    for (const line of lines) {
      // 跳过空行和注释
      if (!line.trim() || line.trim().startsWith('#')) {
        continue;
      }
      
      // 使用----分割字段
      const parts = line.trim().split('----');
      if (parts.length >= 2) {
        accounts.push({
          username: parts[0].trim(),
          password: parts[1].trim(),
          proxy: parts[2] ? parts[2].trim() : ''
        });
      }
    }
    
    if (accounts.length === 0) {
      log('配置文件中没有有效的账号信息', 'WARN');
      return null;
    }
    
    return accounts;
  } catch (error) {
    log(`读取配置文件出错: ${error.message}`, 'ERROR');
    return null;
  }
}

// 从 config.json 加载配置
async function loadConfig() {
  try {
    log(`开始初始化配置...`, 'INFO');
    return await getUserInput();
  } catch (error) {
    log(`加载配置出错: ${error.message}`, 'ERROR');
    process.exit(1);
  }
}

// 初始化配置
async function initConfig() {
  const userConfig = await loadConfig();
  return {
    cognito: {
      region: 'ap-northeast-1',
      clientId: '5msns4n49hmg3dftp2tp1t2iuh',
      userPoolId: 'ap-northeast-1_M22I44OpC',
      username: userConfig.cognito?.username || '',
      password: userConfig.cognito?.password || ''
    },
    stork: {
      baseURL: 'https://app-api.jp.stork-oracle.network/v1',
      authURL: 'https://api.jp.stork-oracle.network/auth',
      tokenPath: path.join(__dirname, 'tokens.json'),
      intervalSeconds: 10,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
      origin: 'chrome-extension://knnliglhgkmlblppdejchidfihjnockl'
    },
    threads: {
      maxWorkers: 10,
      proxyFile: path.join(__dirname, 'proxies.txt')
    }
  };
}

// 全局配置对象
let config = {};
let userPool = null;

// 验证配置是否有效
function validateConfig() {
  if (!config.cognito.username || !config.cognito.password) {
    log('错误：必须在 config.json 中设置用户名和密码', 'ERROR');
    console.log('\n请在 config.json 文件中更新您的凭据：');
    console.log(JSON.stringify({
      cognito: {
        username: "YOUR_EMAIL",
        password: "YOUR_PASSWORD"
      }
    }, null, 2));
    return false;
  }
  return true;
}

// 解析代理字符串为标准格式
function parseProxy(proxyStr) {
  try {
    // 移除空格并分割字符串
    const parts = proxyStr.trim().split(':');
    
    // 根据部分数量判断代理格式
    switch (parts.length) {
      case 2: // ip:port
        return `http://${parts[0]}:${parts[1]}`;
      case 4: // ip:port:user:pass
        return `http://${parts[2]}:${parts[3]}@${parts[0]}:${parts[1]}`;
      case 5: // protocol:ip:port:user:pass
        return `${parts[0]}://${parts[3]}:${parts[4]}@${parts[1]}:${parts[2]}`;
      default:
        throw new Error(`无效的代理格式: ${proxyStr}`);
    }
  } catch (error) {
    log(`代理解析错误: ${error.message}`, 'ERROR');
    return null;
  }
}

// 加载代理配置
function loadProxies(config) {
  try {
    if (!fs.existsSync(config.threads.proxyFile)) {
      log(`代理文件未找到：${config.threads.proxyFile}，创建空文件`, 'WARN');
      fs.writeFileSync(config.threads.proxyFile, '', 'utf8');
      return [];
    }
    const proxyData = fs.readFileSync(config.threads.proxyFile, 'utf8');
    const proxies = proxyData
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#'))
      .map(proxy => parseProxy(proxy))
      .filter(proxy => proxy !== null);
    
    log(`从 ${config.threads.proxyFile} 加载了 ${proxies.length} 个代理`);
    return proxies;
  } catch (error) {
    log(`加载代理出错: ${error.message}`, 'ERROR');
    return [];
  }
}

// 获取代理代理
function getProxyAgent(proxy) {
  if (!proxy) return null;
  try {
    const proxyUrl = new URL(proxy);
    if (proxyUrl.protocol === 'http:' || proxyUrl.protocol === 'https:') {
      return new HttpsProxyAgent(proxy);
    } else if (proxyUrl.protocol === 'socks4:' || proxyUrl.protocol === 'socks5:') {
      return new SocksProxyAgent(proxy);
    } else {
      throw new Error(`不支持的代理协议: ${proxyUrl.protocol}`);
    }
  } catch (error) {
    log(`创建代理代理出错: ${error.message}`, 'ERROR');
    return null;
  }
}

// Cognito 认证类
class CognitoAuth {
  constructor(username, password, userPool) {
    this.username = username;
    this.password = password;
    this.userPool = userPool;
    this.authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({ Username: username, Password: password });
    this.cognitoUser = new AmazonCognitoIdentity.CognitoUser({ Username: username, Pool: userPool });
  }

  // 执行认证
  authenticate() {
    return new Promise((resolve, reject) => {
      this.cognitoUser.authenticateUser(this.authenticationDetails, {
        onSuccess: (result) => resolve({
          accessToken: result.getAccessToken().getJwtToken(),
          idToken: result.getIdToken().getJwtToken(),
          refreshToken: result.getRefreshToken().getToken(),
          expiresIn: result.getAccessToken().getExpiration() * 1000 - Date.now()
        }),
        onFailure: (err) => reject(err),
        newPasswordRequired: () => reject(new Error('需要设置新密码'))
      });
    });
  }

  // 刷新会话
  refreshSession(refreshToken) {
    const refreshTokenObj = new AmazonCognitoIdentity.CognitoRefreshToken({ RefreshToken: refreshToken });
    return new Promise((resolve, reject) => {
      this.cognitoUser.refreshSession(refreshTokenObj, (err, result) => {
        if (err) reject(err);
        else resolve({
          accessToken: result.getAccessToken().getJwtToken(),
          idToken: result.getIdToken().getJwtToken(),
          refreshToken: refreshToken,
          expiresIn: result.getAccessToken().getExpiration() * 1000 - Date.now()
        });
      });
    });
  }
}

// Token 管理类
class TokenManager {
  constructor(config, userPool) {
    this.config = config;
    this.userPool = userPool;
    this.accessToken = null;
    this.refreshToken = null;
    this.idToken = null;
    this.expiresAt = null;
    this.auth = new CognitoAuth(config.cognito.username, config.cognito.password, userPool);
  }

  // 获取有效的 token
  async getValidToken() {
    if (!this.accessToken || this.isTokenExpired()) await this.refreshOrAuthenticate();
    return this.accessToken;
  }

  // 检查 token 是否过期
  isTokenExpired() {
    return Date.now() >= this.expiresAt;
  }

  // 刷新或重新认证
  async refreshOrAuthenticate() {
    try {
      let result = this.refreshToken ? await this.auth.refreshSession(this.refreshToken) : await this.auth.authenticate();
      await this.updateTokens(result);
    } catch (error) {
      log(`Token 刷新/认证错误: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  // 更新 tokens
  async updateTokens(result) {
    this.accessToken = result.accessToken;
    this.idToken = result.idToken;
    this.refreshToken = result.refreshToken;
    this.expiresAt = Date.now() + result.expiresIn;
    const tokens = { accessToken: this.accessToken, idToken: this.idToken, refreshToken: this.refreshToken, isAuthenticated: true, isVerifying: false };
    await saveTokens(this.config, tokens);
    log(`账号 ${this.config.cognito.username} Tokens 已更新并保存到 tokens.json`);
  }
}

// 从文件获取 tokens
async function getTokens(config) {
  try {
    if (!fs.existsSync(config.stork.tokenPath)) throw new Error(`Token 文件未找到：${config.stork.tokenPath}`);
    const tokensData = await fs.promises.readFile(config.stork.tokenPath, 'utf8');
    const tokens = JSON.parse(tokensData);
    if (!tokens.accessToken || tokens.accessToken.length < 20) throw new Error('无效的访问令牌');
    log(`账号 ${config.cognito.username} 成功读取访问令牌: ${tokens.accessToken.substring(0, 10)}...`);
    return tokens;
  } catch (error) {
    log(`账号 ${config.cognito.username} 读取 tokens 出错: ${error.message}`, 'ERROR');
    throw error;
  }
}

// 保存 tokens 到文件
async function saveTokens(config, tokens) {
  try {
    await fs.promises.writeFile(config.stork.tokenPath, JSON.stringify(tokens, null, 2), 'utf8');
    log(`账号 ${config.cognito.username} Tokens 保存成功`);
    return true;
  } catch (error) {
    log(`账号 ${config.cognito.username} 保存 tokens 出错: ${error.message}`, 'ERROR');
    return false;
  }
}

// 通过 Stork API 刷新 tokens
async function refreshTokens(config, refreshToken) {
  try {
    log(`账号 ${config.cognito.username} 通过 Stork API 刷新访问令牌...`);
    const response = await axios({
      method: 'POST',
      url: `${config.stork.authURL}/refresh`,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': config.stork.userAgent,
        'Origin': config.stork.origin
      },
      data: { refresh_token: refreshToken }
    });
    const tokens = {
      accessToken: response.data.access_token,
      idToken: response.data.id_token || '',
      refreshToken: response.data.refresh_token || refreshToken,
      isAuthenticated: true,
      isVerifying: false
    };
    await saveTokens(config, tokens);
    log(`账号 ${config.cognito.username} 通过 Stork API 成功刷新 Token`);
    return tokens;
  } catch (error) {
    log(`账号 ${config.cognito.username} Token 刷新失败: ${error.message}`, 'ERROR');
    throw error;
  }
}

// 获取签名价格数据
async function getSignedPrices(config, tokens) {
  try {
    log(`获取账号 ${config.cognito.username} 的签名价格数据...`);
    const response = await axios({
      method: 'GET',
      url: `${config.stork.baseURL}/stork_signed_prices`,
      headers: {
        'Authorization': `Bearer ${tokens.accessToken}`,
        'Content-Type': 'application/json',
        'Origin': config.stork.origin,
        'User-Agent': config.stork.userAgent
      }
    });
    const dataObj = response.data.data;
    const result = Object.keys(dataObj).map(assetKey => {
      const assetData = dataObj[assetKey];
      return {
        asset: assetKey,
        msg_hash: assetData.timestamped_signature.msg_hash,
        price: assetData.price,
        timestamp: new Date(assetData.timestamped_signature.timestamp / 1000000).toISOString(),
        ...assetData
      };
    });
    log(`账号 ${config.cognito.username} 成功获取 ${result.length} 个签名价格`);
    return result;
  } catch (error) {
    log(`账号 ${config.cognito.username} 获取签名价格出错: ${error.message}`, 'ERROR');
    throw error;
  }
}

// 发送验证结果
async function sendValidation(config, tokens, msgHash, isValid, proxy) {
  try {
    const agent = getProxyAgent(proxy);
    const response = await axios({
      method: 'POST',
      url: `${config.stork.baseURL}/stork_signed_prices/validations`,
      headers: {
        'Authorization': `Bearer ${tokens.accessToken}`,
        'Content-Type': 'application/json',
        'Origin': config.stork.origin,
        'User-Agent': config.stork.userAgent
      },
      httpsAgent: agent,
      data: { msg_hash: msgHash, valid: isValid }
    });
    log(`✓ 通过 ${proxy || '直接连接'} 成功验证 ${msgHash.substring(0, 10)}...`);
    return response.data;
  } catch (error) {
    log(`✗ ${msgHash.substring(0, 10)}... 验证失败: ${error.message}`, 'ERROR');
    throw error;
  }
}

// 获取用户统计信息
async function getUserStats(config, tokens) {
  try {
    log(`获取账号 ${config.cognito.username} 的统计信息...`);
    const response = await axios({
      method: 'GET',
      url: `${config.stork.baseURL}/me`,
      headers: {
        'Authorization': `Bearer ${tokens.accessToken}`,
        'Content-Type': 'application/json',
        'Origin': config.stork.origin,
        'User-Agent': config.stork.userAgent
      }
    });
    return response.data.data;
  } catch (error) {
    log(`获取账号 ${config.cognito.username} 统计信息出错: ${error.message}`, 'ERROR');
    throw error;
  }
}

// 验证价格数据
function validatePrice(priceData) {
  try {
    log(`验证 ${priceData.asset || '未知资产'} 的数据`);
    if (!priceData.msg_hash || !priceData.price || !priceData.timestamp) {
      log('数据不完整，视为无效', 'WARN');
      return false;
    }
    const currentTime = Date.now();
    const dataTime = new Date(priceData.timestamp).getTime();
    const timeDiffMinutes = (currentTime - dataTime) / (1000 * 60);
    if (timeDiffMinutes > 60) {
      log(`数据过期（${Math.round(timeDiffMinutes)} 分钟前）`, 'WARN');
      return false;
    }
    return true;
  } catch (error) {
    log(`验证错误: ${error.message}`, 'ERROR');
    return false;
  }
}

// 工作线程逻辑
if (!isMainThread) {
  const { priceData, tokens, proxy, config } = workerData;

  async function validateAndSend() {
    try {
      const isValid = validatePrice(priceData);
      await sendValidation(config, tokens, priceData.msg_hash, isValid, proxy);
      parentPort.postMessage({ success: true, msgHash: priceData.msg_hash, isValid });
    } catch (error) {
      parentPort.postMessage({ success: false, error: error.message, msgHash: priceData.msg_hash });
    }
  }

  validateAndSend();
} else {
  // 主线程逻辑
  let previousStats = { validCount: 0, invalidCount: 0 };

  // 运行验证进程
  async function runValidationProcess(tokenManager, accountConfig) {
    try {
      log(`--------- 开始验证进程 (${accountConfig.cognito.username}) ---------`);
      const tokens = await getTokens(accountConfig);
      
      // 清理之前的统计数据以释放内存
      if (global.gc) {
        global.gc();
      }
      
      const signedPrices = await getSignedPrices(accountConfig, tokens);
      const proxies = loadProxies(accountConfig);

      if (!signedPrices || signedPrices.length === 0) {
        log(`账号 ${accountConfig.cognito.username} 没有数据需要验证`);
        const userData = await getUserStats(accountConfig, tokens);
        displayStats(userData, accountConfig);
        return;
      }

      log(`账号 ${accountConfig.cognito.username} 使用 ${accountConfig.threads.maxWorkers} 个工作线程处理 ${signedPrices.length} 个数据点...`);
      const workers = [];

      // 优化批处理逻辑，减少内存占用
      for (let i = 0; i < signedPrices.length; i++) {
        const priceData = signedPrices[i];
        const proxy = proxies.length > 0 ? proxies[i % proxies.length] : null;

        workers.push(new Promise((resolve) => {
          const worker = new Worker(new URL(import.meta.url), {
            workerData: { 
              priceData, 
              tokens: { accessToken: tokens.accessToken }, // 只传递必要的token信息
              proxy, 
              config: {
                stork: {
                  baseURL: accountConfig.stork.baseURL,
                  origin: accountConfig.stork.origin,
                  userAgent: accountConfig.stork.userAgent
                }
              } // 只传递必要的配置信息
            }
          });
          worker.on('message', (result) => {
            worker.terminate(); // 及时终止工作线程
            resolve(result);
          });
          worker.on('error', (error) => {
            worker.terminate();
            resolve({ success: false, error: error.message });
          });
          worker.on('exit', () => {
            resolve({ success: false, error: 'Worker 已退出' });
          });
        }));

        // 每处理一定数量的数据就等待完成，避免同时创建太多worker
        if (workers.length >= accountConfig.threads.maxWorkers) {
          await Promise.all(workers);
          workers.length = 0;
        }
      }

      // 处理剩余的worker
      if (workers.length > 0) {
        await Promise.all(workers);
      }

      // 更新统计信息
      const updatedUserData = await getUserStats(accountConfig, tokens);
      displayStats(updatedUserData, accountConfig);
      
      // 清理内存
      if (global.gc) {
        global.gc();
      }
    } catch (error) {
      log(`账号 ${accountConfig.cognito.username} 验证进程停止: ${error.message}`, 'ERROR');
    }
  }

  // 显示统计信息
  function displayStats(userData, accountConfig) {
    if (!userData || !userData.stats) {
      log(`账号 ${accountConfig.cognito.username} 没有可显示的有效统计数据`, 'WARN');
      return;
    }

    console.log('=============================================');
    console.log('   STORK ORACLE 自动机器人 - AIRDROP INSIDERS  ');
    console.log('=============================================');
    console.log(`时间: ${getTimestamp()}`);
    console.log('---------------------------------------------');
    console.log(`账号: ${accountConfig.cognito.username}`);
    console.log(`用户: ${userData.email || '未知'}`);
    console.log(`ID: ${userData.id || '未知'}`);
    console.log(`推荐码: ${userData.referral_code || '未知'}`);
    console.log('---------------------------------------------');
    console.log('验证统计:');
    console.log(`✓ 有效验证: ${userData.stats.stork_signed_prices_valid_count || 0}`);
    console.log(`✗ 无效验证: ${userData.stats.stork_signed_prices_invalid_count || 0}`);
    console.log(`↻ 最后验证时间: ${userData.stats.stork_signed_prices_last_verified_at || '从未'}`);
    console.log(`👥 推荐使用次数: ${userData.stats.referral_usage_count || 0}`);
    console.log('---------------------------------------------');
    console.log(`${accountConfig.stork.intervalSeconds} 秒后进行下一次验证...`);
    console.log('=============================================\n');
  }

  // 为每个账号创建验证进程
  async function createValidationProcess(account) {
    // 为每个账号创建独立的代理文件
    const proxyFileName = `proxies_${account.username}.txt`;
    
    // 如果有代理配置，保存到对应的代理文件
    if (account.proxy) {
      try {
        fs.writeFileSync(path.join(__dirname, proxyFileName), account.proxy, 'utf8');
        log(`账号 ${account.username} 的代理已保存到 ${proxyFileName}`);
      } catch (error) {
        log(`账号 ${account.username} 保存代理出错，将使用直接连接`, 'WARN');
      }
    }

    const accountConfig = {
      cognito: {
        region: 'ap-northeast-1',
        clientId: '5msns4n49hmg3dftp2tp1t2iuh',
        userPoolId: 'ap-northeast-1_M22I44OpC',
        username: account.username,
        password: account.password
      },
      stork: {
        baseURL: 'https://app-api.jp.stork-oracle.network/v1',
        authURL: 'https://api.jp.stork-oracle.network/auth',
        tokenPath: path.join(__dirname, `tokens_${account.username}.json`),
        intervalSeconds: 30,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
        origin: 'chrome-extension://knnliglhgkmlblppdejchidfihjnockl'
      },
      threads: {
        maxWorkers: 1, // 减少每个账号的工作线程
        proxyFile: path.join(__dirname, proxyFileName)
      }
    };

    const accountPool = new AmazonCognitoIdentity.CognitoUserPool({
      UserPoolId: accountConfig.cognito.userPoolId,
      ClientId: accountConfig.cognito.clientId
    });

    const tokenManager = new TokenManager(accountConfig, accountPool);
    
    const maxRetries = 3;
    const retryDelay = 180000; // 3分钟
    
    async function attemptStart(retryCount = 0) {
      try {
        await tokenManager.getValidToken();
        log(`账号 ${account.username} 初始认证成功`);

        // 启动验证进程
        const runProcess = () => runValidationProcess(tokenManager, accountConfig);
        runProcess();
        setInterval(runProcess, accountConfig.stork.intervalSeconds * 1000);
        
        // 定期刷新 token
        setInterval(async () => {
          await tokenManager.getValidToken();
          log(`账号 ${account.username} 通过 Cognito 刷新 Token`);
        }, 50 * 60 * 1000);
      } catch (error) {
        if (error.message.includes('Too many requests') && retryCount < maxRetries) {
          log(`账号 ${account.username} 遇到请求限制，${retryDelay/1000}秒后重试 (${retryCount + 1}/${maxRetries})`, 'WARN');
          setTimeout(() => attemptStart(retryCount + 1), retryDelay);
        } else {
          log(`账号 ${account.username} 启动失败: ${error.message}`, 'ERROR');
        }
      }
    }

    attemptStart();
  }

  // 主函数
  async function main() {
    try {
      console.log('\n请选择运行模式:');
      console.log('1. 手动输入账号信息');
      console.log('2. 从配置文件读取账号信息');
      
      const mode = await prompt('请输入选择 (1/2): ');
      
      let accounts = [];
      
      if (mode === '1') {
        // 手动输入模式
        accounts = await getUserInput();
      } else if (mode === '2') {
        // 文本配置文件模式
        const textFileAccounts = await loadAccountsFromTextFile();
        if (!textFileAccounts) {
          log('从配置文件加载失败，切换到手动输入模式');
          accounts = await getUserInput();
        } else {
          accounts = textFileAccounts;
          log(`从配置文件成功加载 ${accounts.length} 个账号`);
        }
      } else {
        throw new Error('无效的选择');
      }
      
      if (accounts.length === 0) {
        throw new Error('未配置任何账号');
      }

      log(`成功配置 ${accounts.length} 个账号`);
      
      // 将账号分组，每组10个账号
      const groupSize = 10;
      const accountGroups = [];
      for (let i = 0; i < accounts.length; i += groupSize) {
        accountGroups.push(accounts.slice(i, i + groupSize));
      }
      
      // 为每组账号创建验证进程，并错开启动时间
      accountGroups.forEach((group, groupIndex) => {
        setTimeout(() => {
          log(`启动第 ${groupIndex + 1} 组账号（${group.length} 个账号）`);
          group.forEach(account => {
            createValidationProcess(account);
          });
        }, groupIndex * 10000); // 每组间隔10秒启动
      });

      // 定期进行内存清理
      setInterval(() => {
        if (global.gc) {
          global.gc();
          log('执行内存清理');
        }
      }, 300000); // 每5分钟清理一次内存

    } catch (error) {
      log(`应用程序启动失败: ${error.message}`, 'ERROR');
      process.exit(1);
    } finally {
      // 关闭 readline 接口
      rl.close();
    }
  }

  // 启动应用
  main().catch(error => {
    log(`程序异常退出: ${error.message}`, 'ERROR');
    process.exit(1);
  });
}