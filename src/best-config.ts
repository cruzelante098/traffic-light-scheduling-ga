import path from "path";
import { spawn } from "child_process";

export function run(population: number, crossovers: "OnePointCrossover" | "UniformCrossover", inputFile: string) {
  for (let i = 0; i < 1; i++) {

    const filename = path.basename(inputFile, 'anchieta.net.xml');
    const fileFolder = path.basename(path.dirname(inputFile));

    const node = spawn("\"C:/Program Files/nodejs/node.exe\"", [
      "--require ts-node/register \"C:/Users/Francisco Cruz/Repositorios/traffic-light-scheduling-ga/src/genetics.ts\"",
      "--project tsconfig.json",
      `--network "${inputFile}"`,
      `--crossover ${crossovers}`,
      `--population ${population}`,
      `--routes "${instancesFolder}/new_flow/flowrouterpy_routes.add.xml" "${instancesFolder}/new_flow/flowrouterpy_flow.add.xml" "${instancesFolder}/new_flow/bus.rou.xml" "${instancesFolder}/new_flow/heavy.rou.xml"`,
      `--save "${outputFolder}/${fileFolder}/${crossovers}_Pop-${population}_${filename}_Exec-${i + 1}"`,
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
  }
}

const outputFolder = "C:/Users/Francisco Cruz/Desktop/output";
const instancesFolder = "C:/Users/Francisco Cruz/Repositorios/traffic-light-scheduling-ga/assets/instances";

const anchieta_no_tls = `${instancesFolder}/anchieta_no_tls/anchieta.net.xml`;
const anchieta_no_tls_few_pedestrians = `${instancesFolder}/anchieta_no_tls_few_pedestrians/anchieta.net.xml`;
const anchieta_no_tls_many_pedestrians = `${instancesFolder}/anchieta_no_tls_many_pedestrians/anchieta.net.xml`;
const anchieta_tls_algev_interior_lane_always_green = `${instancesFolder}/anchieta_tls_algev-interior_lane_always_green/anchieta.net.xml`;
const anchieta_tls_algev_interior_lane_changes = `${instancesFolder}/anchieta_tls_algev-interior_lane_changes/anchieta.net.xml`;
const anchieta_tls_special = `${instancesFolder}/anchieta_tls_special/anchieta.net.xml`;

process.on('warning', e => console.warn(e.stack));

// run(10, "OnePointCrossover", anchieta_no_tls);
// run(10, "OnePointCrossover", anchieta_no_tls_few_pedestrians);
// run(10, "OnePointCrossover", anchieta_no_tls_many_pedestrians);
run(10, "OnePointCrossover", anchieta_tls_algev_interior_lane_always_green);
run(10, "OnePointCrossover", anchieta_tls_algev_interior_lane_changes);
run(10, "OnePointCrossover", anchieta_tls_special);

// run(10, "UniformCrossover", anchieta_no_tls);
// run(10, "UniformCrossover", anchieta_no_tls_few_pedestrians);
// run(10, "UniformCrossover", anchieta_no_tls_many_pedestrians);
run(10, "UniformCrossover", anchieta_tls_algev_interior_lane_always_green);
run(10, "UniformCrossover", anchieta_tls_algev_interior_lane_changes);
run(10, "UniformCrossover", anchieta_tls_special);

// run(50, "OnePointCrossover", anchieta_no_tls);
// run(50, "OnePointCrossover", anchieta_no_tls_few_pedestrians);
// run(50, "OnePointCrossover", anchieta_no_tls_many_pedestrians);
run(50, "OnePointCrossover", anchieta_tls_algev_interior_lane_always_green);
run(50, "OnePointCrossover", anchieta_tls_algev_interior_lane_changes);
run(50, "OnePointCrossover", anchieta_tls_special);

// run(50, "UniformCrossover", anchieta_no_tls);
// run(50, "UniformCrossover", anchieta_no_tls_few_pedestrians);
// run(50, "UniformCrossover", anchieta_no_tls_many_pedestrians);
run(50, "UniformCrossover", anchieta_tls_algev_interior_lane_always_green);
run(50, "UniformCrossover", anchieta_tls_algev_interior_lane_changes);
run(50, "UniformCrossover", anchieta_tls_special);

