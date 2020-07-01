import cp, { SpawnSyncReturns } from "child_process";
import fs from "fs";

/*
  SUMO options:
    -n, --net-file FILE                  Load road network description from FILE
    -r, --route-files FILE               Load routes descriptions from FILE(s)
    -a, --additional-files FILE          Load further descriptions from FILE(s)
 */

const COMMAND_NAME = "sumo";
let child: SpawnSyncReturns<string>;

export interface SumoOptions {
  command_name?: string;
  flags: string[];
  files: { network: string, routes: string[], additional?: string[] },
}

export interface SumoAggregatedData {
  performance: {
    duration: number,
    realTimeFactor: number,
  },
  vehicles: {
    inserted: number,
    loaded: number,
    running: number,
    waiting: number,
  },
  teleports: {
    jam: number,
    yield: number,
    wrongLane: number,
    total: number,
  },
  statistics: {
    routeLength: number,
    speed: number,
    duration: number,
    waitingTime: number,
    timeLoss: number,
    departDelay: number,
  },
}

function parseSumoAggegatedOutputData(sumoOutput: string): SumoAggregatedData {
  const get = (r: RegExp): number => {
    return Number(sumoOutput.match(r)?.[1]);
  };

  return {
    performance: {
      duration: get(/Duration: ([0-9]*)ms/i),
      realTimeFactor: get(/Real time factor: ([0-9.]*)/i),
    },
    vehicles: {
      inserted: get(/Inserted: ([0-9]*)/i),
      loaded: get(/Loaded: ([0-9]*)/i),
      running: get(/Running: ([0-9]*)/i),
      waiting: get(/Waiting: ([0-9]*)/i),
    },
    teleports: {
      jam: get(/Jam: ([0-9]*)/i),
      wrongLane: get(/Wrong Lane: ([0-9]*)/i),
      yield: get(/Yield: ([0-9]*)/i),
      total: get(/Teleports: ([0-9]*)/i),
    },
    statistics: {
      departDelay: get(/DepartDelay: ([.0-9]*)/i),
      duration: get(/Duration: ([0-9]*\.[0-9]*)/i),
      routeLength: get(/RouteLength: ([.0-9]*)/i),
      speed: get(/Speed: ([.0-9]*)/i),
      timeLoss: get(/TimeLoss: ([.0-9]*)/i),
      waitingTime: get(/WaitingTime: ([.0-9]*)/i),
    },
  };
}

import { inspect } from 'util';

export function ins(x: any, colors: boolean = true): string {
  return inspect(x, { depth: 30, colors, maxArrayLength: 30 });
}

export function executeSumo(sumoOptions: SumoOptions): SumoAggregatedData {
  checkFilesExists(sumoOptions.files.routes);

  let command = (sumoOptions.command_name ? sumoOptions.command_name : COMMAND_NAME) + " ";
  command += sumoOptions.flags.join(" ") + " ";
  command += `--net-file ${sumoOptions.files.network} `;
  command += `--additional-files ${sumoOptions.files.routes.map(elem => '"' + elem + '"').join(",")}`;

  if (sumoOptions.files.additional) {
    command += ` --additional-files ${sumoOptions.files.additional.join(",")}`;
  }

  console.log(`Executing '${command}'`);
  child = cp.spawnSync(command, {
    cwd: process.cwd(),
    env: process.env,
    stdio: "pipe",
    encoding: "utf-8",
    shell: true,
    killSignal: "SIGINT",
  });

  if (child.status !== 0) {
    process.exit(1);
  }

  return parseSumoAggegatedOutputData(child.output.join());
}

function checkFilesExists(path: string[]) {
  for (const x of path) {
    // console.log("Checking " + x);
    if (!fs.existsSync(x)) {
      throw "File doesnt exist: " + x;
    }
  }
}

