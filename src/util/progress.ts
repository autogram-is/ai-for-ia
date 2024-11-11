import { MultiBar, SingleBar } from 'cli-progress';

/**
 * Example: 'progress [{bar}] {percentage}% | ETA: {eta}s | {value}/{total}'
 *
 * {bar} - the progress bar, customizable by the options barsize, barCompleteString and barIncompleteString
 * {percentage} - the current progress in percent (0-100)
 * {total} - the end value
 * {value} - the current value set by last update() call
 * {eta} -  expected time of accomplishment in seconds (limited to 115days, otherwise INF is displayed)
 * {duration} - elapsed time in seconds
 * {eta_formatted} - expected time of accomplishment formatted into appropriate units
 * {duration_formatted} - elapsed time formatted into appropriate units
 */

export const overviewPreset = {
  format: '\u001b[90m{bar}\u001b[0m {percentage}% | ETA: {eta_formatted}',
  barCompleteChar: '\u2588',
  barIncompleteChar: '\u2591',
};

export const progressPreset = {
  format:
    '\u001b[90m{bar}\u001b[0m {percentage}% | {model} - {duration_formatted}',
  barCompleteChar: '\u2588',
  barIncompleteChar: '\u2591',
};

const defaults = {
  hideCursor: true,
  fps: 10,
  etaAsynchronousUpdate: true,
  etaBuffer: 10,
  clearOnComplete: false,
  gracefulExit: true,
  stopOnComplete: true,
};

export function singleProgress(message?: string) {
  return new SingleBar(defaults, progressPreset);
}

export function multiProgress(message?: string) {
  return new MultiBar(defaults, overviewPreset);
}
