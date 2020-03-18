import * as cp from 'child_process';

/*
  SUMO options:
    -n, --net-file FILE                  Load road network description from FILE
    -r, --route-files FILE               Load routes descriptions from FILE(s)
    -a, --additional-files FILE          Load further descriptions from FILE(s)
 */

interface SumoOptions {
  flags: string[];
  files: { network: string, routes: string[], additional?: string[] },
}

const COMMAND_NAME = "sumo";

export function executeSumo(sumoOptions: SumoOptions) {

  let command = COMMAND_NAME + " ";
  command += sumoOptions.flags.join(" ") + " ";
  command += `--net-file ${sumoOptions.files.network} `;
  command += `--route-files ${sumoOptions.files.routes.join(",")}`;

  if (sumoOptions.files.additional) {
    command += ` --additional-files ${sumoOptions.files.additional.join(",")}`;
  }

  console.log(`Executing '${command}'`);

  const stdout = cp.execSync(command);

  console.log(stdout);
}

executeSumo({
    flags: [
      "-W",                  // don't log warnings
      "--no-step-log",       // don't log step info
    ],
    files: {
      network: './assets/anchieta.net.xml',
      routes: ['./assets/anchieta.rou.xml'],
      additional: ['./assets/anchieta_pedestrians.rou.xml']
    }
  }
);
