import { DriveMode } from './drive.js';
import { CraneMode } from './crane.js';
import { SignalMode } from './signal.js';
import { InspectMode } from './inspect.js';
import { EvacMode } from './evac.js';

const MODES = { drive: DriveMode, crane: CraneMode, signal: SignalMode, inspect: InspectMode, evac: EvacMode };
export function createMode(role, ctx) { return new MODES[role.mode](ctx, role); }
