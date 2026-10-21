import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { maestroPlan } from './maestro-plan.ts';

const ready = {
  flowExists: true,
  maestroInstalled: true,
  adbInstalled: true,
  deviceOnline: true,
};

describe('maestroPlan', () => {
  it('runs when the flow, CLI, adb, and an emulator are available', () => {
    assert.equal(maestroPlan(ready), 'run');
  });

  it('skips the device launch until the emulator is online', () => {
    assert.equal(maestroPlan({ ...ready, deviceOnline: false }), 'skip');
    assert.equal(maestroPlan({ ...ready, maestroInstalled: false }), 'skip');
    assert.equal(maestroPlan({ ...ready, adbInstalled: false }), 'skip');
  });

  it('fails when the flow file is missing', () => {
    assert.equal(maestroPlan({ ...ready, flowExists: false }), 'missing-flow');
  });
});
