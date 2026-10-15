// Deterministic local guard logic for the SnapCage demo.
// No network, no model, no real tool execution. Pure functions only.

import { formatTraceId } from '../data/mockData.js';

let eventSeq = 1;

export function nextEventId() {
  return `evt-${eventSeq++}-${Date.now()}`;
}

export function buildTraceId(counter) {
  return formatTraceId(counter);
}

/**
 * Build a full decision record from a scenario definition.
 * Deterministic: outcome comes straight from the scenario fixture.
 */
export function buildDecision({ scenario, traceNumber, startedAt, reviewedBy = null }) {
  const traceId = buildTraceId(traceNumber);
  return {
    traceId,
    traceNumber,
    scenarioId: scenario.id,
    scenarioKey: scenario.key,
    scenarioName: scenario.title,
    action: scenario.action,
    tool: scenario.tool,
    args: scenario.args,
    agent: scenario.agent,
    riskLevel: scenario.riskLevel,
    decision: scenario.decision,
    explanation: scenario.decisionExplanation,
    enforcement: scenario.enforcement,
    enforcementShort: scenario.enforcementShort,
    targetResource: scenario.targetResource,
    intendedEffect: scenario.intendedEffect,
    requestSummary: scenario.requestSummary,
    riskContext: scenario.riskContext,
    untrustedSource: scenario.untrustedSource || null,
    pipeline: scenario.pipeline,
    policyChecks: scenario.policyChecks,
    snapAssessment: scenario.snapAssessment,
    simulatedLatencyMs: scenario.simulatedLatencyMs,
    startedAt,
    completedAt: new Date(),
    reviewStatus: scenario.decision === 'APPROVAL REQUIRED' ? 'PENDING' : 'NOT_REQUIRED',
    reviewedBy,
    reviewedAt: null,
    reviewNote: null,
  };
}

/** Map a pipeline step index to an event type/status for the live stream. */
export function pipelineStepToEvent({ decision, stepIndex, step }) {
  const label = step.label.toLowerCase();
  let type = 'system';
  let status = 'info';
  if (label.includes('request') || label.includes('user request') || label.includes('propos')) type = 'agent';
  else if (label.includes('intercept')) { type = 'interception'; status = 'pending'; }
  else if (label.includes('policy') || label.includes('permission') || label.includes('violation') || label.includes('resource')) {
    type = 'policy';
    status = decision.decision === 'BLOCK' && label.includes('violation') ? 'block' : 'pending';
  } else if (label.includes('snap')) { type = 'snap'; status = 'pending'; }
  else if (label.includes('final decision')) {
    type = 'decision';
    status = decision.decision === 'ALLOW' ? 'allow' : decision.decision === 'BLOCK' ? 'block' : 'review';
  } else if (label.includes('enforcement')) {
    type = 'enforcement';
    status = decision.decision === 'ALLOW' ? 'allow' : decision.decision === 'BLOCK' ? 'block' : 'review';
  }
  if (label.includes('untrusted') || label.includes('encounter')) type = 'agent';
  void stepIndex;
  return { type, status };
}

export function buildAuditRecord(decision) {
  const fails = decision.policyChecks.filter((c) => c.result === 'FAIL').length;
  const policyResult =
    decision.decision === 'ALLOW'
      ? 'PASS'
      : decision.decision === 'BLOCK'
        ? `FAIL (${fails} check${fails === 1 ? '' : 's'} failed)`
        : `REVIEW (${fails} check${fails === 1 ? '' : 's'} gating)`;
  return {
    traceId: decision.traceId,
    timestamp: decision.completedAt,
    scenario: decision.scenarioName,
    scenarioId: decision.scenarioId,
    tool: decision.tool,
    action: decision.action,
    args: decision.args,
    riskLevel: decision.riskLevel,
    policyResult,
    snapStatus: `Simulated — ${decision.snapAssessment.riskLevel}`,
    decision: decision.decision,
    enforcement: decision.enforcementShort,
    reviewStatus: decision.reviewStatus,
  };
}

export function policyResultTone(result) {
  if (result === 'PASS') return 'allow';
  if (result === 'FAIL') return 'block';
  return 'muted';
}
