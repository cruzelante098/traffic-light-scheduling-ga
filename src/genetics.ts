import {
  BinaryIndividual,
  BitwiseMutationParams,
  NumericIndividual,
  NumericRange,
  OnePointCrossover,
  UniformMutationParams,
} from "genetics-js";

import EvolutionaryAlgorithm, { EvolutionaryAlgorithmParams } from "genetics-js/lib/lib/algorithms/EvolutionaryAlgorithm";
import FitnessFunction from "genetics-js/lib/lib/fitness/FitnessFunction";
import FitnessProportionalSelection, { FitnessProportionalSelectionParams } from "genetics-js/lib/lib/selection/base/FitnessProportionalSelection";
import RouletteWheel from "genetics-js/lib/lib/selection/implementation/RouletteWheel";
import FitnessBased from "genetics-js/lib/lib/selection/replacement/FitnessBased";
import MaxGenerations from "genetics-js/lib/lib/termination/MaxGenerations";
import IntegerGenerator from "genetics-js/lib/lib/generator/numeric/integer/IntegerGenerator";
import IntegerIndividual from "genetics-js/lib/lib/individual/numeric/integer/IntegerIndividual";
import NumericGenerator, { NumericParams } from "genetics-js/lib/lib/generator/numeric/base/NumericGenerator";
import FloatingUniformMutation from "genetics-js/lib/lib/mutation/numeric/floating/FloatingUniformMutation";

import { nativeMath } from "random-js";

import { TLLogic } from "./tl-logic";
import { parseTlLogic, writeTlLogic } from "./xml-io";
import { executeSumo, SumoAggregatedData } from "./executor";
import { genotypeToTlLogic, setOriginalTl } from "./converter";

const originalTl: ReadonlyArray<TLLogic> = parseTlLogic("./assets/anchieta.net.xml");
setOriginalTl(originalTl);

const populationSize = 25;
const mutationRate = 0.5;
const maxGenerations = 10;

const tl = genotypeToTlLogic(new IntegerGenerator().generate(originalTl.reduce((a, b) => a + b.phases.length, 0), new NumericRange(10, 20)));
const networkFilename = writeTlLogic(tl);
//
// const fitnessFunction: FitnessFunction<NumericIndividual, number> = (individual) => {
//   const tl = genotypeToTlLogic(individual);
//   const networkFilename = writeTlLogic(tl);
//
//   // convert tl to somethign writable
//   // create file and write tl into it
//   // pass it to executeSumo
//
//   const statistics: SumoAggregatedData = executeSumo({
//       flags: [
//         "-W",                             // don't log warnings
//         // "--no-step-log",               // don't log step info
//         "--duration-log.statistics",      // log aggregated information about trips
//       ],
//       files: {
//         network: networkFilename,
//         routes: ["./assets/anchieta.rou.xml"],
//         // additional: ['./assets/anchieta_pedestrians.rou.xml']
//       },
//     },
//   );
//
//   // calculate fitness
// };
//
// const params: EvolutionaryAlgorithmParams<IntegerIndividual,
//   number,
//   NumericParams,
//   FitnessProportionalSelectionParams<IntegerIndividual, number>,
//   any,
//   BitwiseMutationParams> = {
//   populationSize: populationSize,
//   generator: new IntegerGenerator(),
//   generatorParams: {
//     engine: nativeMath,
//     length: originalTl.length,
//     range: new NumericRange(4, 90),
//   },
//   selection: new FitnessProportionalSelection(),
//   selectionParams: {
//     engine: nativeMath,
//     selectionCount: populationSize,
//     subSelection: new RouletteWheel(),
//   },
//   crossover: new OnePointCrossover(),
//   crossoverParams: {
//     engine: nativeMath,
//     individualConstructor: BinaryIndividual,
//   },
//   mutation: new FloatingUniformMutation(),
//   mutationParams: {
//     engine: nativeMath,
//     mutationRate: mutationRate,
//   },
//   replacement: new FitnessBased(),
//   replacementParams: {
//     selectionCount: populationSize,
//   },
//   fitnessFunction: fitnessFunction,
//   terminationCondition: new MaxGenerations(maxGenerations),
// };
//
// const evolutionaryAlgorithm =
//   new EvolutionaryAlgorithm<IntegerIndividual, number, NumericParams, any, any, UniformMutationParams>(params);
//
// const elements: any = [];
// evolutionaryAlgorithm.run();
// evolutionaryAlgorithm.population.getFittestIndividualItem()?.individual.genotype.forEach((item, index) => {
//   if (item) {
//     elements.push(items[index]);
//   }
// });
//
// console.log(evolutionaryAlgorithm.population.getFittestIndividualItem());
// console.log(evolutionaryAlgorithm.population.getFittestIndividualItem()?.fitness);
// console.log(elements);
