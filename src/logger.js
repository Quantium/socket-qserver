import chalk from 'chalk';
import debug from 'debug';

const warning_f = (msg,level=1) => {
  switch (level) {
    case 1:
      console.warn("⚠️",chalk.red(msg))
      break;
    case 2:
      console.warn(" ⚠️",chalk.yellow(msg))
      break;
    case 3:
      console.log();
      console.warn("   ⚠️",chalk.bgGray.yellowBright.bold.underline(msg),"⚠️")
      console.log();
      break;
    default:
      console.warn(chalk.yellow(msg))
      break;
  }
}
const error_f = (message,e=undefined) => {
  console.log();
  console.error("🚨",chalk.redBright(message),"🚨")
  if (e) console.error("   👉",chalk.bgYellowBright.redBright.underline.bold(e));
  //process.exit(1);
}

export default function createLogger(name) {
  return {
    log: (...args) => console.log(chalk.gray(...args)),
    chat: (name,message,room="") => console.log(room,chalk.bgGrey(name),"💬",chalk.yellowBright.bgGrey.italic(message)),
    warning: warning_f,
    error: error_f,
    highlight: (...args) => console.log("📢",chalk.bgGray.underline(...args)),
    debug: debug(name)
  };
}          