export type LiftName = "squat" | "bench" | "dead";
export type AttemptNumber = "1" | "2" | "3";
export type ClockState = "initial" | "started";

export type RecordData = {
  gender: string | null;
  equipmentLevel: string | null;
  tested: "U" | "T" | null;
  divisionCode: string | null;
  weightClass: string | null;
  competitionType: "FP" | "PP" | "SL" | null;
  lift: "S" | "B" | "D" | "T";
  location: string | null;
  recordWeight: number;
};

type RefDecision = {
  decision?: "bad" | "good" | null;
  cards?: {
    red?: boolean;
    blue?: boolean;
    yellow?: boolean;
  };
};

export type LifterAttempt = {
  id: string | null;
  weight: number | null;
  result: string | null;
  records: RecordData[];
  decisions: {
    left?: RefDecision;
    head?: RefDecision;
    right?: RefDecision;
  } | null;
};

export type LifterAttempts = Record<AttemptNumber, LifterAttempt>;

export type LifterLifts = Record<LiftName, LifterAttempts>;

export type LifterDivision = {
  divisionId: string | null;
  weightClassId: string | null;
  score: string | number | null;
  forecastedScore: string | number | null;
  place: number | null;
  forecastedPlace: number | null;
  total: number | null;
  forecastedTotal: number | null;
};

export type Lifter = {
  id: string;
  memberNumber: string | null;
  name: string | null;
  gender: string | null;
  team: string | null;
  state: string | null;
  country: string | null;
  bodyWeight: number | null;
  lot: number | null;
  session: number | string | null;
  flight: string | null;
  squatRackHeight: string | null;
  benchRackHeight: string | null;
  platform: string | null;
  divisions: LifterDivision[];
  lifts: LifterLifts;
};

export type Lifters = Record<string, Lifter>;

export type Attempt = {
  id: string;
  liftName: LiftName;
  attemptNumber: string;
  lifter: {
    id: string;
  };
};

export type RefLight = {
  decision?: "good" | "bad" | null;
  cards?: { red?: boolean; blue?: boolean; yellow?: boolean };
};

export type RefLights = {
  left: RefLight;
  head: RefLight;
  right: RefLight;
};

export type Platform = Record<
  string,
  {
    id: string;
    name: string | null;
    clockState: ClockState | null;
    clockTimerLength: number | null;
    barAndCollarsWeight: number | null;
    currentAttempt: Attempt | null;
    nextAttempts: Attempt[];
    refLights: RefLights;
  }
>;

export type WeightClass = Record<
  string,
  {
    name: string | null;
    maxWeight: number | null;
  }
>;

export type Divisions = Record<
  string,
  {
    id: string;
    name: string | null;
    scoreBy: string | null;
    weightClasses: WeightClass;
  }
>;

export type MeetApiResponse = {
  name: string;
  units: "KG" | "LBS" | null;
  lifters?: Lifters;
  platforms?: Platform;
  divisions?: Divisions;
};
