export interface PredictionResult {
  detection_result: any;
  random_prompt: string;
}

export interface VerificationResult {
  verified: boolean;
  reason?: string;
  detection_result: any;
}
