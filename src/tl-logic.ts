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
  private _offset: number;

  constructor(name: string, phases?: Phase[], offset?: number) {
    this._id = name;
    this._phases = phases ? phases : [];
    this._offset = offset? offset : 0;
  }

  get offset(): number {
    return this._offset;
  }

  set offset(value: number) {
    this._offset = value;
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
