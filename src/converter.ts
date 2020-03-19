import { TLLogic } from "./tl-logic";
import _ from "lodash";
import NumericIndividual from "genetics-js/lib/lib/individual/numeric/base/NumericIndividual";

let originalTl: ReadonlyArray<TLLogic> | undefined = undefined;

export function setOriginalTl(tl: ReadonlyArray<TLLogic>) {
  originalTl = tl;
}

export function genotypeToTlLogic(genotype: NumericIndividual): TLLogic[] {
  if (originalTl === undefined) {
    throw "OriginalTl needs to be asigned first";
  }

  const tlArray: TLLogic[] = _.cloneDeep(originalTl) as TLLogic[];
  let i = 0;
  for (const tl of tlArray) {
    for (const phase of tl.phases) {
      phase.duration = genotype.get(i);
      i++;
    }
  }

  return tlArray;
}

export function tlLogicToGenotype(tlArray: ReadonlyArray<TLLogic>): number[] {
  const individuals = [];
  for (const tl of tlArray) {
    for (const phase of tl.phases) {
      individuals.push(phase.duration);
    }
  }
  return individuals;
}
