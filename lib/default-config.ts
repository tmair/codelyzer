import {dirname, join} from 'path';

const dir = dirname(module.id);

export const DEFAULT_REPORTERS_DIR = join(dir, 'reporters');
export const DEFAULT_FORMATTERS_DIR = join(dir, 'formatters');
export const DEFAULT_RULES_DIR = join(dir, 'rules');

export const DEFAULT_REPORTER = 'default';
export const DEFAULT_FORMATTER = 'compact';

