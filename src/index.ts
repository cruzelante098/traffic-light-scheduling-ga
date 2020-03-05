import {exec} from 'child_process';

const resourcesFolder = "./assets";

// TODO: only meant for temporal usage
const log = console.log;

const commandName = "sumo";

const commandFlags = [
  "-W",                 // don't log warnings
  "--no-step-log",       // don't log step info
];

const commandOptions = {
  "-n": `${resourcesFolder}/anchieta_21012020_v2.net.xml`,        // network file
  "-r": `${resourcesFolder}/viajes_cortos.rou.xml`,               // route file
  "-a": [`${resourcesFolder}/peatones_aleatorios.rou.xml`],       // additional files

  /**
   * Returns entries and values as a string separated by spaces
   */
  join: function (separator: string): string {
    // filter discards this function (so it doesn't appear in the final command)
    // flatMap converts this [[1,2],[3,4]] to [1,2,3,4] so it can be joined
    return Object.entries(this)
      .filter(elem => typeof elem[1] !== 'function')
      .flatMap(e => e)
      .join(separator);
  }
};

const command = `${commandName} ${commandFlags.join(" ")} ${commandOptions.join(" ")}`;
log(`Executing '${command}'`);

exec(command, (error, stdout, stderr) => {
  log(stdout);
  log("------");
  log(stderr);
});


