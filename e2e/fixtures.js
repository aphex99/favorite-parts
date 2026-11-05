import { test as base } from '@playwright/test';

const apiUrl = /\/hs\/hsprice\/\?.*$/;

export const test = base.extend({
  mockApi: async ({ page }, use) => {
    const responses = new Map();
    const requests = [];

    await page.route(apiUrl, async (route) => {
      const requestUrl = new URL(route.request().url());
      const number = requestUrl.searchParams.get('number');
      const brand = requestUrl.searchParams.get('brand');
      const analogues = requestUrl.searchParams.get('analogues');
      const request = { number, brand, analogues };
      requests.push(request);

      const response = responses.get(
        JSON.stringify({ number, brand, analogues }),
      ) ?? responses.get(JSON.stringify({ number, brand: null, analogues: null })) ?? {
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
      setResponse(number, body, status = 200, params = {}) {
        const { brand = null, analogues = null } = params;
        responses.set(JSON.stringify({ number, brand, analogues }), {
          status,
          body,
        });
      },
    });
  },
});

export { expect } from '@playwright/test';
