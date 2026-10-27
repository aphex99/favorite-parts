import { test as base } from '@playwright/test';

const apiUrl = /\/hs\/hsprice\/\?.*$/;

export const test = base.extend({
  mockApi: async ({ page }, use) => {
    const responses = new Map();
    const requests = [];

    await page.route(apiUrl, async (route) => {
      const requestUrl = new URL(route.request().url());
      const number = requestUrl.searchParams.get('number');
      requests.push(number);

      const response = responses.get(number) ?? {
        status: 200,
        body: { goods: [] },
      };

      await route.fulfill({
        status: response.status,
        contentType: 'application/json',
        body: JSON.stringify(response.body),
      });
    });

    await use({
      requests,
      setResponse(number, body, status = 200) {
        responses.set(number, { status, body });
      },
    });
  },
});

export { expect } from '@playwright/test';
