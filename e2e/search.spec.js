import { expect, test } from './fixtures.js';

test('searches an article and shows its manufacturers', async ({ page, mockApi }) => {
  mockApi.setResponse('ARTICLE-123', {
    goods: [
      {
        brand: 'Acme Motors',
        number: 'ARTICLE-123',
        name: 'Oil filter',
        goodsID: 'acme-123',
      },
    ],
  });

  await page.goto('/');
  await page.getByLabel('Part number').fill('ARTICLE-123');

  await expect(page.getByRole('cell', { name: 'Acme Motors' })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'ARTICLE-123' })).toBeVisible();
});

test('shows no results and removes previous manufacturers', async ({
  page,
  mockApi,
}) => {
  mockApi.setResponse('ARTICLE-FOUND', {
    goods: [
      {
        brand: 'Old Manufacturer',
        number: 'ARTICLE-FOUND',
        name: 'Old product',
        goodsID: 'old-1',
      },
    ],
  });
  mockApi.setResponse('ARTICLE-MISSING', { goods: [] });

  await page.goto('/');
  await page.getByLabel('Part number').fill('ARTICLE-FOUND');
  await expect(
    page.getByRole('cell', { name: 'Old Manufacturer' }),
  ).toBeVisible();

  await page.getByLabel('Part number').fill('ARTICLE-MISSING');

  await expect(page.getByText('No manufacturers found')).toBeVisible();
  await expect(
    page.getByRole('cell', { name: 'Old Manufacturer' }),
  ).toHaveCount(0);
});

test('shows an API error and recovers on a successful retry', async ({
  page,
  mockApi,
}) => {
  mockApi.setResponse('ARTICLE-RETRY', { message: 'Unavailable' }, 500);

  await page.goto('/');
  await page.getByLabel('Part number').fill('ARTICLE-RETRY');
  await expect(page.getByRole('alert')).toContainText(
    'Unable to load manufacturers',
  );

  mockApi.setResponse('ARTICLE-RETRY', {
    goods: [
      {
        brand: 'Recovered Manufacturer',
        number: 'ARTICLE-RETRY',
        name: 'Recovered product',
        goodsID: 'recovered-1',
      },
    ],
  });

  await page.getByLabel('Part number').fill('');
  await page.getByLabel('Part number').fill('ARTICLE-RETRY');

  await expect(
    page.getByRole('cell', { name: 'Recovered Manufacturer' }),
  ).toBeVisible();
  expect(mockApi.requests.filter((number) => number === 'ARTICLE-RETRY')).toHaveLength(2);
});
