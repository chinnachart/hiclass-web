import * as migration_20260823_150027_initial from './20260823_150027_initial';
import * as migration_20260905_093905_add_rental_and_faq from './20260905_093905_add_rental_and_faq';

export const migrations = [
  {
    up: migration_20260823_150027_initial.up,
    down: migration_20260823_150027_initial.down,
    name: '20260823_150027_initial',
  },
  {
    up: migration_20260905_093905_add_rental_and_faq.up,
    down: migration_20260905_093905_add_rental_and_faq.down,
    name: '20260905_093905_add_rental_and_faq'
  },
];
