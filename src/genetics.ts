import { EvolutionaryAlgorithmParams, EvolutionaryAlgorithm } from "@zfunction/genetics-js/lib/algorithms";
import { IntegerIndividual, NumericIndividual, NumericRange } from "@zfunction/genetics-js/lib/individual";
import { NumericParams, IntegerGenerator } from "@zfunction/genetics-js/lib/generator";
import {
  FitnessProportionalSelectionParams,
  FitnessProportionalSelection,
  RouletteWheel,
  FitnessBased,
} from "@zfunction/genetics-js/lib/selection";
import { OnePointCrossoverParams, OnePointCrossover } from "@zfunction/genetics-js/lib/crossover";
import { UniformMutationParams, RandomResetting } from "@zfunction/genetics-js/lib/mutation";
import { MaxGenerations } from "@zfunction/genetics-js/lib/termination";

import { nativeMath } from "random-js";

import fs from "fs";

import { TLLogic } from "./tl-logic";
import { parseTlLogic, writeTlLogic } from "./xml-io";
import { executeSumo, SumoAggregatedData } from "./executor";
import { genotypeToTlLogic, setOriginalTl } from "./converter";
import { FitnessFunction } from "@zfunction/genetics-js";

const originalTl: ReadonlyArray<TLLogic> = parseTlLogic("./assets/anchieta.net.xml");
setOriginalTl(originalTl);

const populationSize = 10;
const mutationRate = 0.1; // 1 / (cantidad total de fases)
const maxGenerations = 100;
let generation = 1;

const fitnessFunction: FitnessFunction<NumericIndividual, number> = (individual) => {
  const tl = genotypeToTlLogic(individual.genotype);
  const networkFilename = writeTlLogic(tl);

  const data: SumoAggregatedData = executeSumo({
      flags: [
        "-W",                             // don't log warnings
        "--no-step-log",               // don't log step info
        "-e 3600",
        "--time-to-teleport -1",
        "--seed 23432",
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
    length: originalTl.reduce((a, b) => a + b.phases.length, 0) + originalTl.length, // the sum if for the offset amount
    range: new NumericRange(4, 120),
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
fs.renameSync(networkFilename, "C:\\Users\\Francisco Cruz\\Desktop\\anchieta_best_candidate.net.xml");
