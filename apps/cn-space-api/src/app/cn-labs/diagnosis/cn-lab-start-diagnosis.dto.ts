import { CnLabWithSpace } from '../cn-lab.entity';

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
 * `unknown` is a third answer and not a flavour of failure: a layer that was probed and could
 * not be reached within its budget has told us nothing, and saying so is different from saying
 * it is broken. It still blocks, because a layer nobody could read is not one to look past.
 *
 * `notProbed` is a fourth and weaker thing: nobody tried. It is what a caller reports for a
 * layer outside what it is allowed or equipped to read, and it must NOT block — a verdict where
 * every probed layer is `ok` is a verdict of `ok`, however many layers went unread. Conflating
 * the two makes a healthy lab report a blocked layer, which is worse than reporting nothing.
 */
export type CnLabStartLayerStatus = 'ok' | 'ko' | 'unknown' | 'notProbed';

/**
 * A diagnosis and the lab it is about.
 *
 * The lab travels with the verdict because a caller reporting the verdict has to name the lab it
 * concerns, and a second read to fetch it would be a second chance for the two to disagree.
 */
export interface CnLabStartDiagnosisResult {
  lab: CnLabWithSpace;
  diagnosis: CnLabStartDiagnosis;
}

export interface CnLabStartLayer {
  status: CnLabStartLayerStatus;
  /** Always set, including on `ok`: "why it is fine" is what tells a reader the probe ran. */
  reason: string;
  /** Layer-specific facts, safe to show: ids, statuses, versions. Never a credential. */
  details?: Record<string, unknown>;
}

export interface CnLabStartDiagnosis {
  layers: Record<CnLabStartLayerName, CnLabStartLayer>;
  /** The first blocked layer in start order, or null when nothing probed is blocking. */
  blockedAtLayer: CnLabStartLayerName | null;
  /** True when at least one layer was probed and answered nothing. */
  hasUnknownLayer: boolean;
  /** Layers nobody tried to read, so a reader knows how partial the verdict is. */
  notProbedLayers: CnLabStartLayerName[];
}

/**
 * The first blocked layer in start order, which is the layer the start is stuck at.
 *
 * `notProbed` layers are stepped over rather than blamed. That does mean the answer can name a
 * layer while an earlier one went unread — which is exactly what a partial read knows, and the
 * skipped layer says so in its own reason.
 */
export function cnBlockedAtLayer(
  layers: Record<CnLabStartLayerName, CnLabStartLayer>
): CnLabStartLayerName | null {
  return (
    CN_LAB_START_LAYER_ORDER.find(
      (name) => layers[name].status !== 'ok' && layers[name].status !== 'notProbed'
    ) ?? null
  );
}
