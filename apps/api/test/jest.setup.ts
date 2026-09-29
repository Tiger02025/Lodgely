import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../.env') });

process.env.NODE_ENV = process.env.NODE_ENV || 'test';
