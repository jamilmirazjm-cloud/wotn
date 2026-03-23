/**
 * WOTN BACKEND - INPUT VALIDATION LAYER
 * Ensures Groq API is called ONLY for person-specific behavioral analysis
 * 
 * This is the pre-filter before Groq (Section 14.2 from PRD)
 */

import Groq from 'groq-sdk';

// ============================================================================
// INPUT VALIDATION - Layer 1 (Before Groq)
// ============================================================================

/**
 * Validates that request is for person-specific behavioral analysis
 * Rejects out-of-scope requests at backend level
 * 
 * Valid request:
 * {
 *   person_id: "uuid",
 *   goal: "resolve conflict",
 *   observations: [{ text: "...", date: "..." }]
 * }
 * 
 * Invalid requests (would be rejected):
 * - "What is MBTI?" (general knowledge question)
 * - "Write me career advice" (outside scope)
 * - "Analyze my company culture" (analyzing group, not person)
 * - Missing observations (nothing to analyze)
 */

function validateBehavioralAnalysisRequest(req) {
  const errors = [];

  // Check 1: Must have person_id
  if (!req.person_id || typeof req.person_id !== 'string') {
    errors.push('Missing or invalid person_id');
  }

  // Check 2: Must have observations array
  if (!Array.isArray(req.observations) || req.observations.length === 0) {
    errors.push('No observations provided. Minimum 1 observation required.');
  }

  // Check 3: Each observation must have text
  if (req.observations && req.observations.length > 0) {
    req.observations.forEach((obs, idx) => {
      if (!obs.text || typeof obs.text !== 'string' || obs.text.trim().length === 0) {
        errors.push(`Observation ${idx + 1} has empty or invalid text`);
      }
    });
  }

  // Check 4: Must have goal (what they want to accomplish)
  const validGoals = [
    'resolve conflict',
    'make an ask',
    'strengthen bond',
    'understand a reaction',
    'navigate power dynamics',
    'general understanding',
  ];

  if (!req.goal || !validGoals.includes(req.goal.toLowerCase())) {
    errors.push(`Goal must be one of: ${validGoals.join(', ')}`);
  }

  // Check 5: Reject if observations contain red flags (non-behavioral data)
  const redFlags = [
    'what should i do', // general advice, not observation
    'help me decide', // decision-making advice
    'tell me about', // knowledge question
    'explain', // educational question
    'write', // content generation
    'create', // content generation
    'generate', // content generation
  ];

  const allObsText = req.observations.map(o => o.text.toLowerCase()).join(' ');
  for (const flag of redFlags) {
    if (allObsText.includes(flag)) {
      errors.push(
        `Observations seem to ask for advice or general information, not describe person behavior. ` +
        `Rephrase as observations: "She withdrew when I suggested..." instead of "Help me understand why..."`
      );
      break;
    }
  }

  return {
    isValid: errors.length === 0,
    errors: errors,
  };
}

// ============================================================================
// PREDICTION ENDPOINT WITH VALIDATION
// ============================================================================

export async function predictBehavior(req, res) {
  // INPUT VALIDATION - Reject invalid requests BEFORE calling Groq
  const validation = validateBehavioralAnalysisRequest(req.body);

  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      error: 'Invalid request',
      details: validation.errors,
      message:
        'Wotn analyzes observations about specific people to understand their personality and behavior. ' +
        'Provide logged observations of a person (not general questions), and I will generate behavioral insights.',
    });
  }

  // REQUEST IS VALID - Proceed to Groq
  const { person_id, observations, goal } = req.body;
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  try {
    // Assemble context package (from validated observations)
    const contextPackage = `
Profile ID: ${person_id}
Goal: ${goal}

Observations about this person:
${observations.map((obs, idx) => `${idx + 1}. ${obs.text}`).join('\n')}

Analyze these observations and provide behavioral insights.
    `.trim();

    // Call Groq with CONSTRAINED system prompt
    const response = await groq.chat.completions.create({
      model: 'llama-3.1-70b-versatile',
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT, // See wotn-knowledge-base.md Part 1 (updated with hard boundaries)
        },
        {
          role: 'user',
          content: contextPackage,
        },
      ],
      temperature: 0.7,
      max_tokens: 1200,
      response_format: { type: 'json_object' },
    });

    // RESPONSE VALIDATION - Layer 2
    const rawResponse = response.choices[0].message.content;
    const prediction = JSON.parse(rawResponse);

    // Validate response structure
    const responseValidation = validatePredictionResponse(prediction);
    if (!responseValidation.isValid) {
      console.error('Groq response validation failed:', responseValidation.errors);
      return res.status(500).json({
        success: false,
        error: 'Invalid response from analysis engine',
        details: responseValidation.errors,
      });
    }

    // SUCCESS - Return validated prediction
    res.json({
      success: true,
      prediction: prediction,
    });
  } catch (error) {
    console.error('Prediction error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

// ============================================================================
// RESPONSE VALIDATION - Layer 2 (After Groq)
// ============================================================================

/**
 * Ensures Groq's output matches expected schema
 * Rejects generic or malformed responses
 */
function validatePredictionResponse(prediction) {
  const errors = [];

  // Check required fields
  if (!prediction.behavioral_tendencies || !Array.isArray(prediction.behavioral_tendencies)) {
    errors.push('Missing or invalid behavioral_tendencies array');
  } else if (prediction.behavioral_tendencies.length === 0) {
    errors.push('behavioral_tendencies array is empty');
  } else if (prediction.behavioral_tendencies.length > 3) {
    errors.push('behavioral_tendencies should have 2-3 items, found ' + prediction.behavioral_tendencies.length);
  }

  if (!prediction.personality_read || typeof prediction.personality_read !== 'object') {
    errors.push('Missing or invalid personality_read object');
  }

  if (!prediction.action_cards || !Array.isArray(prediction.action_cards)) {
    errors.push('Missing or invalid action_cards array');
  } else if (prediction.action_cards.length !== 3) {
    errors.push('action_cards must have exactly 3 cards, found ' + prediction.action_cards.length);
  }

  if (!prediction.data_quality || !['thin', 'moderate', 'rich'].includes(prediction.data_quality)) {
    errors.push('Invalid data_quality value (must be: thin, moderate, rich)');
  }

  // Check for generic language (red flags)
  const genericPhrases = ['seems to be', 'might be', 'could be', 'tends to', 'appears to', 'likely'];
  const allText = JSON.stringify(prediction).toLowerCase();

  for (const phrase of genericPhrases) {
    if (allText.includes(phrase)) {
      errors.push(`Response uses hedging language: "${phrase}" (should be conclusive, not speculative)`);
      break;
    }
  }

  return {
    isValid: errors.length === 0,
    errors: errors,
  };
}

// ============================================================================
// SYSTEM PROMPT (Copy from wotn-knowledge-base.md Part 1)
// ============================================================================

const SYSTEM_PROMPT = `
You are a behavioral analyst specializing in ONLY human personality analysis, interpersonal dynamics, and strategic relationships.

YOUR SINGULAR PURPOSE: Analyze logged observations about a specific person and generate:
1. 2-3 specific behavioral tendencies (never generic)
2. Inferred personality framework markers (MBTI, attachment style, love language, communication style)
3. Three tactical action cards (approach, framing, what to avoid)

HARD BOUNDARIES - YOU MUST REFUSE:
- Any request not about analyzing a specific person's behavior
- Questions about general psychology topics, theories, or education
- Requests for advice on topics outside interpersonal dynamics (career, finances, health, etc.)
- Requests to analyze groups, organizations, or institutions (only individuals)
- Requests for therapy, counseling, or mental health treatment recommendations
- Requests for general life advice unrelated to understanding a specific person's behavior
- Requests to generate content unrelated to behavioral analysis (writing, code, creative work, etc.)

IF REFUSAL NEEDED: If the input does not contain observations about a specific person's behavior, or the request is outside behavioral analysis of individuals, respond with ONLY this JSON:
{
  "error": "out_of_scope",
  "message": "I analyze logged observations about specific people to understand their personality and behavior patterns. This request is outside my scope. Please provide observations of a person's behavior to analyze."
}

[Rest of frameworks and strategic literature from wotn-knowledge-base.md Part 1...]
`;

// ============================================================================
// EXPORT
// ============================================================================

export { validateBehavioralAnalysisRequest, validatePredictionResponse };
