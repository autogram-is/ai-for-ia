import Emittery from 'emittery';

export type ProgressEventData = {
  total: number;
  complete: number;
  errors: number;
  message?: string;
};

/**
 * Standard events for progress functions
 */
export type ProgressEmitterEvents = {
  start: Partial<ProgressEventData> | undefined;
  progress: ProgressEventData;
  complete: ProgressEventData;
};

export class ProgressEmitter<
  Events extends ProgressEmitterEvents = ProgressEmitterEvents,
> extends Emittery<Events> {
  // Nothing to see here, folks, patching around a type definition issue.
  override bindMethods(target: object, methodNames?: readonly string[]) {
    super.bindMethods(target as Record<string, unknown>, methodNames);
  }
}
