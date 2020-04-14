import {
  EvolutionaryAlgorithm,
  EvolutionaryAlgorithmParams,
  FitnessBased,
  FitnessFunction,
  FitnessProportionalSelection,
  FitnessProportionalSelectionParams,
  IntegerGenerator,
  IntegerIndividual,
  MaxGenerations,
  NumericIndividual,
  NumericParams,
  NumericRange,
  OnePointCrossover,
  OnePointCrossoverParams,
  RandomResetting,
  RouletteWheel,
  UniformMutationParams,
} from "@zfunction/genetics-js";

import { nativeMath } from "random-js";

import fs from "fs";
import path from "path";
import os from "os";
import readline from "readline";

import { TLLogic } from "./tl-logic";
import { parseTlLogic, writeTlLogic } from "./xml-io";
import { executeSumo, SumoAggregatedData } from "./executor";
import { genotypeToTlLogic, setOriginalTl } from "./converter";

const originalTl: ReadonlyArray<TLLogic> = parseTlLogic("./assets/anchieta.net.xml");
setOriginalTl(originalTl);

const populationSize = 2;
const mutationRate = 0.1; // TODO: 1 / (cantidad total de fases)
const maxGenerations = 1;

let iteration = 0;

const fitnessFunction: FitnessFunction<NumericIndividual, number> = (individual) => {
  const tl = genotypeToTlLogic(individual.genotype);
  const networkFilename = writeTlLogic(tl);

  const data: SumoAggregatedData = executeSumo({
      flags: [
        "--no-warnings",                        // don't log warnings
        "--no-step-log",                        // don't log step info
        "--end 500",                          // simulation end time
        "--time-to-teleport -1",                // disable teleports
        "--seed 23432",                         // define seed
        "--duration-log.statistics",            // log aggregated information about trips
        "--tripinfo-output.write-unfinished",   // include info about vehicles that don't reach their destination
      ],
      files: {
        network: networkFilename,
        routes: ["./assets/anchieta.rou.xml"],
        // additional: ['./assets/anchieta_pedestrians.rou.xml']
      },
    },
  );

  const {vehicles, statistics, performance} = data;

  const maximize = Math.pow(vehicles.inserted - (vehicles.running + vehicles.waiting), 2); // vehicles that completed their travel
  const minimize = statistics.duration + statistics.timeLoss +
    vehicles.running + vehicles.waiting * performance.realTimeFactor;

  const fitness = maximize/minimize;

  const generation = Math.floor(iteration / populationSize);
  const indivudual = Math.abs(populationSize * generation - iteration) + 1;

  console.log(`FITNESS: Gen ${generation}, Ind ${indivudual}: ${fitness}\n`);

  iteration++;
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
    length: originalTl.reduce((a, b) => a + b.phases.length, 0) + originalTl.length, // total phases + offset of every traffic light
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
  throw "Not fittest individual found";
}

const tl = genotypeToTlLogic(fittest);
const networkFilename = writeTlLogic(tl);
const bestCandidateFilepath = path.join(os.homedir(), "Desktop/anchieta_best_candidate.net.xml");

fs.renameSync(networkFilename, bestCandidateFilepath);

console.log("Fittest candidate located at ", bestCandidateFilepath);
console.log("Best fitness achieved", evolutionaryAlgorithm.population.getFittestIndividualItem()?.fitness);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question("\nWould you like to see the simulation? (y/n)", (answer => {
  rl.close();
  if(answer === "y" || answer === "Y") {
    executeSumo({
        command_name: "sumo-gui",
        flags: [
          "--no-warnings",                        // don't log warnings
          "--no-step-log",                        // don't log step info
          "--time-to-teleport -1",                // disable teleports
          "--seed 23432",                         // define seed
          "--duration-log.statistics",            // log aggregated information about trips
          "--tripinfo-output.write-unfinished",   // include info about vehicles that don't reach their destination
        ],
        files: {
          network: '"' + bestCandidateFilepath + '"',
          routes: ["./assets/anchieta.rou.xml"],
          // additional: ['./assets/anchieta_pedestrians.rou.xml']
        },
      },
    );
  }
}));
