import { createApp } from "./app";
import { config } from "./config";
import { initCloudinary } from "./services/cloudinary";
import { ensureBootstrapAdmin } from "./services/adminBootstrap";
import { purgeExpiredSessions } from "./lib/session";

async function main() {
  initCloudinary();
  await ensureBootstrapAdmin();
  await purgeExpiredSessions();

  const app = createApp();
  app.listen(config.port, () => {
    console.log(`API listening on port ${config.port}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
