import fs from 'fs';
import BeautifulDom from 'beautiful-dom';
import { Phase, TLLogic } from "./tl-logic";

export function parseTlLogic(networkFilename: string): TLLogic[] {
  const tlLogicArray: TLLogic[] = [];

  const contents = fs.readFileSync(networkFilename, 'utf8');
  const document = new BeautifulDom(contents);

  const tlElements = document.getElementsByTagName("tlLogic");

  for (const tlXml of tlElements) {
    const name = tlXml.getAttribute("id")!;

    if (name === '278958815') {
      // This TL refers to the intersection between Camino San Francisco de Paula
      // and Avenida Astrofísico Francisco Sánchez. Not needed for this.
      continue;
    }

    const phases: Phase[] = [];

    for (const phase of tlXml.getElementsByTagName("phase")) {
      phases.push(new Phase(
        parseInt(phase.getAttribute("duration")!, 10),
        phase.getAttribute("state")!
      ));
    }

    tlLogicArray.push(new TLLogic(name, phases));
  }

  return tlLogicArray;
}
