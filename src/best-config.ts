import path from "path";
import { spawn } from "child_process";
import c from "chalk";
import { file } from "tmp";

export function run(population: number, crossovers: "OnePointCrossover" | "UniformCrossover", inputFile: string, pedestriansFile?: string) {
  for (let i = 0; i < 2; i++) {

    let fileFolder = path.basename(path.dirname(inputFile));

    if (pedestriansFile) {
      fileFolder = fileFolder.concat("_", path.basename(path.dirname(pedestriansFile)).includes("few") ? "few_pedestrians" : "many_pedestrians");
      console.log(c.redBright(fileFolder));
    }

    const node = spawn("node", [
      "--require ts-node/register src/genetics.ts",
      "--project tsconfig.json",
      `--network "${inputFile}"`,
      `--crossover ${crossovers}`,
      `--population ${population}`,
      `--routes "${instancesFolder}/new_flow/flowrouterpy_routes.add.xml" "${instancesFolder}/new_flow/flowrouterpy_flow.add.xml" "${instancesFolder}/new_flow/bus.rou.xml" "${instancesFolder}/new_flow/heavy.rou.xml" `.concat(pedestriansFile ? `"${pedestriansFile}"` : ""),
      `--save "${outputFolder}/${fileFolder}/${crossovers}/Pop${population}/Exec${i + 1}"`,
      `--savegenotype`,
    ], {
      cwd: process.cwd(),
      env: process.env,
      stdio: "pipe",
      shell: true,
    });

    // node.stdout.on("data", (data: any) => {
    //   console.log(`stdout: ${data}`);
    // });

    // node.stderr.on("data", (data: any) => {
    //   console.error(`stderr: ${data}`);
    // });

    // node.on("close", (data: any) => {
    //   console.error(`stderr: ${data}`);
    // });

    node.stdout.pipe(process.stdout);
    node.stderr.pipe(process.stderr);
  }
}

const outputFolder = "./output";
const instancesFolder = "assets/instances";

const anchieta_no_tls = `${instancesFolder}/anchieta_no_tls/anchieta.net.xml`;
const anchieta_no_tls_few_pedestrians = `${instancesFolder}/anchieta_no_tls_few_pedestrians/anchieta.net.xml`;
const anchieta_no_tls_many_pedestrians = `${instancesFolder}/anchieta_no_tls_many_pedestrians/anchieta.net.xml`;
const anchieta_tls_algev_interior_lane_always_green = `${instancesFolder}/anchieta_tls_algev-interior_lane_always_green/anchieta.net.xml`;
const anchieta_tls_algev_interior_lane_changes = `${instancesFolder}/anchieta_tls_algev-interior_lane_changes/anchieta.net.xml`;
const anchieta_tls_special = `${instancesFolder}/anchieta_tls_special/anchieta.net.xml`;


const few_pedestrians = "assets/instances/anchieta_no_tls_few_pedestrians/peatones_aleatorios.rou.xml"
const many_pedestrians = "assets/instances/anchieta_no_tls_many_pedestrians/peatones_aleatorios.rou.xml"


// process.on('warning', e => console.warn(e.stack));

// run(10, "OnePointCrossover", anchieta_no_tls);
// run(10, "OnePointCrossover", anchieta_no_tls_many_pedestrians);
// run(10, "OnePointCrossover", anchieta_no_tls_few_pedestrians);

run(10, "OnePointCrossover", anchieta_tls_algev_interior_lane_always_green);
// run(10, "OnePointCrossover", anchieta_tls_algev_interior_lane_changes);
// run(10, "OnePointCrossover", anchieta_tls_special, few_pedestrians);
// run(10, "OnePointCrossover", anchieta_tls_special, many_pedestrians);

// run(10, "UniformCrossover", anchieta_no_tls);
// run(10, "UniformCrossover", anchieta_no_tls_few_pedestrians);
// run(10, "UniformCrossover", anchieta_no_tls_many_pedestrians);

run(10, "UniformCrossover", anchieta_tls_algev_interior_lane_always_green);
// run(10, "UniformCrossover", anchieta_tls_algev_interior_lane_changes);
// run(10, "UniformCrossover", anchieta_tls_special, few_pedestrians);
// run(10, "UniformCrossover", anchieta_tls_special, many_pedestrians);

// run(50, "OnePointCrossover", anchieta_no_tls);
// run(50, "OnePointCrossover", anchieta_no_tls_few_pedestrians);
// run(50, "OnePointCrossover", anchieta_no_tls_many_pedestrians);

run(50, "OnePointCrossover", anchieta_tls_algev_interior_lane_always_green);
// run(50, "OnePointCrossover", anchieta_tls_algev_interior_lane_changes);
// run(50, "OnePointCrossover", anchieta_tls_special, few_pedestrians);
// run(50, "OnePointCrossover", anchieta_tls_special, many_pedestrians);

// run(50, "UniformCrossover", anchieta_no_tls);
// run(50, "UniformCrossover", anchieta_no_tls_few_pedestrians);
// run(50, "UniformCrossover", anchieta_no_tls_many_pedestrians);

run(50, "UniformCrossover", anchieta_tls_algev_interior_lane_always_green);
// run(50, "UniformCrossover", anchieta_tls_algev_interior_lane_changes);
// run(50, "UniformCrossover", anchieta_tls_special, few_pedestrians);
// run(50, "UniformCrossover", anchieta_tls_special, many_pedestrians);

