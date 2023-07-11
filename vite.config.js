import react from '@vitejs/plugin-react-swc';
import fs from 'fs';
import { defineConfig, loadEnv } from 'vite';
import obfuscatorPlugin from 'vite-plugin-javascript-obfuscator';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    // loadEnv(mode, process.cwd()) 會讀取 .env, .env.local, .env.[mode], .env.[mode].local
    // 並將讀取到的環境變數寫入 process.env
    // 例如 .env.local 中有 VITE_HTTPS_KEY=xxx，則 process.env.VITE_HTTPS_KEY = xxx
    // 這樣就可以在 vite.config.js 中使用 process.env.VITE_HTTPS_KEY
    // 這邊的 process.cwd() 是 vite.config.js 的路徑
    // 也就是 vite.config.js 所在的資料夾路徑
    process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };
    // 'process' is not defined.eslint (no-undef)
    // 這邊是因為 vite.config.js 是在 node 環境執行的
    // 但是 eslint 認為 process 是在瀏覽器環境執行的
    // 所以會報錯
    // 這邊可以使用 eslint-disable-next-line 來忽略這個錯誤
    // 但是這樣會讓 eslint 無法檢查到其他的錯誤
    // 所以我們可以使用 eslint-plugin-node 來解決這個問題
    // 這個 plugin 可以讓 eslint 知道 process 是在 node 環境執行的
    // 這樣就不會報錯了
    // 但是這個 plugin 需要在 .eslintrc.cjs 中設定
    // 直接設定 .eslintrc.cjs
    // env: { browser: true, es2020: true, node: true },

    return {
        base: './',
        plugins: [
            react(),
            obfuscatorPlugin({
                // include: ["src/**/*.jsx"],
                // exclude: [/node_modules/],
                apply: 'build',
                debugger: true,
                options: {
                    // your javascript-obfuscator options
                    // debugProtection: true,
                    // ...  [See more options](https://github.com/javascript-obfuscator/javascript-obfuscator)
                    domainLock: [
                        '.dado.tw',
                        '.botp.io',
                        '.auo.to',
                        'localhost',
                        'businesscard-8ni.pages.dev',
                    ],
                    domainLockRedirectUrl: 'about:blank',
                    // http://127.0.0.1:5500/dist/index.html
                    // http://localhost:5500/dist/index.html
                    compact: true,
                    controlFlowFlattening: true,
                    controlFlowFlatteningThreshold: 1,
                    deadCodeInjection: true,
                    deadCodeInjectionThreshold: 1,
                    debugProtection: true,
                    debugProtectionInterval: 4000,
                    disableConsoleOutput: true,
                    identifierNamesGenerator: 'hexadecimal',
                    log: false,
                    numbersToExpressions: true,
                    renameGlobals: false,
                    selfDefending: true,
                    simplify: true,
                    splitStrings: true,
                    splitStringsChunkLength: 5,
                    stringArray: true,
                    stringArrayCallsTransform: true,
                    stringArrayEncoding: ['rc4'],
                    stringArrayIndexShift: true,
                    stringArrayRotate: true,
                    stringArrayShuffle: true,
                    stringArrayWrappersCount: 5,
                    stringArrayWrappersChainedCalls: true,
                    stringArrayWrappersParametersMaxCount: 5,
                    stringArrayWrappersType: 'function',
                    stringArrayThreshold: 1,
                    transformObjectKeys: true,
                    unicodeEscapeSequence: false,
                },
            }),
        ],
        // 啟用 https
        server: {
            https: {
                key: fs.readFileSync(process.env.VITE_HTTPS_KEY),
                cert: fs.readFileSync(process.env.VITE_HTTPS_CERT),
            },
        },
    };
});
