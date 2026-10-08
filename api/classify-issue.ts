import { GoogleGenAI, Type } from '@google/genai';

function fallbackClassify(text: string, locationInput?: string, manualCat?: string) {
  const lower = (text + ' ' + (locationInput || '') + ' ' + (manualCat || '')).toLowerCase();
  
  const flatMatch = text.match(/(?:flat|apartment|unit|#)\s*([A-Za-z0-9\-]+)/i) || 
                     text.match(/\b([A-C]\s*[-/]?\s*\d{2,4}|\d{3,4})\b/i);
  const detectedLocation = flatMatch ? flatMatch[0].trim() : (locationInput || 'Colony Grounds');

  if (lower.includes('water') || lower.includes('leak') || lower.includes('pipe') || lower.includes('drain') || lower.includes('sewage') || lower.includes('tap') || lower.includes('tank')) {
    const isUrgent = lower.includes('burst') || lower.includes('flood') || lower.includes('overflow');
    return {
      department: 'Water',
      issueType: lower.includes('leak') ? 'Leakage' : lower.includes('drain') ? 'Drainage' : 'Supply Shortage',
      priority: isUrgent ? 'urgent' : 'high',
      location: detectedLocation,
      confidence: 0.92,
      summary: `Water department issue reported at ${detectedLocation}`
    };
  }

  if (lower.includes('electric') || lower.includes('light') || lower.includes('wire') || lower.includes('power') || lower.includes('mcb') || lower.includes('spark') || lower.includes('voltage') || lower.includes('streetlight')) {
    const isUrgent = lower.includes('spark') || lower.includes('shock') || lower.includes('blackout');
    return {
      department: 'Electrical',
      issueType: lower.includes('streetlight') ? 'Streetlight' : lower.includes('spark') ? 'Short Circuit' : 'Power Outage',
      priority: isUrgent ? 'urgent' : 'high',
      location: detectedLocation,
      confidence: 0.91,
      summary: `Electrical maintenance required at ${detectedLocation}`
    };
  }

  if (lower.includes('garbage') || lower.includes('trash') || lower.includes('waste') || lower.includes('clean') || lower.includes('dirt') || lower.includes('smell') || lower.includes('dustbin')) {
    return {
      department: 'Sanitation',
      issueType: 'Waste Collection & Sanitation',
      priority: 'normal',
      location: detectedLocation,
      confidence: 0.88,
      summary: `Sanitation request logged for ${detectedLocation}`
    };
  }

  if (lower.includes('lift') || lower.includes('elevator')) {
    return {
      department: 'Maintenance',
      issueType: 'Elevator / Lift Malfunction',
      priority: 'urgent',
      location: detectedLocation,
      confidence: 0.95,
      summary: `Elevator service alert at ${detectedLocation}`
    };
  }

  if (lower.includes('guard') || lower.includes('security') || lower.includes('cctv') || lower.includes('theft') || lower.includes('stranger') || lower.includes('gate') || lower.includes('parking')) {
    return {
      department: 'Security',
      issueType: lower.includes('parking') ? 'Parking Violation' : 'Gate & Security',
      priority: 'high',
      location: detectedLocation,
      confidence: 0.89,
      summary: `Security concern at ${detectedLocation}`
    };
  }

  return {
    department: manualCat || 'Maintenance',
    issueType: 'General Colony Maintenance',
    priority: 'normal',
    location: detectedLocation,
    confidence: 0.75,
    summary: `Maintenance issue at ${detectedLocation}`
  };
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ error: 'Method not allowed' }));
  }

  try {
    const body = req.body || {};
    const { text, location, manualCategory } = body;

    if (!text || typeof text !== 'string') {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ error: 'Text prompt required' }));
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
      try {
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        });

        const prompt = `You are the AI Operations Classifier for a residential colony / society.
Analyze the following resident issue report and extract structured classification details.
Issue text: "${text}"
Reported location context: "${location || 'Not specified'}"
User selected fallback category: "${manualCategory || 'General'}"

Allowed departments: ["Water", "Electrical", "Sanitation", "Maintenance", "Security"]
Allowed priorities: ["low", "normal", "high", "urgent"]

Respond in JSON with:
- department: one of the allowed departments
- issueType: granular name (e.g. "Leakage", "Streetlight", "Garbage Overflow", "Elevator", "Power Outage", "Sewage", "CCTV", "Water Shortage")
- priority: one of the allowed priorities
- location: specific flat, block, gate or landmark mentioned (or "Colony Grounds" if none)
- confidence: number between 0.70 and 0.99
- summary: one concise sentence summarizing the actionable issue for the dispatch worker`;

        const aiResponse = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                department: { type: Type.STRING },
                issueType: { type: Type.STRING },
                priority: { type: Type.STRING },
                location: { type: Type.STRING },
                confidence: { type: Type.NUMBER },
                summary: { type: Type.STRING },
              },
              required: ['department', 'issueType', 'priority', 'location', 'confidence', 'summary'],
            },
          },
        });

        if (aiResponse.text) {
          const result = JSON.parse(aiResponse.text.trim());
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify(result));
        }
      } catch (aiErr) {
        console.warn('Gemini classification fallback invoked:', aiErr);
      }
    }

    const fallback = fallbackClassify(text, location, manualCategory);
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify(fallback));
  } catch (err: any) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ error: err?.message || 'Server classification error' }));
  }
}
