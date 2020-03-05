import {BinaryIndividual, BitwiseMutation, BitwiseMutationParams, OnePointCrossover} from 'genetics-js';
import EvolutionaryAlgorithm, {EvolutionaryAlgorithmParams} from "genetics-js/lib/lib/algorithms/EvolutionaryAlgorithm";
import FitnessFunction from "genetics-js/lib/lib/fitness/FitnessFunction";
import BinaryGenerator, {
  BinaryGeneratorParams
} from "genetics-js/lib/lib/generator/binary/BinaryGenerator";
import {nativeMath} from "random-js";
import FitnessProportionalSelection, {FitnessProportionalSelectionParams} from "genetics-js/lib/lib/selection/base/FitnessProportionalSelection";
import RouletteWheel from "genetics-js/lib/lib/selection/implementation/RouletteWheel";
import FitnessBased from "genetics-js/lib/lib/selection/replacement/FitnessBased";
import MaxGenerations from "genetics-js/lib/lib/termination/MaxGenerations";

const limit = 20;
const items = [
  {
    weight: 4,
    value: 12,
  },
  {
    weight: 6,
    value: 10,
  },
  {
    weight: 5,
    value: 8,
  },
  {
    weight: 7,
    value: 11,
  },
  {
    weight: 3,
    value: 14,
  },
  {
    weight: 1,
    value: 7,
  },
  {
    weight: 6,
    value: 9,
  },
];

const populationSize = 25;
const mutationRate = 0.5;
const maxGenerations = 500;
const individuals: BinaryIndividual[] = [];

for (let i = 0; i < populationSize; i++) {
  individuals.push(new BinaryGenerator().generateWith({chance: 0.3, engine: nativeMath, length: items.length}));
}

const fitnessFunction: FitnessFunction<BinaryIndividual, boolean> = individual => {
  let weight = 0.0;
  let value = 0.0;
  individual.forEach((gene, index) => {
    if (gene) {
      const item = items[index!];
      weight += item.weight;
      value += item.value;
    }
  });
  if (weight <= limit) {
    return value;
  } else {
    return 0.0;
  }
};

const params: EvolutionaryAlgorithmParams<BinaryIndividual,
  boolean,
  BinaryGeneratorParams,
  FitnessProportionalSelectionParams<BinaryIndividual, boolean>,
  any,
  BitwiseMutationParams> = {
  populationSize: populationSize,
  generator: new BinaryGenerator(),
  generatorParams: {
    chance: 0.3,
    engine: nativeMath,
    length: items.length
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
    individualConstructor: BinaryIndividual
  },
  mutation: new BitwiseMutation(),
  mutationParams: {
    engine: nativeMath,
    mutationRate: mutationRate
  },
  replacement: new FitnessBased(),
  replacementParams: {
    selectionCount: populationSize
  },
  fitnessFunction: fitnessFunction,
  terminationCondition: new MaxGenerations(maxGenerations)
};

const evolutionaryAlgorithm = new EvolutionaryAlgorithm<BinaryIndividual,
  boolean,
  BinaryGeneratorParams,
  any,
  any,
  BitwiseMutationParams>(params);

const elements: any = [];
evolutionaryAlgorithm.run();
evolutionaryAlgorithm.population.getFittestIndividualItem()?.individual.genotype.forEach((item, index) => {
  if (item) {
    elements.push(items[index]);
  }
});

console.log(evolutionaryAlgorithm.population.getFittestIndividualItem());
console.log(evolutionaryAlgorithm.population.getFittestIndividualItem()?.fitness);
console.log(elements);
