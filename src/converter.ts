import { TLLogic } from "./tl-logic";
import _ from "lodash";
import { NumericIndividual } from "@zfunction/genetics-js";

// The reason this is a static variable is is due to the fact that I find it more
// comfortable to assign it once at the start and remember it, so that every time I call
// genotypeToTlLogic() I don't need to pass it as an argument.
let originalTl: ReadonlyArray<TLLogic> | undefined = undefined;

export function setOriginalTl(tl: ReadonlyArray<TLLogic>) {
  originalTl = tl;
}

export function genotypeToTlLogic(genotype: NumericIndividual | number[]): TLLogic[] {
  if (originalTl === undefined) {
    throw "OriginalTl needs to be asigned first";
  }

  const tlArray: TLLogic[] = _.cloneDeep(originalTl) as TLLogic[];
  let i = 0;

  for (const tl of tlArray) {
    if (genotype instanceof NumericIndividual) {
      tl.offset = genotype.get(i);
    } else {
      tl.offset = genotype[i];
    }
    i++;

    for (const phase of tl.phases) {
      if (genotype instanceof NumericIndividual) {
        phase.duration = genotype.get(i);
      } else {
        phase.duration = genotype[i];
      }

      i++;
    }
  }

  return tlArray;
}

export function tlLogicToGenotype(tlArray: ReadonlyArray<TLLogic>): number[] {
  const individuals = [];
  for (const tl of tlArray) {
    individuals.push(tl.offset);
    for (const phase of tl.phases) {
      individuals.push(phase.duration);
    }
  }
  return individuals;
}
