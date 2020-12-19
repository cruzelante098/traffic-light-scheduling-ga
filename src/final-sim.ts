import path from "path";
import { spawn } from "child_process";
import c from "chalk";
import { file } from "tmp";
import { executeSumo, SumoAggregatedData } from "./executor";


const mean = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;

function run(networkFilename: string, pedestriansFile?: string) {
  const fitness = [];
  const executionData: SumoAggregatedData[] = [];

  const routes = [`${instancesFolder}/new_flow/flowrouterpy_routes.add.xml`, `${instancesFolder}/new_flow/flowrouterpy_flow.add.xml`, `${instancesFolder}/new_flow/bus.rou.xml`, `${instancesFolder}/new_flow/heavy.rou.xml`];
  if (pedestriansFile) {
    routes.concat(pedestriansFile);
  }

  process.stdout.write(`Executing ${networkFilename}`);

  for (let i = 0; i < 10; i++) {
    // process.stdout.write((i+1) + ", ");

    const seed = Math.floor(Math.random() * (1000000 - 1000) + 1000);
    const data: SumoAggregatedData = executeSumo({
        flags: [
          "--no-warnings",                        // don't log warnings
          "--no-step-log",                        // don't log step info
          "--end 3600",                           // simulation end time
          "--time-to-teleport 120",                // disable teleports
          `--seed ${seed}`,                         // define seed
          "--duration-log.statistics",            // log aggregated information about trips
          "--tripinfo-output.write-unfinished",   // include info about vehicles that don't reach their destination
        ],
        files: {
          network: networkFilename,
          routes: routes,
          // additional: ['./assets/anchieta_pedestrians.rou.xml']
        },
      },
    );

    const {vehicles, statistics, performance} = data;
    const maximize = Math.pow(vehicles.inserted - (vehicles.running + vehicles.waiting), 2); // vehicles that completed their travel
    const minimize = statistics.duration + statistics.timeLoss +
      (vehicles.running + vehicles.waiting) * ((performance.duration / 1000) * performance.realTimeFactor);

    fitness.push(maximize / minimize);

    executionData.push(data);
  }

  console.log();
  console.log(c.redBright(networkFilename));
  console.log(c.yellow(`Fitness: ${mean(fitness)}\n`));

  console.log(c.cyan("Vehicles"));
  console.log(`  loaded: ${mean(executionData.map(e => e.vehicles.loaded))}`);
  console.log(`  inserted: ${mean(executionData.map(e => e.vehicles.inserted))}`);
  console.log(`  running: ${mean(executionData.map(e => e.vehicles.running))}`);
  console.log(`  waiting: ${mean(executionData.map(e => e.vehicles.waiting))}`);

  console.log(c.cyan("Teleports"));
  console.log(`  jam: ${mean(executionData.map(e => e.teleports.jam))}`);
  console.log(`  wrongLane: ${mean(executionData.map(e => e.teleports.wrongLane))}`);
  console.log(`  yield: ${mean(executionData.map(e => e.teleports.yield))}`);
  console.log(`  total: ${mean(executionData.map(e => e.teleports.total))}`);

  console.log(c.cyan("Performance"));
  console.log(`  duration: ${mean(executionData.map(e => e.performance.duration))}`);
  console.log(`  realTimeFactor: ${mean(executionData.map(e => e.performance.realTimeFactor))}`);

  console.log(c.cyan("Statistics"));
  console.log(`  routeLength: ${mean(executionData.map(e => e.statistics.routeLength))}`);
  console.log(`  speed: ${mean(executionData.map(e => e.statistics.speed))}`);
  console.log(`  timeLoss: ${mean(executionData.map(e => e.statistics.timeLoss))}`);
  console.log(`  duration: ${mean(executionData.map(e => e.statistics.duration))}`);
  console.log(`  waitingTime: ${mean(executionData.map(e => e.statistics.waitingTime))}`);
  console.log(`  departDelay: ${mean(executionData.map(e => e.statistics.departDelay))}`);

  console.log();
}


const outputFolder = "./output";
const instancesFolder = "assets/instances";


const anchieta_no_tls = `${instancesFolder}/anchieta_no_tls/anchieta.net.xml`;
const anchieta_no_tls_few_pedestrians = `${instancesFolder}/anchieta_no_tls_few_pedestrians/anchieta.net.xml`;
const anchieta_no_tls_many_pedestrians = `${instancesFolder}/anchieta_no_tls_many_pedestrians/anchieta.net.xml`;

const anchieta_tls_algev_interior_lane_always_green = `output/anchieta_tls_algev-interior_lane_always_green/UniformCrossover/Pop50/Exec10.net.xml`;
const anchieta_tls_algev_interior_lane_changes = `output/anchieta_tls_algev-interior_lane_changes/UniformCrossover/Pop50/Exec10.net.xml`;
const anchieta_tls_special_few_pedestrians = `output/anchieta_tls_special_few_pedestrians/UniformCrossover/Pop50/Exec10.net.xml`;
const anchieta_tls_special_many_pedestrians = `output/anchieta_tls_special_many_pedestrians/UniformCrossover/Pop50/Exec10.net.xml`;

const few_pedestrians = "assets/instances/anchieta_no_tls_few_pedestrians/peatones_aleatorios.rou.xml";
const many_pedestrians = "assets/instances/anchieta_no_tls_many_pedestrians/peatones_aleatorios.rou.xml";


run(anchieta_no_tls);
run(anchieta_no_tls_few_pedestrians, few_pedestrians);
run(anchieta_no_tls_many_pedestrians, many_pedestrians);

run(anchieta_tls_algev_interior_lane_always_green);
run(anchieta_tls_algev_interior_lane_changes);
run(anchieta_tls_special_few_pedestrians, few_pedestrians);
run(anchieta_tls_special_many_pedestrians, many_pedestrians);

