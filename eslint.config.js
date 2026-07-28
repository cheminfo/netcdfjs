import { defineConfig, globalIgnores } from 'eslint/config';
import cheminfo from 'eslint-config-cheminfo-typescript';

export default defineConfig(
  globalIgnores(['coverage', 'dist', 'lib']),
  cheminfo,
  // The demo is a script whose whole purpose is to print to the terminal.
  { files: ['demo/**'], rules: { 'no-console': 'off' } },
);
