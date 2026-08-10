/**
 * The layers a cloud lab passes through on its way up, and the verdict of each.
 *
 * Starting a cloud lab crosses six independent systems, each of which can fail on its own.
 * Knowing which one is stuck is what makes the difference between reading the right logs and
 * reading container logs on a server whose volume was never attached. The ordering encoded
 * in {@link CN_LAB_START_LAYER_ORDER} is the whole value of this type: it is the knowledge
 * that otherwise lives only in the heads of the people who wrote the start sequence.
 */
export type CnLabStartLayerName = 'spaceDb' | 'cloud' | 'dns' | 'ssh' | 'labManager' | 'glab';

/**
 * The layers in the order a start crosses them.
 *
 * `blockedAtLayer` is the first one that is not `ok` in this order, so the order is what
 * decides which of several failing layers is reported as the cause. Later layers cannot work
 * while an earlier one is down, and their failure is a consequence, not a diagnosis.
 */
export const CN_LAB_START_LAYER_ORDER: CnLabStartLayerName[] = [
  'spaceDb',
  'cloud',
  'dns',
  'ssh',
  'labManager',
  'glab',
];

/**
 * `unknown` is a third answer and not a flavour of failure: a layer that could not be
 * reached within its budget has told us nothing, and saying so is different from saying it is
 * broken. It still counts as "not ok" for `blockedAtLayer`, because a layer nobody could read
 * is not a layer anyone should look past.
 */
export type CnLabStartLayerStatus = 'ok' | 'ko' | 'unknown';

export interface CnLabStartLayer {
  status: CnLabStartLayerStatus;
  /** Always set, including on `ok`: "why it is fine" is what tells a reader the probe ran. */
  reason: string;
  /** Layer-specific facts, safe to show: ids, statuses, versions. Never a credential. */
  details?: Record<string, unknown>;
}

export interface CnLabStartDiagnosis {
  layers: Record<CnLabStartLayerName, CnLabStartLayer>;
  /** The first layer that is not `ok`, or null when every layer answered `ok`. */
  blockedAtLayer: CnLabStartLayerName | null;
  /** True when at least one layer answered nothing, so the verdict rests on partial reads. */
  hasUnknownLayer: boolean;
}

/** The first non-`ok` layer in start order, which is the layer the start is blocked at. */
export function cnBlockedAtLayer(
  layers: Record<CnLabStartLayerName, CnLabStartLayer>
): CnLabStartLayerName | null {
  return CN_LAB_START_LAYER_ORDER.find((name) => layers[name].status !== 'ok') ?? null;
}
