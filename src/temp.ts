import { TLLogic } from "./tl-logic";
import { parseTlLogic, writeTlLogic } from "./xml-io";
import { genotypeToTlLogic, setOriginalTl } from "./converter";
import { executeSumo, SumoAggregatedData } from "./executor";

const originalTl: ReadonlyArray<TLLogic> = parseTlLogic("./assets/anchieta.net.xml");
setOriginalTl(originalTl);

// El primer valor de cada línea que aparece en el array es el 'offset'

const tlBusquedaAleatoria = genotypeToTlLogic([
  56, 50, 4, 17, 4,
  18, 26, 4, 58, 4,
  60, 59, 4, 8, 4,
  7, 42, 4, 52, 4,
  6, 12, 4, 8, 4,
  85, 45, 4, 51, 4,
  88, 28, 4, 16, 4,
  26, 53, 4, 45, 4,
  18, 5, 4, 11, 4,
  11, 56, 4, 33, 4
]);

const tlOriginalSumo = genotypeToTlLogic([
  0, 39, 6, 39, 6,
  0, 34, 6, 34, 6,
  0, 39, 6, 34, 6,
  0, 39, 6, 34, 6,
  0, 34, 6, 34, 6,
  0, 39, 4, 34, 4,
  0, 74, 6, 5, 5,
  0, 74, 6, 5, 5,
  0, 74, 6, 5, 5,
  0, 79, 5, 6, 6
]);

const searchFile = writeTlLogic(tlBusquedaAleatoria);
const sumoFile = writeTlLogic(tlOriginalSumo);

console.log("Búsqueda aleatoria");

const searchData: SumoAggregatedData = executeSumo({
    flags: [
      "-W",                             // don't log warnings
      "--duration-log.statistics",      // log aggregated information about trips
      "-e 3600",
      "--time-to-teleport -1",
      "--seed 23432",
    ],
    files: {
      network: searchFile,
      routes: ["./assets/anchieta.rou.xml"],
    },
  },
);
console.log(searchData);
console.log();

console.log("Original de SUMO");

const sumoData: SumoAggregatedData = executeSumo({
    flags: [
      "-W",                             // don't log warnings
      "--duration-log.statistics",      // log aggregated information about trips
      "-e 3600",
      "--time-to-teleport -1",
      "--seed 23432",
    ],
    files: {
      network: sumoFile,
      routes: ["./assets/anchieta.rou.xml"],
    },
  },
);
console.log(sumoData);
