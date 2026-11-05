import { expect, test } from './fixtures.js';

test('searches an article and shows its manufacturers', async ({
  page,
  mockApi,
}) => {
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
  await page.getByLabel('Номер').fill('ARTICLE-123');

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
  await page.getByLabel('Номер').fill('ARTICLE-FOUND');
  await expect(
    page.getByRole('cell', { name: 'Old Manufacturer' }),
  ).toBeVisible();

  await page.getByLabel('Номер').fill('ARTICLE-MISSING');

  await expect(page.getByText('Производители не найдены')).toBeVisible();
  await expect(
    page.getByRole('cell', { name: 'Old Manufacturer' }),
  ).toHaveCount(0);
});

test('shows an API error and recovers when the article is searched again', async ({
  page,
  mockApi,
}) => {
  mockApi.setResponse('ARTICLE-RETRY', { message: 'Unavailable' }, 500);

  await page.goto('/');
  await page.getByLabel('Номер').fill('ARTICLE-RETRY');
  await expect(page.getByRole('alert')).toContainText('Не удалось загрузить данные');

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

  await page.getByLabel('Номер').fill('');
  await page.getByLabel('Номер').fill('ARTICLE-RETRY');

  await expect(
    page.getByRole('cell', { name: 'Recovered Manufacturer' }),
  ).toBeVisible();
  expect(
    mockApi.requests.filter((request) => request.number === 'ARTICLE-RETRY'),
  ).toHaveLength(2);
});

test('selects a manufacturer, shows original and analogue offers, and goes back', async ({
  page,
  mockApi,
}) => {
  mockApi.setResponse('ARTICLE-OFFERS', {
    goods: [
      {
        brand: 'Acme',
        number: 'ARTICLE-OFFERS',
        name: 'Filter',
        goodsID: 'acme-original',
      },
    ],
  });
  mockApi.setResponse(
    'ARTICLE-OFFERS',
    {
      goods: [
        {
          brand: 'Acme',
          number: 'ARTICLE-OFFERS',
          goodsID: 'acme-original',
          warehouses: [{ goodsID: 'original-stock', price: 12.5, stock: 3 }],
          ANALOGUES: [
            {
              brand: 'Other',
              number: 'ANALOGUE-1',
              goodsID: 'analogue',
              warehouses: [
                { goodsID: 'analogue-stock', price: 9.25, stock: 7 },
              ],
            },
          ],
        },
      ],
    },
    200,
    { brand: 'Acme', analogues: 'on' },
  );

  await page.goto('/');
  await page.getByLabel('Номер').fill('ARTICLE-OFFERS');
  await page.getByRole('button', { name: 'Acme' }).click();

  await expect(page.getByRole('cell', { name: /12,50/ })).toBeVisible();
  await expect(page.getByRole('cell', { name: '3' })).toBeVisible();
  await expect(page.getByRole('cell', { name: /9,25/ })).toBeVisible();
  await expect(page.getByRole('cell', { name: '7' })).toBeVisible();
  expect(mockApi.requests).toContainEqual({
    number: 'ARTICLE-OFFERS',
    brand: 'Acme',
    analogues: 'on',
  });

  await page.getByRole('button', { name: 'Back' }).click();
  await expect(page.getByRole('button', { name: 'Acme' })).toBeVisible();
});

test('retries a failed offers request successfully', async ({
  page,
  mockApi,
}) => {
  mockApi.setResponse('ARTICLE-RETRY-OFFERS', {
    goods: [
      {
        brand: 'Acme',
        number: 'ARTICLE-RETRY-OFFERS',
        name: 'Filter',
        goodsID: 'acme',
      },
    ],
  });
  mockApi.setResponse('ARTICLE-RETRY-OFFERS', { message: 'Unavailable' }, 500, {
    brand: 'Acme',
    analogues: 'on',
  });

  await page.goto('/');
  await page.getByLabel('Номер').fill('ARTICLE-RETRY-OFFERS');
  await page.getByRole('button', { name: 'Acme' }).click();
  await expect(page.getByRole('alert')).toBeVisible();

  mockApi.setResponse(
    'ARTICLE-RETRY-OFFERS',
    {
      goods: [
        {
          brand: 'Acme',
          number: 'ARTICLE-RETRY-OFFERS',
          goodsID: 'acme',
          warehouses: [{ goodsID: 'stock', price: 15, stock: 2 }],
        },
      ],
    },
    200,
    { brand: 'Acme', analogues: 'on' },
  );
  await page.getByRole('button', { name: 'Повторить запрос' }).click();

  await expect(page.getByRole('alert')).toHaveCount(0);
  await expect(page.getByRole('cell', { name: /15,00/ })).toBeVisible();
  await expect(page.getByRole('cell', { name: '2' })).toBeVisible();
});
