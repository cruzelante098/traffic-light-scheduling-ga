import {
  NumericIndividual,
  NumericRange,
  OnePointCrossover,
  OnePointCrossoverParams,
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
import { NumericParams } from "genetics-js/lib/lib/generator/numeric/base/NumericGenerator";

import { nativeMath } from "random-js";

import fs from "fs";

import { TLLogic } from "./tl-logic";
import { parseTlLogic, writeTlLogic } from "./xml-io";
import { executeSumo, SumoAggregatedData } from "./executor";
import { genotypeToTlLogic, setOriginalTl } from "./converter";
import RandomResetting from "genetics-js/lib/lib/mutation/numeric/integer/RandomResetting";

const originalTl: ReadonlyArray<TLLogic> = parseTlLogic("./assets/anchieta.net.xml");
setOriginalTl(originalTl);

const populationSize = 2;
const mutationRate = 0.5;
const maxGenerations = 5;
let generation = 1;

const fitnessFunction: FitnessFunction<NumericIndividual, number> = (individual) => {
  const tl = genotypeToTlLogic(individual);
  const networkFilename = writeTlLogic(tl);

  const data: SumoAggregatedData = executeSumo({
      flags: [
        "-W",                             // don't log warnings
        // "--no-step-log",               // don't log step info
        "--duration-log.statistics",      // log aggregated information about trips
      ],
      files: {
        network: networkFilename,
        routes: ["./assets/anchieta.rou.xml"],
        // additional: ['./assets/anchieta_pedestrians.rou.xml']
      },
    },
  );

  const fitness = -data.statistics.duration;
  console.log(`Fitness achieved at gen ${generation++}: ${fitness}`);
  return fitness;
};

const params: EvolutionaryAlgorithmParams<IntegerIndividual,
  number,
  NumericParams,
  FitnessProportionalSelectionParams<IntegerIndividual, number>,
  OnePointCrossoverParams<IntegerIndividual, number>,
  UniformMutationParams> = {
  populationSize: populationSize,
  generator: new IntegerGenerator(),
  generatorParams: {
    engine: nativeMath,
    length: originalTl.reduce((a, b) => a + b.phases.length, 0),
    range: new NumericRange(4, 90),
  },
  selection: new FitnessProportionalSelection(),
  selectionParams: {
    engine: nativeMath,
    selectionCount: populationSize,
    subSelection: new RouletteWheel(),
  },
  crossover: new OnePointCrossover(),
  crossoverParams: {
    engine: nativeMath,
    individualConstructor: IntegerIndividual,
  },
  mutation: new RandomResetting(),
  mutationParams: {
    engine: nativeMath,
    mutationRate: mutationRate,
  },
  replacement: new FitnessBased(),
  replacementParams: {
    selectionCount: populationSize,
  },
  fitnessFunction: fitnessFunction,
  terminationCondition: new MaxGenerations(maxGenerations),
};

const evolutionaryAlgorithm =
  new EvolutionaryAlgorithm<IntegerIndividual,
    number,
    NumericParams,
    FitnessProportionalSelectionParams<IntegerIndividual, number>,
    OnePointCrossoverParams<IntegerIndividual, number>,
    UniformMutationParams>
  (params);

evolutionaryAlgorithm.run();

const fittest = evolutionaryAlgorithm.population.getFittestIndividualItem()?.individual;
if (fittest === undefined) {
  throw "Not fittest";
}
const tl = genotypeToTlLogic(fittest);
const networkFilename = writeTlLogic(tl);
console.log(networkFilename);
fs.renameSync(networkFilename, "C:\\Users\\Francisco Cruz\\Desktop\\hola.net.xml");
