#!/usr/bin/env node
import { main } from '../scripts/main.js';

const code = await main();
process.exit(code ?? 0);
