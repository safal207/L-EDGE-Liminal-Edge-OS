export type CalibrationMatchQuality =
  | "well_calibrated"
  | "overconfident"
  | "underconfident"
  | "missed"
  | "lucky"
  | "unlucky";

export type ForesightMatchQuality = CalibrationMatchQuality;
