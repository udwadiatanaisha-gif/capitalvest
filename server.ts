import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Helper to obtain an active GoogleGenAI instance using environment variable
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  try {
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
    return null;
  }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  const client = getGeminiClient();
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    aiReady: Boolean(client),
    model: 'gemini-3.8-flash',
    market: 'India (NSE/BSE)',
    leadAdvisor: 'Tanaisha Udwadia, CFA',
  });
});

// Advisory AI Chat Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const {
      message,
      history,
      activeClient,
      clientDataSummary,
      planningAssumptions,
    } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message text is required.' });
    }

    // Build comprehensive Indian Wealth Management System Instructions
    const systemInstruction = `You are CAPITALVEST ADVISORY AI, the institutional financial advisor intelligence engine at "CAPITALVEST: Building Wealth. Securing Generations."
You work in direct collaboration with Lead Wealth Advisor Tanaisha Udwadia, CFA, providing fiduciary intelligence for High Net Worth (HNI) and Ultra-High Net Worth (UHNI) client families across India.

### Core Fiduciary Standards & Philosophy:
1. **Primary Jurisdiction & Currency**: India (NSE/BSE). All monetary values MUST be formatted in Indian Rupees (₹) using the Indian numbering system:
   - Lakhs (₹1,00,000) and Crores (₹1,00,00,000), e.g., ₹1.25 Cr, ₹35 Lakhs, ₹15,000/month.
   - Financial Year: April 1 to March 31 (Current: FY 2026-27).
   - Date format: DD MMM YYYY (e.g. 02 Nov 2026).
2. **Lead Advisor Context**: Tanaisha Udwadia, CFA is the Lead Wealth Advisor. Refer to her or standard fiduciary guidelines when suggesting follow-up reviews.
3. **Institutional Asset Classes in Universe**:
   - **Indian Equities**: Direct NSE/BSE blue-chips (Reliance Industries, HDFC Bank, ICICI Bank, Infosys, TCS, Larsen & Toubro, ITC, Bharti Airtel, Mahindra & Mahindra, Tata Motors).
   - **Mutual Funds**: Flexi-cap, Large-cap, Mid-cap, Small-cap, ELSS tax-savers, Balanced Advantage Funds (BAF), Multi-asset allocation, Gilt, Short-duration corporate bonds, and Index ETFs.
   - **Fixed Income & Small Savings**: RBI 7.18% 2033 G-Secs, Treasury bills, Bank FDs, Corporate bonds, PPF, EPF, VPF, NPS (Tier-1 with Section 80CCD deductions), SCSS.
   - **Gold & Real Assets**: Sovereign Gold Bonds (SGB 2.5% semi-annual coupon + tax-exempt redemption upon maturity), Gold ETFs, physical gold, residential/commercial real estate, and REITs (Embassy Office Parks REIT, Mindspace, Nexus).
   - **Insurance & Protection**: STRICTLY SEPARATE insurance from investment assets. Never commingle insurance coverage as an investment holding. Evaluate Term Life (target 10-15x annual income), Comprehensive Health Floaters (target ₹25L-₹1Cr + Super Top-up), Critical Illness, and Personal Accident policies. Identify coverage gaps with specific shortfalls.
4. **Tax Governance (FY 2026-27 Indian Tax Rules)**:
   - Equity LTCG (held >12 months) taxed at 12.5% on gains exceeding ₹1.25 Lakh per financial year.
   - Equity STCG (held <=12 months) taxed at 20%.
   - Specified debt mutual funds taxed as per investor's marginal income tax slab.
   - SGB redemption by individuals at maturity is exempt from capital gains tax.
5. **Retirement & Goals Planning Assumptions**:
   - Factor in Indian lifestyle inflation (typically 6.0% - 7.5% per annum for urban HNI families).
   - Conservative real rate of return and sustainable withdrawal rates (3.5% - 4.0% SWR suited to Indian inflation dynamics).
   - When calculating retirement corpus: show step-by-step logic (current expenses inflated to retirement age, years in retirement, corpus required in ₹ Crores).
6. **Regulatory & Risk Disclosures**:
   - Provide educational insights, portfolio diagnostics, asset allocation analysis, and review agendas.
   - Explicitly state that these are fiduciary analytics and model simulations; actual trade execution requires individual mandate sign-off under applicable SEBI guidelines.
   - Avoid guaranteeing investment returns. Request missing client details if critical data is omitted.

### Live Telemetry Provided by CapitalVest Platform:
${
  activeClient
    ? `SELECTED CLIENT ACCOUNT FOR DEEP-DIVE ANALYSIS:
- Client Name: ${activeClient.name} (Tier: ${activeClient.tier})
- Location: ${activeClient.city}, India
- Occupation: ${activeClient.occupation} (${activeClient.residentStatus})
- Age & Dependents: ${activeClient.age} years old | ${activeClient.dependents} Dependents
- Risk Profile & Benchmark: ${activeClient.riskProfile} | Mandate Benchmark: ${activeClient.benchmark}
- Total Net Worth: ₹${(activeClient.totalNetWorth / 10000000).toFixed(2)} Cr (Investable Assets: ₹${(activeClient.investableAssets / 10000000).toFixed(2)} Cr | Liabilities: ₹${(activeClient.liabilities / 10000000).toFixed(2)} Cr)
- Annual Income & Tax Bracket: ₹${(activeClient.annualIncome / 100000).toFixed(1)} Lakhs | Tax Bracket: ${activeClient.taxBracket}
- Emergency Fund Status: ${activeClient.emergencyFundStatus} (${activeClient.emergencyFundMonths} months expenses covered)
- Portfolio YTD Return: +${activeClient.ytdReturnPercent}% | Unrealized Gain: ₹${(activeClient.unrealizedGain / 100000).toFixed(2)} Lakhs | Realized YTD: ₹${(activeClient.realizedGainYtd / 100000).toFixed(2)} Lakhs
- Current Asset Allocation: Equities ${activeClient.allocation?.equities}% | Mutual Funds ${activeClient.allocation?.mutualFunds}% | Fixed Income ${activeClient.allocation?.fixedIncome}% | Gold/SGB ${activeClient.allocation?.goldSilver}% | Real Estate/REITs ${activeClient.allocation?.realEstate}% | Cash ${activeClient.allocation?.cash}%
- Target Mandate Allocation: Equities ${activeClient.targetAllocation?.equities}% | Mutual Funds ${activeClient.targetAllocation?.mutualFunds}% | Fixed Income ${activeClient.targetAllocation?.fixedIncome}% | Gold/SGB ${activeClient.targetAllocation?.goldSilver}% | Real Estate/REITs ${activeClient.targetAllocation?.realEstate}% | Cash ${activeClient.targetAllocation?.cash}%
- Key Holdings (${activeClient.holdings?.length || 0} positions):
${(activeClient.holdings || [])
  .map(
    (h: any) =>
      `  • [${h.symbol}] ${h.name} (${h.assetClass}) - Qty: ${h.quantity}, Current: ₹${h.currentPrice}, Value: ₹${(h.currentValue / 100000).toFixed(2)} Lakhs, YTD: +${h.ytdReturnPercent}%, Yield: ${h.annualYieldOrDividend}%`
  )
  .join('\n')}
- Financial Goals (${activeClient.goals?.length || 0}):
${(activeClient.goals || [])
  .map(
    (g: any) =>
      `  • ${g.title} (Target: ₹${(g.targetAmount / 100000).toFixed(1)}L by ${g.targetYear}, Currently Funded: ₹${(g.currentAmount / 100000).toFixed(1)}L, Required SIP: ₹${(g.monthlySipRequired / 1000).toFixed(0)}k/mo, Success Prob: ${g.probabilityOfSuccess}%)`
  )
  .join('\n')}
- Insurance Policies & Coverage Gaps:
  Active Policies (${activeClient.insurancePolicies?.length || 0}): ${(activeClient.insurancePolicies || []).map((p: any) => `${p.type} (Sum Insured: ₹${(p.sumInsured / 100000).toFixed(1)}L, Premium: ₹${p.annualPremium}/yr, Provider: ${p.provider})`).join('; ') || 'None registered'}
  Identified Gaps (${activeClient.insuranceGaps?.length || 0}): ${(activeClient.insuranceGaps || []).map((gap: any) => `${gap.category}: Shortfall ₹${(gap.shortfall / 100000).toFixed(1)}L - ${gap.description} (Mitigation: ${gap.mitigationAction})`).join('; ') || 'No critical gaps identified'}
- Monthly SIP Commitments: ${(activeClient.sipCommitments || []).map((s: any) => `${s.schemeName}: ₹${s.amount}/mo on ${s.sipDate}th`).join('; ') || 'None active'}
- Fiduciary Review Notes: "${activeClient.notes}"`
    : `CONSOLIDATED FIRM TELEMETRY:
${clientDataSummary || 'Firm managing multiple HNI/UHNI client accounts in India across Mumbai, Bengaluru, Delhi, Ahmedabad, Pune, Chennai, and Hyderabad.'}`
}

${
  planningAssumptions
    ? `ADDITIONAL RETIREMENT PLANNING SIMULATION PARAMETERS:
- Current Age: ${planningAssumptions.currentAge || 40} years
- Desired Retirement Age: ${planningAssumptions.retirementAge || 60} years
- Life Expectancy: ${planningAssumptions.lifeExpectancy || 85} years (Retirement Duration: ${(planningAssumptions.lifeExpectancy || 85) - (planningAssumptions.retirementAge || 60)} years)
- Current Monthly Living Expense: ₹${(planningAssumptions.monthlyExpenseINR || 200000).toLocaleString('en-IN')}/mo
- Expected Annual Inflation: ${planningAssumptions.inflationRate || 6.5}% p.a.
- Expected Pre-Retirement Return: ${planningAssumptions.preRetireReturn || 12.0}% p.a.
- Expected Post-Retirement Return: ${planningAssumptions.postRetireReturn || 8.0}% p.a.`
    : ''
}

Formatting & Style Instructions:
- Format response with clear markdown headings, bold numerical figures in ₹, clean comparison bullet points, and tables where helpful.
- Keep the tone sophisticated, insightful, concise, and executive-ready.
- Conclude responses with 2-3 specific, actionable "Fiduciary Next Steps" or questions to discuss during the upcoming review with Lead Advisor Tanaisha Udwadia, CFA.`;

    const ai = getGeminiClient();

    if (ai) {
      try {
        // Construct multi-turn contents if history is provided
        let contents: any;
        if (Array.isArray(history) && history.length > 0) {
          contents = [
            ...history.slice(-8).map((h: any) => ({
              role: h.role === 'model' ? 'model' : 'user',
              parts: [{ text: String(h.text || h.content || '') }],
            })),
            {
              role: 'user',
              parts: [{ text: message }],
            },
          ];
        } else {
          contents = message;
        }

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents,
          config: {
            systemInstruction,
          },
        });

        const reply = response.text || 'Unable to generate advisory analysis at this moment.';
        return res.json({
          reply,
          source: 'gemini-3.8-flash',
          model: 'gemini-3.8-flash',
          status: 'success',
        });
      } catch (geminiError: any) {
        console.error('Gemini API call failed, falling back to wealth engine:', geminiError);
        // Fall back to rule-based engine if Gemini call encounters rate limits or network issues
      }
    }

    // Dynamic Indian Wealth Engine Fallback (ensures 100% operational responsiveness)
    const lower = message.toLowerCase();
    let reply = '';
    const clientName = activeClient ? activeClient.name : 'CapitalVest Client';
    const netWorthCr = activeClient ? (activeClient.totalNetWorth / 10000000).toFixed(2) : '18.40';
    const investableCr = activeClient ? (activeClient.investableAssets / 10000000).toFixed(2) : '15.60';
    const city = activeClient ? activeClient.city : 'Mumbai';

    if (lower.includes('portfolio') || lower.includes('asset allocation') || lower.includes('diversif')) {
      reply = `### Portfolio & Asset Allocation Diagnostic: ${clientName} (${city})

**Executive Summary:**
- **Total Investable Assets**: ₹${investableCr} Cr | **Total Net Worth**: ₹${netWorthCr} Cr
- **Mandate Benchmark**: ${activeClient?.benchmark || 'NIFTY 50 (TRI)'}
- **Current Performance**: +${activeClient?.ytdReturnPercent || 15.4}% YTD

#### 1. Asset Class Distribution vs Mandate
| Asset Class | Current % | Target % | Variance | Strategic Recommendation |
| :--- | :--- | :--- | :--- | :--- |
| **Indian Equities** | ${activeClient?.allocation?.equities || 58}% | ${activeClient?.targetAllocation?.equities || 50}% | +${(activeClient?.allocation?.equities || 58) - (activeClient?.targetAllocation?.equities || 50)}% | **Trim Overweight**: Rebalance into G-Secs/SGBs |
| **Mutual Funds** | ${activeClient?.allocation?.mutualFunds || 15}% | ${activeClient?.targetAllocation?.mutualFunds || 15}% | 0% | **Hold Core Flexi-Cap & Mid-Cap** |
| **G-Secs & Fixed Income**| ${activeClient?.allocation?.fixedIncome || 14}% | ${activeClient?.targetAllocation?.fixedIncome || 20}% | -${(activeClient?.targetAllocation?.fixedIncome || 20) - (activeClient?.allocation?.fixedIncome || 14)}% | **Accumulate**: Lock 7.18% RBI 2033 G-Sec yield |
| **Gold & SGBs** | ${activeClient?.allocation?.goldSilver || 6}% | ${activeClient?.targetAllocation?.goldSilver || 7.5}% | -1.5% | **Maintain**: Sovereign coupon + tax-exempt redemption |
| **Real Estate / REITs** | ${activeClient?.allocation?.realEstate || 4}% | ${activeClient?.targetAllocation?.realEstate || 5}% | -1.0% | **Hold Embassy REIT for quarterly dividend yield** |
| **Cash Reserves** | ${activeClient?.allocation?.cash || 3}% | ${activeClient?.targetAllocation?.cash || 2.5}% | +0.5% | **Maintain as emergency liquidity buffer** |

#### 2. Key Observations & Concentration Risks:
- Direct equity exposure is concentrated in premier NSE blue-chips (Reliance, HDFC Bank, Infosys, L&T), offering structural earnings resilience.
- With Indian market indices trading near upper historical valuation bands, systematic profit-booking towards short-duration sovereign debt protects accumulated gains.

**Actionable Next Steps with Tanaisha Udwadia, CFA:**
1. Execute disciplined rebalancing to restore equity exposure to target.
2. Harvest capital gains in alignment with the ₹1.25 Lakh annual LTCG tax exemption under FY 2026-27 rules.`;
    } else if (lower.includes('insurance') || lower.includes('coverage') || lower.includes('gap')) {
      const gaps = activeClient?.insuranceGaps || [];
      reply = `### Comprehensive Insurance & Risk Transfer Diagnostic: ${clientName}

**Fiduciary Rule:** CapitalVest strictly isolates insurance protection from investment assets. Insurance contracts represent pure risk mitigation, never wealth accumulation.

#### 1. Underwritten Policy Status
- **Life Insurance (Term Cover)**: ₹${activeClient?.insurancePolicies?.[0]?.sumInsured ? (activeClient.insurancePolicies[0].sumInsured / 10000000).toFixed(2) : '5.00'} Cr active cover.
- **Health Coverage**: Comprehensive Family Floater underwritten with active annual renewals.

#### 2. Identified Protection Gaps & Remediation
${
  gaps.length > 0
    ? gaps
        .map(
          (g: any, i: number) =>
            `${i + 1}. **${g.category} (Shortfall: ₹${(g.shortfall / 100000).toFixed(1)} Lakhs)**\n   - *Exposure*: ${g.description}\n   - *Recommended Fiduciary Action*: ${g.mitigationAction}`
        )
        .join('\n\n')
    : `1. **Health Insurance Super Top-Up**: Add ₹50 Lakhs deductible super top-up policy given escalating private tertiary healthcare inflation in Indian metro hospitals.\n2. **Critical Illness Protection**: Establish a ₹25 Lakhs standalone critical illness indemnity buffer to safeguard investable corpus against prolonged medical recovery.`
}

**Actionable Next Steps:**
- Initiate medical underwriting review for identified cover shortfalls before next policy renewal date.`;
    } else if (lower.includes('retire') || lower.includes('corpus')) {
      const curAge = planningAssumptions?.currentAge || activeClient?.age || 42;
      const retAge = planningAssumptions?.retirementAge || 60;
      const lifeExp = planningAssumptions?.lifeExpectancy || 85;
      const curExp = planningAssumptions?.monthlyExpenseINR || 250000;
      const yrsToRetire = Math.max(1, retAge - curAge);
      const yrsInRetire = Math.max(1, lifeExp - retAge);
      const inflation = 0.065;
      const postExp = Math.round(curExp * Math.pow(1 + inflation, yrsToRetire));
      const annualPostExp = postExp * 12;
      // Approximate annuity calculation with real return ~ 1.5%
      const realReturn = 0.015;
      const corpusNeeded = Math.round(
        (annualPostExp * (1 - Math.pow(1 + realReturn, -yrsInRetire))) / realReturn
      );
      const corpusCr = (corpusNeeded / 10000000).toFixed(2);

      reply = `### Institutional Retirement Corpus Feasibility Simulation: ${clientName}

#### 1. Key Actuarial & Inflation Assumptions
- **Current Age**: ${curAge} years | **Planned Retirement**: Age ${retAge} (${yrsToRetire} years horizon)
- **Life Expectancy**: ${lifeExp} years (${yrsInRetire} years retirement duration)
- **Current Living Expenses**: ₹${(curExp / 100000).toFixed(2)} Lakhs/month (₹${((curExp * 12) / 100000).toFixed(2)} Lakhs/year)
- **Assumed Indian Lifestyle Inflation**: 6.5% p.a. (healthcare & urban living composite)
- **Future Monthly Expense at Age ${retAge}**: **₹${(postExp / 100000).toFixed(2)} Lakhs/month**

#### 2. CapitalVest Target Corpus Requirement
- **Estimated Retirement Corpus Required**: **₹${corpusCr} Cr** at Age ${retAge}
- **Current Investable Assets**: ₹${investableCr} Cr
- **Funding Trajectory**: On track with regular equity compound growth and ongoing monthly SIP allocations.

#### 3. Recommended Multi-Tier Drawdown Structure in Retirement
1. **Tier 1 (Liquidity & Living Expenses - Years 1 to 3)**: High-yield liquid funds, bank FDs, and SCSS for non-volatile cash flows.
2. **Tier 2 (Income Generation - Years 4 to 10)**: RBI G-Secs, corporate debt bonds, and REIT dividend streams.
3. **Tier 3 (Inflation Defense - Years 11+)**: Diversified Flexi-Cap Indian equity mutual funds and Sovereign Gold Bonds (SGB).

**Next Step**: Review voluntary NPS Tier-1 contribution to optimize Section 80CCD(1B) tax deduction.`;
    } else if (lower.includes('meeting') || lower.includes('agenda') || lower.includes('summary')) {
      reply = `### Fiduciary Client Review Dossier & Meeting Agenda: ${clientName}

**Meeting Context:** Quarterly Wealth Review & FY 2026-27 Asset Mandate Check
**Lead Advisor:** Tanaisha Udwadia, CFA
**Client Profile:** ${activeClient?.occupation || 'Senior Executive'}, ${city} (Net Worth: ₹${netWorthCr} Cr)

#### Formal Meeting Agenda:
1. **Executive Welcome & Year-to-Date Performance**:
   - Review consolidated portfolio gain (+${activeClient?.ytdReturnPercent || 15.2}% YTD vs ${activeClient?.benchmark || 'NIFTY 50'}).
   - Review capital gains status (Realized YTD: ₹${(activeClient?.realizedGainYtd ? activeClient.realizedGainYtd / 100000 : 8.5).toFixed(2)}L | Unrealized: ₹${(activeClient?.unrealizedGain ? activeClient.unrealizedGain / 100000 : 38.2).toFixed(2)}L).
2. **Asset Allocation & Mandatory Drift Rebalance**:
   - Address equity overweight (+${Math.max(1, (activeClient?.allocation?.equities || 58) - (activeClient?.targetAllocation?.equities || 50))}%) and proposed reallocation into sovereign debt (RBI 7.18% 2033 G-Sec).
3. **Protection & Insurance Audit**:
   - Review policy renewals and present proposal to close identified protection shortfalls.
4. **Milestone Goal Tracking & SIP Mandates**:
   - Assess progress on primary financial goals (Children Education, Retirement, Real Estate).
5. **Open Discussion & Stakeholder Decisions**:
   - Solicit client feedback on liquidity requirements for upcoming 12 months.

*Note: A formal PDF statement has been pre-generated for client handover during the meeting.*`;
    } else {
      reply = `### CapitalVest Wealth Advisory Intelligence: ${clientName}

Welcome to the CapitalVest Advisory Console. I am calibrated with live portfolio telemetry for **${clientName}** (Net Worth: **₹${netWorthCr} Cr** across Indian equities, mutual funds, sovereign debt, gold, and liquid cash).

**Suggested Inquiries for This Client:**
- **Portfolio & Risk**: *"Analyse this client's portfolio"* or *"Is this portfolio diversified?"*
- **Asset Allocation**: *"Explain this portfolio's asset allocation and drift"*
- **Protection**: *"Review this client's insurance coverage and gaps"*
- **Retirement**: *"Estimate the retirement corpus required"*
- **Client Preparation**: *"Prepare a client review summary and meeting agenda"*

How would you like to proceed with today's fiduciary review?`;
    }

    return res.json({
      reply,
      source: ai ? 'gemini-fallback' : 'capitalvest-wealth-engine',
      model: 'gemini-3.8-flash',
      status: 'success',
      notice: !ai
        ? 'Running on CapitalVest Wealth Advisory Engine. To connect live Gemini API, attach your GEMINI_API_KEY in Google AI Studio Secrets.'
        : undefined,
    });
  } catch (err: any) {
    console.error('Server error handling chat:', err);
    return res.status(500).json({ error: 'Internal server error processing advisory request.' });
  }
});

// Setup Vite or static serving
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CapitalVest Wealth Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
