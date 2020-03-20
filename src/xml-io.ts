import fs from "fs";
import path from "path";

import tmp from "tmp";
tmp.setGracefulCleanup();

// @ts-ignore
import xmldom from "xmldom";

import { Phase, TLLogic } from "./tl-logic";

let netpath: string | undefined = undefined;

export function parseTlLogic(networkFilename: string): TLLogic[] {
  netpath = networkFilename;
  const tlLogicArray: TLLogic[] = [];

  const contents = fs.readFileSync(networkFilename, "utf8");
  const document = new xmldom.DOMParser().parseFromString(contents);

  const tlElements = document.getElementsByTagName("tlLogic");

  for (const tlXml of tlElements) {
    const name = tlXml.getAttribute("id")!;

    if (name === "278958815") {
      // This TL refers to the intersection between Camino San Francisco de Paula
      // and Avenida Astrofísico Francisco Sánchez. Not needed for this.
      continue;
    }

    const phases: Phase[] = [];
    const phasesXml = tlXml.getElementsByTagName("phase");

    for (const phase of phasesXml) {
      phases.push(new Phase(
        parseInt(phase.getAttribute("duration")!, 10),
        phase.getAttribute("state")!,
      ));
    }

    tlLogicArray.push(new TLLogic(name, phases));
  }

  return tlLogicArray;
}

export function writeTlLogic(tl: TLLogic[]): string {
  if (netpath === undefined) {
    throw "Network path is undefined";
  }

  const filename = tmp.fileSync({
    prefix: `SUMO_${path.basename(netpath)}-`,
    postfix: ".net.xml",
    keep: false,
    discardDescriptor: true,
  });

  fs.copyFileSync(netpath, filename.name);

  const document = new xmldom.DOMParser().parseFromString(fs.readFileSync(filename.name, "utf8"));
  const tlElements = document.getElementsByTagName("tlLogic");

  for (const tlLogic of tl) {
    for (const tlXml of tlElements) {
      if (tlXml.getAttribute("id") === tlLogic.id) {
        const phases = tlXml.getElementsByTagName("phase");
        let i = 0;
        for (const phase of phases) {
          phase.setAttribute("duration", tlLogic.phases[i].duration);
          i++;
        }
      }
    }
  }

  fs.writeFileSync(filename.name, new xmldom.XMLSerializer().serializeToString(document));
  return filename.name;
}
