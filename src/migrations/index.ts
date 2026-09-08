import * as migration_20260823_150027_initial from './20260823_150027_initial';
import * as migration_20260905_093905_add_rental_and_faq from './20260905_093905_add_rental_and_faq';
import * as migration_20260906_001417_add_variants_line_analytics from './20260906_001417_add_variants_line_analytics';
import * as migration_20260908_090000_add_rental_rates from './20260908_090000_add_rental_rates';

export const migrations = [
  {
    up: migration_20260823_150027_initial.up,
    down: migration_20260823_150027_initial.down,
    name: '20260823_150027_initial',
  },
  {
    up: migration_20260905_093905_add_rental_and_faq.up,
    down: migration_20260905_093905_add_rental_and_faq.down,
    name: '20260905_093905_add_rental_and_faq',
  },
  {
    up: migration_20260906_001417_add_variants_line_analytics.up,
    down: migration_20260906_001417_add_variants_line_analytics.down,
    name: '20260906_001417_add_variants_line_analytics'
  },
  {
    up: migration_20260908_090000_add_rental_rates.up,
    down: migration_20260908_090000_add_rental_rates.down,
    name: '20260908_090000_add_rental_rates',
  },
];
