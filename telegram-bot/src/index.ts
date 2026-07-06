import { createBot, initBotStorage } from "./bot.js";
import { config } from "./config.js";

async function main(): Promise<void> {
  await initBotStorage();
  console.log(`MRPH Telegram bot v2.2 (chain ${config.chainId})`);
  const bot = createBot();
  await bot.start({
    onStart: (info) => {
      console.log(`Bot @${info.username} is running`);
    },
  });
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
