//playwright.config.ts
import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
    testDir: './tests',
    timeout: 60000,
    testMatch: /.*\.spec\.ts/,
    reporter: [
        ['list'],
        ['html', { open: 'never' }],
        ['allure-playwright', { resultsDir: 'allure-results' }],
    ],
    use: {
        baseURL: 'https://www.saucedemo.com',
        browserName: 'chromium',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        trace: 'on-first-retry',
        },

        projects: [
            {
                name: 'chromium',
                use: { browserName: 'chromium' },
            },
        ],
    }

export default config;