import {defineConfig} from '@playwright/test';
export default defineConfig({
  testDir:'./tests',testMatch:'browser.spec.js',workers:1,timeout:60000,
  use:{baseURL:process.env.PLAY_URL||'http://127.0.0.1:4173/',viewport:{width:1440,height:900},screenshot:'only-on-failure',
    launchOptions:{args:['--enable-unsafe-swiftshader']}},
  webServer:process.env.PLAY_URL?undefined:{command:'node scripts/serve.mjs',url:'http://127.0.0.1:4173',reuseExistingServer:true},
  reporter:'list'
});
