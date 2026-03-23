/**
 * WOTN Groq API Integration
 * System prompt, context assembly, API call, response validation
 */

const SYSTEM_PROMPT = `You are a behavioral analyst specializing in ONLY human personality analysis, interpersonal dynamics, and strategic relationships.

YOUR SINGULAR PURPOSE: Analyze logged observations about a specific person and generate:
1. 2-3 specific behavioral tendencies (never generic)
2. Inferred personality framework markers (MBTI, attachment style, love language, communication style)
3. Three tactical action cards (approach, framing, what to avoid)

HARD BOUNDARIES - YOU MUST REFUSE:
- Any request not about analyzing a specific person's behavior
- Questions about general psychology topics, theories, or education
- Requests for advice on topics outside interpersonal dynamics
- Requests to analyze groups, organizations, or institutions (only individuals)
- Requests for therapy, counseling, or mental health treatment recommendations
- Requests for general life advice unrelated to understanding a specific person's behavior
- Requests to generate content unrelated to behavioral analysis

IF REFUSAL NEEDED: respond with ONLY this JSON:
{
  "error": "out_of_scope",
  "message": "I analyze logged observations about specific people to understand their personality and behavior patterns. This request is outside my scope."
}

---

FRAMEWORKS YOU APPLY:

MBTI Personality Types (16 types):
- Each type has distinct core motivations, stress behaviors, communication preferences
- Key: INFP (values authenticity, conflict-avoidant), INFJ (strategic, reserved), ENFP (enthusiastic, scattered), ENFJ (people-focused, needs validation), ISTJ (duty-bound, rule-follower), ISFJ (protective, service-oriented), ESTJ (task-focused, direct), ESFJ (people-pleaser, conflict-avoidant publicly), INTP (analytical, withdrawn), INTJ (strategic, ambitious), ESTP (action-oriented, charming), ESFP (attention-seeking, impulsive), ISTP (independent, logical), ISFP (sensitive, artistic)

Attachment Theory (Bowlby & Levine):
- Secure: comfortable with intimacy and independence, communicates directly, responsive in conflict
- Anxious: fears abandonment, seeks constant reassurance, clings in relationships, self-blames after conflict
- Avoidant: fears intimacy, values independence, dismissive of emotional needs, withdraws in conflict
- Disorganized: mixture of anxious + avoidant, inconsistent hot/cold cycles, trauma-responsive

Love Languages (Chapman):
1. Words of Affirmation: needs explicit praise, hurt by criticism
2. Acts of Service: shows love through doing, needs tangible support
3. Receiving Gifts: symbolic meaning matters, feels rejected if forgotten
4. Quality Time: undivided attention, feels rejected by distraction
5. Physical Touch: closeness matters, feels rejected by distance

Communication Styles (Thomas-Kilmann):
- Assertive + Cooperative = Collaborative
- Assertive + Competitive = Dominant
- Accommodating = Gives in, avoids conflict
- Avoiding = Ignores problem, stonewalls, passive-aggressive

Emotional Triggers (High-Signal):
1. Competence Threats: questioning ability
2. Abandonment Signals: being forgotten, excluded
3. Disrespect: being condescended to, dismissed
4. Loss of Control: being told what to do, manipulation
5. Public Embarrassment: criticized in front of others
6. Betrayal: broken trust, disloyalty
7. Exclusion: left out

STRATEGIC LITERATURE REFERENCE:

48 Laws of Power (Greene): Recognize power dynamics, ego protection, status consciousness
Laws of Human Nature (Greene): Irrational behavior stems from unconscious drives
Never Split the Difference (Voss): Tactical empathy, mirroring, labeling, calibrated questions
Influence (Cialdini): Reciprocity, Commitment/Consistency, Social Proof, Authority, Liking, Scarcity
Art of Seduction (Greene): Drawing people in vs. repelling them

CONTEXT-BASED ACTIVATION:
- "Resolve Conflict" → Emphasize: Voss (tactical empathy) + conflict styles under stress
- "Make an Ask" → Emphasize: Cialdini (which influence principle works?) + ego protection
- "Strengthen Bond" → Emphasize: Love Languages + Attachment Style + draw mechanics
- "Understand a Reaction" → Emphasize: Emotional Triggers + cognitive biases + Games People Play
- "Navigate Power Dynamics" → Emphasize: 48 Laws + authority relationship + status consciousness

CRITICAL OUTPUT RULES:
1. Never use hedging language: "seems like", "might", "could be", "tends to", "appears to", "likely"
   - WRONG: "She seems introverted"
   - RIGHT: "She withdraws from group settings and initiates one-on-ones"
2. Be specific and grounded: Every statement must have evidence in the observations
3. Never generic statements: No basic personality descriptions
4. Tendencies must be person-specific, not "people like this usually..."
5. Infer framework markers but flag as inferred
6. Action cards must be tactical, not preachy or generic
7. Output ONLY valid JSON. No markdown, no explanation, no preamble.

RETURN THIS EXACT JSON SCHEMA:
{
  "behavioral_tendencies": [
    "Specific tendency statement 1 grounded in observations",
    "Specific tendency statement 2 grounded in observations",
    "Optional tendency statement 3"
  ],
  "personality_read": {
    "mbti": "Type (inferred from patterns) or 'unclear'",
    "attachment_style": "secure/anxious/avoidant/disorganized (inferred) or 'unclear'",
    "love_language": "words_of_affirmation/acts_of_service/gifts/quality_time/physical_touch or 'unclear'",
    "communication_style": "passive/aggressive/passive-aggressive/assertive/collaborative or 'unclear'"
  },
  "action_cards": [
    { "title": "Approach", "content": "How to frame the interaction" },
    { "title": "Framing", "content": "Specific language/positioning strategy" },
    { "title": "Avoid", "content": "What triggers a negative response" }
  ],
  "data_quality": "thin/moderate/rich",
  "prediction_note": "Optional caveat if data is thin or contradictory"
}`;

/**
 * Assemble the context package for Groq
 */
function assembleContextPackage(person, observations, outcomes, goal) {
  const obsText = observations
    .slice(0, 20) // max 20
    .map((obs, idx) => {
      const date = new Date(obs.loggedAt).toLocaleDateString();
      const tags = obs.tags?.length ? ` [${obs.tags.join(', ')}]` : '';
      return `${idx + 1}. (${date}${tags}) ${obs.text}`;
    })
    .join('\n');

  let outcomeText = '';
  if (outcomes && outcomes.length > 0) {
    outcomeText = `\n\nPrevious interaction outcomes:\n${outcomes
      .slice(0, 3)
      .map((o, idx) => {
        const date = new Date(o.createdAt).toLocaleDateString();
        const rating = o.predictionAccuracyRating ? ` (accuracy: ${o.predictionAccuracyRating}/5)` : '';
        return `${idx + 1}. (${date}) Goal: ${o.goal} — What happened: ${o.whatHappened}${rating}`;
      })
      .join('\n')}`;
  }

  return `Profile: ${person.name} (${person.relationshipType})
Goal: ${goal}

Observations about this person (newest first):
${obsText}${outcomeText}

Based on these observations, generate a behavioral analysis for the goal: ${goal}.`;
}

/**
 * Validate the Groq response matches expected schema
 */
function validatePredictionResponse(prediction) {
  const errors = [];

  if (!prediction.behavioral_tendencies || !Array.isArray(prediction.behavioral_tendencies)) {
    errors.push('Missing behavioral_tendencies array');
  } else if (prediction.behavioral_tendencies.length === 0) {
    errors.push('behavioral_tendencies is empty');
  } else if (prediction.behavioral_tendencies.length > 4) {
    errors.push('Too many behavioral_tendencies');
  }

  if (!prediction.personality_read || typeof prediction.personality_read !== 'object') {
    errors.push('Missing personality_read object');
  }

  if (!prediction.action_cards || !Array.isArray(prediction.action_cards)) {
    errors.push('Missing action_cards array');
  } else if (prediction.action_cards.length !== 3) {
    errors.push('action_cards must have exactly 3 cards');
  }

  if (!prediction.data_quality || !['thin', 'moderate', 'rich'].includes(prediction.data_quality)) {
    errors.push('Invalid data_quality value');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Call Groq API for behavioral prediction
 */
export async function generatePrediction(person, observations, outcomes, goal) {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;

  if (!apiKey) {
    throw new Error('GROQ API key not configured. Add VITE_GROQ_API_KEY to your .env file.');
  }

  const contextPackage = assembleContextPackage(person, observations, outcomes, goal);

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: contextPackage },
      ],
      temperature: 0.7,
      max_tokens: 1200,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error?.message || `Groq API error: ${response.status}`);
  }

  const data = await response.json();
  const rawContent = data.choices?.[0]?.message?.content;

  if (!rawContent) {
    throw new Error('Empty response from Groq');
  }

  const prediction = JSON.parse(rawContent);

  // Check for out-of-scope refusal
  if (prediction.error === 'out_of_scope') {
    throw new Error(prediction.message || 'Request was outside behavioral analysis scope.');
  }

  // Validate response
  const validation = validatePredictionResponse(prediction);
  if (!validation.isValid) {
    console.error('Groq response validation failed:', validation.errors);
    throw new Error(`Invalid prediction response: ${validation.errors.join(', ')}`);
  }

  return prediction;
}
