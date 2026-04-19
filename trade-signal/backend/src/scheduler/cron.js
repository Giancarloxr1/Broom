// src/scheduler/cron.js - Avvio node-cron + trigger manuale scan
import cron from 'node-cron';
import { config } from '../config.js';
import { logger } from '../utils/logger.js';
import { runScanCycle } from './jobRunner.js';

let task = null;
let running = false;

async function safeRun(reason = 'tick') {
  if (running) {
    logger.warn(`Scan in corso, skip ${reason}`);
    return 0;
  }
  running = true;
  try {
    logger.info(`Scan avviato (${reason})`);
    const n = await runScanCycle();
    return n;
  } catch (err) {
    logger.error('Scan error:', err.message);
    return -1;
  } finally {
    running = false;
  }
}

export function startScheduler() {
  const expr = config.scanCron;
  if (!cron.validate(expr)) {
    logger.error(`Cron espressione non valida: ${expr}. Scheduler non avviato.`);
    return null;
  }
  if (task) return task;
  task = cron.schedule(expr, () => { safeRun('cron'); });
  logger.info(`Scheduler avviato: cron='${expr}'`);
  return task;
}

export function stopScheduler() {
  if (task) {
    task.stop();
    task = null;
    logger.info('Scheduler fermato');
  }
}

export async function triggerScan() {
  return safeRun('manual');
}

export function isRunning() { return running; }

export default { startScheduler, stopScheduler, triggerScan, isRunning };
