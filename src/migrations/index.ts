import * as migration_20260823_150027_initial from './20260823_150027_initial';

export const migrations = [
  {
    up: migration_20260823_150027_initial.up,
    down: migration_20260823_150027_initial.down,
    name: '20260823_150027_initial'
  },
];
