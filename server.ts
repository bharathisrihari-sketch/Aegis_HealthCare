import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const host = '0.0.0.0';

app.use(express.json());

// Initialize Google GenAI client
const apiKey = process.env.GEMINI_API_KEY || '';
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// 1. AI Demand Forecast & Stockout Risk Analysis
app.post('/api/gemini/forecast', async (req, res) => {
  try {
    const { district, scenario, phcData, criticalMedicines } = req.body;

    if (!ai) {
      // Deterministic fallback response when key is not set
      return res.json({
        summary: `Epidemic surge analysis completed for ${district || 'National Network'} under ${scenario || 'Standard Baseline'}.`,
        peakSurgeDay: 9,
        expectedFootfallMultiplier: 2.8,
        criticalStockoutsProjected: [
          { medicine: 'Oxytocin Inj (10 IU)', daysUntilDepletion: 3.2, riskLevel: 'CRITICAL', deficitUnits: 1450, reason: 'High maternal admission spike coupled with transit bottleneck' },
          { medicine: 'Artemether-Lumefantrine (20/120mg)', daysUntilDepletion: 4.8, riskLevel: 'HIGH', deficitUnits: 3800, reason: 'Post-monsoon vector proliferation across lowlands' },
          { medicine: 'Anti-Snake Venom (Polyvalent)', daysUntilDepletion: 2.1, riskLevel: 'CRITICAL', deficitUnits: 420, reason: 'Agricultural flooding displacement in river basins' },
          { medicine: 'Normal Saline 0.9% (500ml)', daysUntilDepletion: 6.0, riskLevel: 'MEDIUM', deficitUnits: 2100, reason: 'Outpatient dehydration and acute gastroenteritis load' }
        ],
        clinicalDirectives: [
          'Pre-position 4,000 ORS sachets and IV rehydration fluids at riverine sub-centres',
          'Deploy mobile cold-chain refrigerators to PHC Ghati & PHC Belur within 24 hours',
          'Authorize immediate emergency buffer release from State Central Depot'
        ],
        confidenceInterval: '94.2%',
        bricsStrainAlignment: 'Matches BRICS-FL Surge Signature #BR-IN-2026-D3 (78% covariance with Pará state seasonal peak)'
      });
    }

    const prompt = `You are the Chief Epidemiological & Supply Chain Resilience AI for a national primary healthcare network.
Analyze the following healthcare supply chain context and provide a structured demand forecast and stock-out early warning:
- District/Region: ${district || 'National Pilot District'}
- Scenario/Outbreak Vector: ${scenario || 'Monsoon Dengue & Gastroenteritis Spike'}
- PHC Network Context: ${JSON.stringify(phcData || { totalPHCs: 14, bedOccupancy: '87%', staffAttendance: '82%' })}
- Critical Medicines Monitored: ${JSON.stringify(criticalMedicines || ['Oxytocin', 'Artemether', 'Anti-Snake Venom', 'Amoxicillin', 'Normal Saline', 'Insulin Regular'])}

Provide a thorough, high-precision technical assessment with realistic figures, critical stockout projections, days until stockout, clinical operational directives, and correlation with shared BRICS epidemiological patterns.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            peakSurgeDay: { type: Type.NUMBER },
            expectedFootfallMultiplier: { type: Type.NUMBER },
            criticalStockoutsProjected: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  medicine: { type: Type.STRING },
                  daysUntilDepletion: { type: Type.NUMBER },
                  riskLevel: { type: Type.STRING },
                  deficitUnits: { type: Type.NUMBER },
                  reason: { type: Type.STRING }
                },
                required: ['medicine', 'daysUntilDepletion', 'riskLevel', 'deficitUnits', 'reason']
              }
            },
            clinicalDirectives: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            confidenceInterval: { type: Type.STRING },
            bricsStrainAlignment: { type: Type.STRING }
          },
          required: ['summary', 'peakSurgeDay', 'expectedFootfallMultiplier', 'criticalStockoutsProjected', 'clinicalDirectives', 'confidenceInterval', 'bricsStrainAlignment']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Forecast API error:', error);
    res.status(500).json({ error: error.message || 'Forecast generation failed' });
  }
});

// 2. Automated Cross-District Resource Redistribution Optimization
app.post('/api/gemini/redistribution', async (req, res) => {
  try {
    const { deficitNodes, surplusNodes, transportConstraints } = req.body;

    if (!ai) {
      return res.json({
        rebalancingPlanId: 'REBAL-2026-DIST-089',
        status: 'OPTIMAL_ROUTED',
        totalMedsRebalanced: 12450,
        estimatedStockoutRiskReduction: '93.4%',
        dispatchRoutes: [
          {
            transferId: 'TX-901',
            fromFacility: 'Central Medical Store (District HQ)',
            toFacility: 'PHC Narsapur (Remote High-Surge)',
            medicine: 'Anti-Snake Venom (Polyvalent)',
            quantity: 350,
            unit: 'vials',
            transportMode: 'Medical Drone UAV (Fleet-Alpha)',
            transitTimeHours: 0.8,
            distanceKm: 42,
            coldChainStatus: 'Active Refrigeration (2-8°C Verified)',
            rationale: 'Road cut-off due to flash river flooding; UAV guarantees 48-minute delivery avoiding critical zero-stock death risk.'
          },
          {
            transferId: 'TX-902',
            fromFacility: 'Sub-District Hospital Belgaum (Surplus Stock)',
            toFacility: 'PHC Kadur (Outbreak Epicentre)',
            medicine: 'Artemether-Lumefantrine',
            quantity: 3200,
            unit: 'blisters',
            transportMode: 'Insulated Reefer Van (Route-4B)',
            transitTimeHours: 2.1,
            distanceKm: 88,
            coldChainStatus: 'Continuous Datalogger Active',
            rationale: 'Surplus holding at Belgaum exceeds 45 days of normal supply; Kadur holds only 1.8 days of reserve.'
          },
          {
            transferId: 'TX-903',
            fromFacility: 'Urban Health Centre Ward-7',
            toFacility: 'Community Health Centre Alur',
            medicine: 'Normal Saline 0.9% (500ml)',
            quantity: 1800,
            unit: 'bottles',
            transportMode: 'District Logistics Utility Truck',
            transitTimeHours: 1.4,
            distanceKm: 56,
            coldChainStatus: 'Ambient Controlled',
            rationale: 'Immediate rehydration buffer for rising diarrhoeal footfall in Alur catchment.'
          }
        ],
        livesProtectedEstimate: 420,
        totalFleetFuelKgCo2Saved: 184.5
      });
    }

    const prompt = `You are the Cross-District Medical Redistribution Dispatch Algorithm for National Primary Health Care.
Generate an optimal resource rebalancing manifest transferring emergency supplies from surplus facilities (Central Medical Stores, urban hospitals with excess safety stock) to deficit rural PHCs facing impending stock-outs.

Deficit PHCs: ${JSON.stringify(deficitNodes || [{ phc: 'PHC Narsapur', need: 'Anti-Snake Venom', stockHours: 28 }, { phc: 'PHC Kadur', need: 'Artemether', stockHours: 36 }])}
Surplus Nodes: ${JSON.stringify(surplusNodes || [{ facility: 'Central Medical Store', surplus: 'Anti-Snake Venom: 800 vials' }, { facility: 'Belgaum Hospital', surplus: 'Artemether: 6,000 blisters' }])}
Logistics & Cold-Chain Constraints: ${JSON.stringify(transportConstraints || { maxDronePayloadKg: 15, roadAccessibility: 'River bridge submerged in sector 4', coldChainReq: '2-8 C strict for vaccines and antivenom' })}

Optimize transfer routes minimizing lead-time, preventing clinical deaths, maintaining strict cold chain compliance, and using appropriate multi-modal transit (Drone UAV for cut-off terrain, Reefer Vans for bulk cold chain, Utility Trucks). Return strict JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            rebalancingPlanId: { type: Type.STRING },
            status: { type: Type.STRING },
            totalMedsRebalanced: { type: Type.NUMBER },
            estimatedStockoutRiskReduction: { type: Type.STRING },
            dispatchRoutes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  transferId: { type: Type.STRING },
                  fromFacility: { type: Type.STRING },
                  toFacility: { type: Type.STRING },
                  medicine: { type: Type.STRING },
                  quantity: { type: Type.NUMBER },
                  unit: { type: Type.STRING },
                  transportMode: { type: Type.STRING },
                  transitTimeHours: { type: Type.NUMBER },
                  distanceKm: { type: Type.NUMBER },
                  coldChainStatus: { type: Type.STRING },
                  rationale: { type: Type.STRING }
                },
                required: ['transferId', 'fromFacility', 'toFacility', 'medicine', 'quantity', 'unit', 'transportMode', 'transitTimeHours', 'distanceKm', 'coldChainStatus', 'rationale']
              }
            },
            livesProtectedEstimate: { type: Type.NUMBER },
            totalFleetFuelKgCo2Saved: { type: Type.NUMBER }
          },
          required: ['rebalancingPlanId', 'status', 'totalMedsRebalanced', 'estimatedStockoutRiskReduction', 'dispatchRoutes', 'livesProtectedEstimate', 'totalFleetFuelKgCo2Saved']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Redistribution API error:', error);
    res.status(500).json({ error: error.message || 'Redistribution optimization failed' });
  }
});

// 3. BRICS Federated Learning Global Model Weight Aggregation & Cross-Border Intelligence
app.post('/api/gemini/federated-weights', async (req, res) => {
  try {
    const { roundNumber, participants, vectorFocus } = req.body;

    if (!ai) {
      return res.json({
        federatedRound: roundNumber || 42,
        globalConvergenceLoss: 0.0418,
        aggregationMethod: 'FedAvg with Secure Multi-Party Aggregation (DP: epsilon=1.2, delta=1e-5)',
        participatingNations: [
          { country: 'India', institution: 'MoHFW / e-Aushadhi / ABDM', samplesTrained: 482000, modelWeightDrift: 0.012, status: 'VERIFIED' },
          { country: 'Brazil', institution: 'SUS / DATASUS / Fiocruz', samplesTrained: 395000, modelWeightDrift: 0.018, status: 'VERIFIED' },
          { country: 'South Africa', institution: 'National Department of Health (NDOH / SVS)', samplesTrained: 210000, modelWeightDrift: 0.024, status: 'VERIFIED' },
          { country: 'China', institution: 'National Disease Control & Prevention / NHC', samplesTrained: 890000, modelWeightDrift: 0.009, status: 'VERIFIED' },
          { country: 'Russia', institution: 'Minzdrav EGISZ Healthcare Network', samplesTrained: 315000, modelWeightDrift: 0.014, status: 'VERIFIED' },
          { country: 'UAE', institution: 'MoHAP National Logistics Grid', samplesTrained: 145000, modelWeightDrift: 0.011, status: 'VERIFIED' },
          { country: 'Egypt', institution: 'Unified Procurement Authority (UPA)', samplesTrained: 180000, modelWeightDrift: 0.016, status: 'VERIFIED' },
          { country: 'Ethiopia', institution: 'Ethiopian Pharmaceuticals Supply Service', samplesTrained: 125000, modelWeightDrift: 0.029, status: 'VERIFIED' }
        ],
        crossBorderInsights: [
          'Emerging Arboviral Shift: Vector resistance patterns observed in Mato Grosso (Brazil) correlate with early larval density spikes in coastal Indian PHCs with a 28-day lag.',
          'Pediatric Respiratory Syncytial Surge: Shared gradient weights identify an unseasonal pediatric bronchospasm surge pattern shared between Gauteng (South Africa) and Central China river basins.',
          'Cold-Chain Thermal Invariance: Russia & UAE polar/desert edge telemetry yielded robust gradient updates for vaccine degradation under extreme ambient thermal swings (-25°C to +48°C).'
        ],
        earlyWarningHorizonDays: 24,
        policyRecommendation: 'Pre-allocate 15% strategic continental API buffer for Artemisinin combination therapies and Polyvalent Antivenoms across southern maritime member corridors.'
      });
    }

    const prompt = `You are the Lead Federated Learning Architect for the BRICS Health & Supply Chain Resilience Working Group.
Analyze a Federated Learning aggregation round (FedAvg / Differential Privacy) where BRICS sovereign health networks (India, Brazil, South Africa, China, Russia, UAE, Egypt, Ethiopia) train shared predictive models on local PHC telemetry without moving raw patient health records (Zero-Egress Data Sovereignty).

Context:
- Federated Training Round: ${roundNumber || 42}
- Focus Vector/Pathogen: ${vectorFocus || 'Arboviral (Dengue/Chikungunya) & Critical Maternal Health Supply Chains'}
- Node telemetry samples: Over 2.6 million primary healthcare encounters across 8 sovereign healthcare architectures.

Produce a comprehensive federated consensus report detailing convergence loss, verified participants, cross-border epidemiological intelligence (how predictive weights trained in one hemisphere alert member nations weeks ahead), early warning horizon, and multilateral resilience policy guidance. Return strict JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            federatedRound: { type: Type.NUMBER },
            globalConvergenceLoss: { type: Type.NUMBER },
            aggregationMethod: { type: Type.STRING },
            participatingNations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  country: { type: Type.STRING },
                  institution: { type: Type.STRING },
                  samplesTrained: { type: Type.NUMBER },
                  modelWeightDrift: { type: Type.NUMBER },
                  status: { type: Type.STRING }
                },
                required: ['country', 'institution', 'samplesTrained', 'modelWeightDrift', 'status']
              }
            },
            crossBorderInsights: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            earlyWarningHorizonDays: { type: Type.NUMBER },
            policyRecommendation: { type: Type.STRING }
          },
          required: ['federatedRound', 'globalConvergenceLoss', 'aggregationMethod', 'participatingNations', 'crossBorderInsights', 'earlyWarningHorizonDays', 'policyRecommendation']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Federated Weights API error:', error);
    res.status(500).json({ error: error.message || 'Federated model aggregation failed' });
  }
});

// 4. Emergency Health Logistics Mobilization Protocol
app.post('/api/gemini/emergency-protocol', async (req, res) => {
  try {
    const { emergencyType, affectedPHCs, stockLevels } = req.body;

    if (!ai) {
      return res.json({
        authorizationCode: 'EMERG-EXEC-2026-BRICS-09',
        issuedAt: new Date().toISOString(),
        classificationLevel: 'URGENT_TIER_1',
        executiveSummary: `National health logistics emergency protocol activated for ${emergencyType || 'Monsoon Vector Surge'} across ${affectedPHCs?.length || 4} PHC zones.`,
        priorityDirectives: [
          'Immediate bypass of routine procurement delays: Activate district fast-track buffer reallocation',
          'Deploy drone UAV corridors for cold-chain antivenom and oxytocin deliveries to flood-isolated PHCs',
          'Enforce 12-hour biometric attendance shift rotations for medical officers and emergency nurses',
          'Establish 24/7 cold-chain telemetry monitoring with automated SMS escalation upon 8°C breach'
        ],
        signOffAuthority: 'National Disaster Health Logistics Directorate'
      });
    }

    const prompt = `Generate an official National Emergency Health Logistics Mobilization Directive for public health authorities:
- Emergency Type: ${emergencyType || 'Monsoon Vector Surge & Flood Isolation'}
- Affected PHCs: ${JSON.stringify(affectedPHCs || ['PHC Narsapur', 'PHC Kadur', 'PHC Belur'])}
- Stockout Vulnerabilities: ${JSON.stringify(stockLevels || { oxytocin: 'Critical', antivenom: '24 hours remaining' })}

Output clear operational directives, legal authorization code, and escalation triggers in JSON format.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            authorizationCode: { type: Type.STRING },
            issuedAt: { type: Type.STRING },
            classificationLevel: { type: Type.STRING },
            executiveSummary: { type: Type.STRING },
            priorityDirectives: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            signOffAuthority: { type: Type.STRING }
          },
          required: ['authorizationCode', 'issuedAt', 'classificationLevel', 'executiveSummary', 'priorityDirectives', 'signOffAuthority']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Emergency Protocol API error:', error);
    res.status(500).json({ error: error.message || 'Protocol generation failed' });
  }
});

// 5. Multi-Turn AI Health Logistics & BRICS Assistant
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { messages, networkContext } = req.body;

    if (!ai) {
      // Deterministic fallback response when key is not set
      const lastUserMsg = messages?.[messages.length - 1]?.text || 'Hello';
      let reply = `[Aegis AI Logistics Officer] Regarding your query: "${lastUserMsg}". Currently monitoring ${networkContext?.totalPHCs || 7} Primary Health Centres across the district. ` +
        `Critical stockouts are flagged at PHC Narsapur and PHC Belur Tribal Post due to monsoon river flooding. Automated UAV drone transfers TX-901 and TX-903 are scheduled to deliver 280 vials of antivenom and oxytocin. Shared BRICS Federated Learning Round #42 remains synchronized.`;
      
      return res.json({ reply });
    }

    const systemInstruction = `You are the AegisHealth Chief AI Logistics & BRICS Epidemiological Assistant.
Your mission is to assist public health officers, disaster managers, and BRICS delegates in real-time primary healthcare resilience, supply chain redistribution, stock-out prevention, and privacy-preserving federated intelligence.
Network Context: ${JSON.stringify(networkContext || {})}.

Keep answers authoritative, concise, structured, and actionable with specific health logistics directives and clinical guidance.`;

    const formattedContents = (messages || []).map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    if (formattedContents.length === 0) {
      formattedContents.push({ role: 'user', parts: [{ text: 'Provide a brief executive status report on current PHC resilience.' }] });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: formattedContents,
      config: {
        systemInstruction,
        temperature: 0.3,
      }
    });

    const reply = response.text || 'Operational response generated.';
    res.json({ reply });
  } catch (error: any) {
    console.error('Chat API error:', error);
    res.status(500).json({ error: error.message || 'Chat assistant failed' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    platform: 'AegisHealth BRICS Federated Health Supply Platform',
    geminiEnabled: Boolean(ai),
    timestamp: new Date().toISOString()
  });
});

// Mount Vite or static server
async function startServer() {
  const distPath = path.resolve(__dirname, 'dist');
  const hasDist = fs.existsSync(distPath);

  if (process.env.NODE_ENV === 'production' && hasDist) {
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, host, () => {
    console.log(`Server listening on ${host}:${port}`);
  });
}

startServer();
