// 导入chalk包用于控制台彩色输出
import chalk from 'chalk';

// 显示程序启动横幅的函数
export default function displayBanner() {
    // 使用自定义的ASCII艺术字体显示程序标题
    console.log(`
   ██╗  ██╗██╗ █████╗  ██████╗    ██╗     ██╗███╗   ██╗
   ╚██╗██╔╝██║██╔══██╗██╔═══██╗   ██║     ██║████╗  ██║
    ╚███╔╝ ██║███████║██║   ██║   ██║     ██║██╔██╗ ██║
    ██╔██╗ ██║██╔══██║██║   ██║   ██║     ██║██║╚██╗██║
   ██╔╝ ██╗██║██║  ██║╚██████╔╝   ███████╗██║██║ ╚████║
   ╚═╝  ╚═╝╚═╝╚═╝  ╚═╝ ╚═════╝    ╚══════╝╚═╝╚═╝  ╚═══╝

    ${chalk.yellow('=== Depined 自动化工具 ===')}
${chalk.cyan('** ====================================== **')}
${chalk.cyan('*         此脚本仅供免费使用              *')}
${chalk.cyan('*         禁止出售或用于盈利              *')}
${chalk.cyan('** ====================================== **')}


${chalk.green('* 作者: @YOYOMYOYOA')}
${chalk.green('* 空投玩家 | 现货玩家 | meme收藏')}
${chalk.green('* Github: github.com/mumumusf')}

${chalk.red('** ====================================== **')}
${chalk.red('*            免责声明                      *')}
${chalk.red('* 此脚本仅供学习交流使用                  *')}
${chalk.red('* 使用本脚本所产生的任何后果由用户自行承担 *')}
${chalk.red('* 如果因使用本脚本造成任何损失，作者概不负责*')}
${chalk.red('** ====================================== **')}`);
}