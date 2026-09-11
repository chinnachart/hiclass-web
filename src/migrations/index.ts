import * as migration_20260823_150027_initial from './20260823_150027_initial';
import * as migration_20260905_093905_add_rental_and_faq from './20260905_093905_add_rental_and_faq';
import * as migration_20260906_001417_add_variants_line_analytics from './20260906_001417_add_variants_line_analytics';
import * as migration_20260908_090000_add_rental_rates from './20260908_090000_add_rental_rates';
import * as migration_20260909_000000_add_branch_social from './20260909_000000_add_branch_social';
import * as migration_20260909_045543_add_page_content from './20260909_045543_add_page_content';
import * as migration_20260909_080000_add_contact_email from './20260909_080000_add_contact_email';
import * as migration_20260909_090000_add_powertrain from './20260909_090000_add_powertrain';
import * as migration_20260910_200000_add_google_ads from './20260910_200000_add_google_ads';
import * as migration_20260911_090000_add_finance_rates from './20260911_090000_add_finance_rates';

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
    name: '20260906_001417_add_variants_line_analytics',
  },
  {
    up: migration_20260908_090000_add_rental_rates.up,
    down: migration_20260908_090000_add_rental_rates.down,
    name: '20260908_090000_add_rental_rates',
  },
  {
    up: migration_20260909_000000_add_branch_social.up,
    down: migration_20260909_000000_add_branch_social.down,
    name: '20260909_000000_add_branch_social',
  },
  {
    up: migration_20260909_045543_add_page_content.up,
    down: migration_20260909_045543_add_page_content.down,
    name: '20260909_045543_add_page_content'
  },
  {
    up: migration_20260909_080000_add_contact_email.up,
    down: migration_20260909_080000_add_contact_email.down,
    name: '20260909_080000_add_contact_email',
  },
  {
    up: migration_20260909_090000_add_powertrain.up,
    down: migration_20260909_090000_add_powertrain.down,
    name: '20260909_090000_add_powertrain',
  },
  {
    up: migration_20260910_200000_add_google_ads.up,
    down: migration_20260910_200000_add_google_ads.down,
    name: '20260910_200000_add_google_ads',
  },
  {
    up: migration_20260911_090000_add_finance_rates.up,
    down: migration_20260911_090000_add_finance_rates.down,
    name: '20260911_090000_add_finance_rates',
  },
];
