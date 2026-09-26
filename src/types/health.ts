export interface MedicineStock {
  id: string;
  name: string;
  category: 'Maternal Health' | 'Anti-Malarial' | 'Antivenom & Trauma' | 'Antibiotic' | 'IV & Hydration' | 'Chronic / Endocrine' | 'Vaccine Cold-Chain';
  currentUnits: number;
  safeBufferUnits: number;
  dailyConsumption: number;
  daysRemaining: number;
  unit: string;
  coldChainRequired: boolean;
  minTempC?: number;
  maxTempC?: number;
  status: 'SAFE' | 'WARNING' | 'CRITICAL_DEPLETION';
}

export interface BedAvailability {
  total: number;
  occupied: number;
  available: number;
  maternity: { total: number; occupied: number };
  emergencyIcu: { total: number; occupied: number };
  isolation: { total: number; occupied: number };
}

export interface PersonnelAttendance {
  doctors: { onDuty: number; sanctioned: number };
  nurses: { onDuty: number; sanctioned: number };
  pharmacists: { onDuty: number; sanctioned: number };
  labTechs: { onDuty: number; sanctioned: number };
  communityHealthWorkers: { activeField: number; total: number };
  attendanceRate: number; // percentage
}

export interface ColdChainTelemetry {
  currentTempC: number;
  targetRange: string;
  status: 'OPTIMAL' | 'WARNING' | 'BREACHED';
  dataloggerId: string;
  batteryReserveHours: number;
  lastSync: string;
}

export interface PHCNode {
  id: string;
  code: string;
  name: string;
  type: 'Primary Health Centre' | 'Community Health Centre' | 'Sub-District Hospital' | 'Central Medical Store';
  district: string;
  state: string;
  coordinates: { x: number; y: number; lat: number; lng: number };
  populationCovered: number;
  roadAccessibility: 'ACCESSIBLE' | 'MONSOON_FLOOD_RESTRICTED' | 'ROUGH_TERRAIN';
  footfall: {
    currentQueue: number;
    dailyAverage: number;
    triageSurgeIndex: 'NORMAL' | 'ELEVATED' | 'SURGE_EMERGENCY';
  };
  beds: BedAvailability;
  personnel: PersonnelAttendance;
  coldChain: ColdChainTelemetry;
  stocks: MedicineStock[];
  stockoutRiskScore: number; // 0 - 100
}

export interface RedistributionTransfer {
  transferId: string;
  fromFacilityId: string;
  fromFacilityName: string;
  toFacilityId: string;
  toFacilityName: string;
  medicineId: string;
  medicineName: string;
  quantity: number;
  unit: string;
  transportMode: 'Medical Drone UAV (Fleet-Alpha)' | 'Insulated Reefer Van' | 'District Logistics Vehicle';
  distanceKm: number;
  transitHours: number;
  coldChainCompliance: string;
  rationale: string;
  status: 'PROPOSED' | 'DISPATCHED' | 'IN_TRANSIT' | 'DELIVERED';
  qrCode: string;
  eta: string;
}

export interface BRICSNationNode {
  country: string;
  flag: string;
  institution: string;
  datasetName: string;
  localRecords: number;
  modelWeightDrift: number;
  differentialPrivacyEpsilon: number;
  activeSurgeAlerts: string[];
  connectionStatus: 'SYNCHRONIZED' | 'COMPUTING_GRADIENTS' | 'OFFLINE';
  lastGradientPush: string;
}

export interface ForecastResult {
  summary: string;
  peakSurgeDay: number;
  expectedFootfallMultiplier: number;
  criticalStockoutsProjected: {
    medicine: string;
    daysUntilDepletion: number;
    riskLevel: string;
    deficitUnits: number;
    reason: string;
  }[];
  clinicalDirectives: string[];
  confidenceInterval: string;
  bricsStrainAlignment: string;
}
