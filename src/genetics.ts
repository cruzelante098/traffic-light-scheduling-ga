import {
  Crossover,
  CrossoverParams,
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
  RouletteWheel, UniformCrossover, UniformCrossoverParams,
  UniformMutationParams,
} from "@zfunction/genetics-js";

import { nativeMath } from "random-js";

import fs from "fs";
import yargs from "yargs";

import { TLLogic } from "./tl-logic";
import { parseTlLogic, writeTlLogic } from "./xml-io";
import { executeSumo, SumoAggregatedData } from "./executor";
import { genotypeToTlLogic, setOriginalTl } from "./converter";
import path from "path";
import c from "chalk";

console.time("execution");

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
    c: {
      type: "string",
      alias: "crossover",
      demandOption: true,
      description: "Type of crossover to employ",
    },
    i: {
      type: "number",
      alias: "population",
      demandOption: true,
      description: "Size of the population",
    },
    g: {
      type: "boolean",
      alias: "savegenotype",
      demandOption: false,
      description: "Saves genotype instead of net.xml",
    },
  })
  .argv;

// Since all this arguments are mandatory they won't be undefined, but typescript doesn't know this,
// so usage of ! operator is required
const netFilepath = argv.n!;
const routesFilepath = argv.r!;
const saveFilepath = argv.s!;
const crossoverStr = argv.c!;
const populationSize = Number(argv.i!);
const saveGenotype = argv.g!;

// Reads and parses network file
const originalTl: ReadonlyArray<TLLogic> = parseTlLogic(netFilepath);

// The reason I made this is because originalTL contains the original data of the traffic light system
// (phases config and such) and this information is never modified in the evolutionary algorithm. The thing is
// I need that information to generate the new file that will contain the solution generated thanks to the
// EA, and the only values that change are durations and offsets, but not the phase config. That's why
// is set only once, so I don't need to call every time genotypeToTlLogic() with this argument.
setOriginalTl(originalTl);

// TODO: This should be program arguments
const maxGenerations = 10;

const genotypeLength = originalTl.reduce((a, b) => a + b.phases.length, 0) + originalTl.length; // total phases + offset of every traffic light

// TODO: this value should be 1 / (amount of phases and offsets), though more investigation is needed.
// maybe consider it as an argument?
const mutationRate = 1 / genotypeLength;

const yellowPhaseDuration = 4;

// Used to print info about what individual and generation is being executed.
let iteration = 0;


interface ExecutionInfo {
  execution: number,
  generations: Array<Array<{
      id: number;
      fitness: number;
      genotype: number[]
    }>
  >
}

const executionInfo: ExecutionInfo = {
  execution: Number(path.basename(saveFilepath).substr(4)),
  generations: [],
};

for(let i = 0; i <= populationSize; i++) {
  executionInfo.generations.push([]);
}

const execution = Number(path.basename(saveFilepath).slice(4));
// const seed = [4189, 79840, 52441, 7109, 632754, 74180369, 87496, 1634, 963, 4561]
const seed = Math.floor(Math.random() * (1000000 - 1000) + 1000);

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
        "--end 1800",                           // simulation end time
        "--time-to-teleport 120",                // disable teleports
        `--seed ${seed}`,                         // define seed
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
  const individualNumber = Math.abs(populationSize * generation - iteration) + 1;
  console.log(`FITNESS: Gen ${generation}, Ind ${individualNumber}: ${fitness}\n`);
  iteration++;

  if (saveGenotype && (generation % 5 === 0)) {
    executionInfo.generations[generation].push({
      id: generation,
      fitness: fitness as number,
      genotype: individual.genotype,
    });
  }

  return fitness;
};

let crossover: Crossover<IntegerIndividual, number, CrossoverParams<IntegerIndividual, number>>;
if (crossoverStr === "UniformCrossover") {
  crossover = new UniformCrossover();
} else if (crossoverStr === "OnePointCrossover") {
  crossover = new OnePointCrossover();
} else {
  throw new Error("Crossover type not recognized");
}

// This gigantic object is just the EA configuration. Bunch of types and objects. For reference
// see Abrante's Dissertation on the subject at https://riull.ull.es/xmlui/handle/915/14535
const params: EvolutionaryAlgorithmParams<IntegerIndividual,
  number,
  NumericParams,
  FitnessProportionalSelectionParams<IntegerIndividual, number>,
  UniformCrossoverParams<IntegerIndividual, number>,
  UniformMutationParams> = {
  populationSize: populationSize,
  generator: new IntegerGenerator(),
  generatorParams: {
    engine: nativeMath,
    length: originalTl.reduce((a, b) => a + b.phases.length, 0) + originalTl.length, // total phases + offset of every traffic light
    range: new NumericRange(10, 120), // range the duration values will be generated
    particularValue: (index: number) => {
      if (doesPhaseContainsYellow(index)) {
        return yellowPhaseDuration;
      } else {
        return undefined;
      }
    },
  },
  selection: new FitnessProportionalSelection(),
  selectionParams: {
    engine: nativeMath,
    selectionCount: populationSize,
    subSelection: new RouletteWheel(),
  },
  crossover: crossover,
  crossoverParams: {
    engine: nativeMath,
    individualConstructor: IntegerIndividual,
    // @ts-ignore
    selectionThreshold: 0.5,
  },
  mutation: new RandomResetting(),
  mutationParams: {
    engine: nativeMath,
    mutationRate: mutationRate,
    particularValue: (index: number) => {
      if (doesPhaseContainsYellow(index)) {
        return yellowPhaseDuration;
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

/*
 * Provided an index of a NumericIndividual, is capable of detecting whether that index refer to an offset
 * or a phase duration. Then, if the index refers to a phase, the function returns whether that phase
 * contains a yellow traffic light.
 */
function doesPhaseContainsYellow(index: number): boolean {
  // tlSize = TL offset + amount of phases
  const tlSizes = originalTl.map(tl => tl.size);

  // what traffic light junction "index" refers to
  let tlPos = 0;

  // Let's say we have the next TLLogic[] that we have converted into a NumericIndividual (array of numbers)
  //                              [10, 60, 4, 70, 4, 5, 80, 4, 50, 4]
  // where                        |   TLLogic[0]  |, |  TLLogic[1]  |

  while (index >= 0) {
    if ((index + 1) - tlSizes[tlPos] <= 0) {
      // In this case, "index" refers to an unknown element located at TLLogic[tlPos].

      // TLLogic[tlPos] have one offset and several phases. They are indistinguishable in NumericIndividual,
      // given that they are just numbers. However, we know that the first element of every TLLogic is the offset,
      // the rest are phase durations.

      // In this case, TLLogic[0] = [10, 60, 4, 70, 4] and TLLogic[1] = [5, 80, 4, 50, 4] where
      // the first element of each array is the offset and the rest are phase durations, as we just stated.

      // If index = 3, then it refers to this ↓↓ element (70) of TLLogic[1].
      //                          [10, 60, 4, 70, 4, 5, 80, 4, 50, 4]
      // given that 3 is less than TLLogic[0] length.

      break;
    }

    // In this case, given that index is greater than the amount of elements that are in TLLogic[0], we would skip the
    // conditional and calculate index for TLLogic[1], which is why we increment tlPos and substract the length of
    // TLLogic[0] to index.

    // If index = 7, then it refers to this ↓ element of the individual
    //            [10, 60, 4, 70, 4, 5, 80, 4, 50, 4]

    // which in turn would be the third element (pos 2, we start counting at 0) in TLLogic[1] = [5, 80, 4, 50, 4].
    //                                                                                                  ^
    // And so on.

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
    CrossoverParams<IntegerIndividual, number>,
    UniformMutationParams>
  (params);

// Finally executes the EA
evolutionaryAlgorithm.run();

// Once the EA it's done, get the fittest individual
const bestCandidate = evolutionaryAlgorithm.population.getFittestIndividualItem()?.individual;
const fitness = evolutionaryAlgorithm.population.getFittestIndividualItem()?.fitness;

if (bestCandidate === undefined) {
  throw "Not fittest individual found";
}


// function writeToFile(values: number[], filepath: string) {
//   console.log("Checking ", filepath);
//   if (!fs.existsSync(path.dirname(filepath))) {
//     fs.mkdirSync(path.dirname(filepath), { recursive: true });
//   }
//
//   console.log("Writing...");
//   fs.writeFile(filepath, values.toString() + "\n", {
//     encoding: "utf8",
//     flag: "a"
//   },(err) => {
//     if (err) return console.log(err);
//     console.log(c.green(path.basename(filepath), "has been saved"));
//   });
// }


const stringify = (obj: any, indent = 2) => 
  JSON.stringify(obj, (key, value) => {
    if (Array.isArray(value) && !value.some(x => x && typeof x === 'object')) {
      return `\uE000${JSON.stringify(value.map(v => typeof v === 'string' ? v.replace(/"/g, '\uE001') : v))}\uE000`;
    }
    return value;
  }, indent).replace(/"\uE000([^\uE000]+)\uE000"/g, match => match.substr(2, match.length - 4).replace(/\\"/g, '"').replace(/\uE001/g, '\\\"'));


console.log("Checking ", saveFilepath);
if (!fs.existsSync(path.dirname(saveFilepath))) {
  fs.mkdirSync(path.dirname(saveFilepath), { recursive: true });
}
console.log("Writing...");
fs.writeFile(saveFilepath + ".json", stringify(executionInfo), {
  encoding: "utf8",
  flag: "a"
},(err) => {
  if (err) return console.log(err);
  console.log(c.green(path.basename(saveFilepath), "has been saved"));
});

// Convert the array of numbers that is the individual to a network file recognizable by SUMO
const tl = genotypeToTlLogic(bestCandidate);
const networkFilename = writeTlLogic(tl);

// Copy that file to the location the used specified
fs.renameSync(networkFilename, saveFilepath.concat(".net.xml"));
console.log("Fittest candidate located at ", saveFilepath);


console.log("Best fitness achieved", fitness);
console.timeEnd("execution");


// // If the flag is provided, SUMO-GUI will be executed with the fittest solution to see how it behaves
// if (argv.play) {
//   console.log("\nExecuting simulation");
//   executeSumo({
//       command_name: "sumo-gui",
//       flags: [
//         "--no-warnings",                        // don't log warnings
//         "--no-step-log",                        // don't log step info
//         "--time-to-teleport -1",                // disable teleports
//         "--seed 23432",                         // define seed
//         "--duration-log.statistics",            // log aggregated information about trips
//         "--tripinfo-output.write-unfinished",   // include info about vehicles that don't reach their destination
//       ],
//       files: {
//         network: `"${saveFilepath}"`,
//         routes: routesFilepath,
//         // additional: ['./assets/anchieta_pedestrians.rou.xml']
//       },
//     },
//   );
// }
