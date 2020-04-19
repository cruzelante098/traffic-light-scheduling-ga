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
import yargs from "yargs";

import { TLLogic } from "./tl-logic";
import { parseTlLogic, writeTlLogic } from "./xml-io";
import { executeSumo, SumoAggregatedData } from "./executor";
import { genotypeToTlLogic, setOriginalTl } from "./converter";

/**
 * Program arguments and flags.
 */
const argv = yargs
  .usage("$0 -n <netfile> -r <routefile> [-p] [-s <savepath>]")
  .help()
  .options({
    p: {
      type: "boolean",
      alias: "play",
      demandOption: false,
      description: "Executes simulation after evolutive alg. ends",
    },
    n: {
      type: "string",
      alias: "network",
      demandOption: true,
      description: "Network file",
    },
    r: {
      type: "string",
      alias: "routes",
      demandOption: true,
      description: "Route file",
      array: true,
    },
    s: {
      type: "string",
      alias: "save",
      demandOption: true,
      description: "Filepath to save best network candidate",
    },
  })
  .argv;

// Since all this arguments are mandatory they won't be undefined, but typescript doesn't know this,
// so usage of ! operator is required
const netFilepath = argv.n!;
const routesFilepath = argv.r!;
const saveFilepath = argv.s!;

// Reads and parses network file
const originalTl: ReadonlyArray<TLLogic> = parseTlLogic(netFilepath);

// The reason I made this is because originalTL contains the original data of the traffic light system
// (phases config and such) and this information is never modified in the evolutionary algorithm. The thing is
// I need that information to generate the new file that will contain the solution generated thanks to the
// EA, and the only values that change are durations and offsets, but not the phase config. That's why
// is set only once, so I don't need to call every time genotypeToTlLogic() with this argument.
setOriginalTl(originalTl);

// TODO: This should be program arguments
const maxGenerations = 1;
const populationSize = 2;

// TODO: this value should be 1 / (amount of phases and offsets), though more investigation is needed.
// maybe consider it as an argument?
const mutationRate = 1;

// Used to print info about what individual and generation is being executed.
let iteration = 0;

/**
 * Calculates the fitness value of the individual.
 * @param individual is a NumericIndividual, meaning it's just an array of numbers. The individual is composed
 * of phase durations and offsets. Both values are indistinguishable from each other, the only way to know which
 * is which is to know the original order they are arranged in originalTl.
 */
const fitnessFunction: FitnessFunction<NumericIndividual, number> = (individual) => {
  // First, convert the number array to an array of TLLogic objects
  const tl = genotypeToTlLogic(individual.genotype);
  // We write that array to a temporal file, with the only purpose of using it as an argument to SUMO
  const networkFilename = writeTlLogic(tl);

  // this will execute a simulation and return a SumoAggregatedData object, that contains
  // info about how the simulation went
  const data: SumoAggregatedData = executeSumo({
      flags: [
        "--no-warnings",                        // don't log warnings
        "--no-step-log",                        // don't log step info
        "--end 3600",                           // simulation end time
        "--time-to-teleport -1",                // disable teleports
        "--seed 23432",                         // define seed
        "--duration-log.statistics",            // log aggregated information about trips
        "--tripinfo-output.write-unfinished",   // include info about vehicles that don't reach their destination
      ],
      files: {
        network: networkFilename,
        routes: routesFilepath,
        // additional: ['./assets/anchieta_pedestrians.rou.xml']
      },
    },
  );

  const {vehicles, statistics, performance} = data;

  // At the end, the fitness function is
  //
  //                                  (vehicles that reached their destination)^2
  //    ------------------------------------------------------------------------------------------------------------------
  //    avg travel duration + avg time car is not moving + (vehicles that didn't reach their destination) * simulated time

  const maximize = Math.pow(vehicles.inserted - (vehicles.running + vehicles.waiting), 2); // vehicles that completed their travel
  const minimize = statistics.duration + statistics.timeLoss +
    (vehicles.running + vehicles.waiting) * ((performance.duration / 1000) * performance.realTimeFactor);

  // We are interested in maximizing the numerator and reducing the denominator for obvious reasons.
  const fitness = maximize / minimize;

  // This is only to show info about what individual/generation are we simulating
  const generation = Math.floor(iteration / populationSize);
  const indivudual = Math.abs(populationSize * generation - iteration) + 1;
  console.log(`FITNESS: Gen ${generation}, Ind ${indivudual}: ${fitness}\n`);
  iteration++;

  return fitness;
};

// This gigantic object is just the EA configuration. Bunch of types and objects. For reference
// see Abrante's Dissertation on the subject at https://riull.ull.es/xmlui/handle/915/14535
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
    range: new NumericRange(4, 120), // range the duration values will be generated
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
    particularValue: (index: number) => {
      if (doesPhaseContainsYellow(index)) {
        return 4; // yellow duration
      } else {
        return undefined;
      }
    },
  },
  replacement: new FitnessBased(),
  replacementParams: {
    selectionCount: populationSize,
  },
  fitnessFunction: fitnessFunction,
  terminationCondition: new MaxGenerations(maxGenerations),
};


function doesPhaseContainsYellow(index: number): boolean {
  const tlSizes = originalTl.map(tl => tl.size);
  let tlPos = 0;

  while (index >= 0) {
    if ((index + 1) - tlSizes[tlPos] <= 0) {
      break;
    }
    index -= tlSizes[tlPos];
    tlPos++;
  }

  if (index === 0) { // offset values are always at the start of the array, then the phase durations
    return false;
  } else { // phase duration
    const phase = originalTl[tlPos].phases[index - 1];
    return phase.state.includes("y");
  }
}

const evolutionaryAlgorithm =
  new EvolutionaryAlgorithm<IntegerIndividual,
    number,
    NumericParams,
    FitnessProportionalSelectionParams<IntegerIndividual, number>,
    OnePointCrossoverParams<IntegerIndividual, number>,
    UniformMutationParams>
  (params);

// Finally executes the EA
evolutionaryAlgorithm.run();

// Once the EA it's done, get the fittest individual
const fittest = evolutionaryAlgorithm.population.getFittestIndividualItem()?.individual;

if (fittest === undefined) {
  throw "Not fittest individual found";
}

// Convert the array of numbers that is the individual to a network file recognizable by SUMO
const tl = genotypeToTlLogic(fittest);
const networkFilename = writeTlLogic(tl);

// Copy that file to the location the used specified
fs.renameSync(networkFilename, saveFilepath);

console.log("Fittest candidate located at ", saveFilepath);
console.log("Best fitness achieved", evolutionaryAlgorithm.population.getFittestIndividualItem()?.fitness);

// If the flag is provided, SUMO-GUI will be executed with the fittest solution to see how it behaves
if (argv.play) {
  console.log("\nExecuting simulation");
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
        network: `"${saveFilepath}"`,
        routes: routesFilepath,
        // additional: ['./assets/anchieta_pedestrians.rou.xml']
      },
    },
  );
}
