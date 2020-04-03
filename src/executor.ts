import cp from "child_process";

/*
  SUMO options:
    -n, --net-file FILE                  Load road network description from FILE
    -r, --route-files FILE               Load routes descriptions from FILE(s)
    -a, --additional-files FILE          Load further descriptions from FILE(s)
 */

const COMMAND_NAME = "sumo";

export interface SumoOptions {
  flags: string[];
  files: { network: string, routes: string[], additional?: string[] },
}

export interface SumoAggregatedData {
  vehicles: {
    inserted: number,
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
    vehicles: {
      inserted: get(/Inserted: ([0-9]*)/i),
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

export function executeSumo(sumoOptions: SumoOptions): SumoAggregatedData {
  let command = COMMAND_NAME + " ";
  command += sumoOptions.flags.join(" ") + " ";
  command += `--net-file ${sumoOptions.files.network} `;
  command += `--route-files ${sumoOptions.files.routes.join(",")}`;

  if (sumoOptions.files.additional) {
    command += ` --additional-files ${sumoOptions.files.additional.join(",")}`;
  }

  console.log(`Executing '${command}'`);
  const child = cp.spawnSync(command, {
    cwd: process.cwd(),
    env: process.env,
    stdio: 'pipe',
    encoding: 'utf-8',
    shell: true,
  });

  return parseSumoAggegatedOutputData(child.output.join());
}
