export class Phase {
  private _duration: number;
  private _state: string;

  constructor(duration: number, state: string) {
    this._duration = duration;
    this._state = state;
  }

  get duration() {
    return this._duration;
  }

  set duration(value: number) {
    this._duration = value;
  }

  get state(): string {
    return this._state;
  }

  set state(value: string) {
    this._state = value;
  }
}

export class TLLogic {
  private _id: string;
  private _phases: Phase[];

  constructor(name: string, phases?: Phase[]) {
    this._id = name;
    if (phases) {
      this._phases = phases;
    } else {
      this._phases = [];
    }
  }

  get phases(): Phase[] {
    return this._phases;
  }

  set phases(value: Phase[]) {
    this._phases = value;
  }

  get id(): string {
    return this._id;
  }

  set id(value: string) {
    this._id = value;
  }

  pushPhase(phase: Phase) {
    this.phases.push(phase);
  }
}
