import type { ResponseFrame } from '@/nerve/L13_response_types';

const paint = (hex: string, text: string): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `\x1b[38;2;${r};${g};${b}m${text}\x1b[0m`;
};

const colorForUrgency = (urgency: ResponseFrame['intents'][number]['urgency']): string => {
  switch (urgency) {
    case 'low':
      return '#22c55e';
    case 'normal':
      return '#0ea5e9';
    case 'high':
      return '#eab308';
    case 'critical':
    default:
      return '#ef4444';
  }
};

export const renderResponseFrame = (frame: ResponseFrame): void => {
  console.log('\n=== L13: Response Frame ===');
  console.log(`time         : ${new Date(frame.timestamp).toISOString()}`);
  console.log(`stage        : ${frame.stage}`);
  if (typeof frame.overloadRisk === 'number') {
    console.log(`overloadRisk : ${frame.overloadRisk.toFixed(2)}`);
  }
  if (typeof frame.harmonyIndex === 'number') {
    console.log(`harmonyIndex : ${frame.harmonyIndex.toFixed(2)}`);
  }
  if (frame.growthMode) {
    console.log(`growthMode   : ${frame.growthMode}`);
  }

  if (!frame.intents.length) {
    console.log('intents      : (none)');
    return;
  }

  console.log(`intents (${frame.intents.length}):`);
  for (const intent of frame.intents) {
    const urgencyColor = colorForUrgency(intent.urgency);
    console.log(
      `  - [${intent.scope}] ${intent.kind} ` +
        `(urg=${paint(urgencyColor, intent.urgency)}, str=${intent.strength}, conf=${intent.confidence.toFixed(
          2,
        )}, reason=${intent.reasonKey})`,
    );
  }
};
