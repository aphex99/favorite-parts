import { describe, expect, it } from 'vitest';
import { getOfferRows } from './getOfferRows.js';

describe('getOfferRows', () => {
  it('returns one row per warehouse', () => {
    const rows = getOfferRows([{
      brand: 'Acme',
      number: '123',
      goodsID: 'part',
      warehouses: [
        { goodsID: 'north', stock: 2 },
        { goodsID: 'south', stock: 5 },
      ],
    }]);

    expect(rows).toHaveLength(2);
    expect(rows.map((row) => row.warehouse.goodsID)).toEqual(['north', 'south']);
  });
});
