// Build the Picture — 7 signal categories x 4 relationship types
// Each question is a memory-recall prompt, not an analytical question

export const CATEGORIES = [
  { id: 'conflict', name: 'Conflict Behaviour', description: 'How they respond when challenged, criticised, or in tension' },
  { id: 'stress', name: 'Behaviour Under Stress', description: 'What they do when overwhelmed, under pressure, or depleted' },
  { id: 'trust', name: 'Trust & Loyalty', description: 'How they demonstrate or withhold loyalty and reliability' },
  { id: 'social', name: 'Social Dynamics', description: 'How their behaviour shifts depending on social context' },
  { id: 'triggers', name: 'Triggers', description: 'Specific stimuli that reliably produce a strong emotional response' },
  { id: 'care', name: 'How They Care', description: 'The specific ways they express care and investment in others' },
  { id: 'patterns', name: 'Patterns Over Time', description: 'Recurring behavioural sequences across multiple situations' },
];

export const QUESTIONS = {
  conflict: {
    friend: [
      { id: 'Q1', text: 'Think of a specific time things got tense or uncomfortable between you and [Name]. What happened — and what did they do?' },
      { id: 'Q2', text: 'When you and [Name] disagree about something, how does that usually go? Who tends to go quiet, who pushes back?' },
      { id: 'Q3', text: 'Has [Name] ever brought up a grievance long after it happened — something you thought was resolved? What was that like?' },
      { id: 'Q4', text: 'When [Name] is upset with you, how do you know? Do they say so directly, or does it come out another way?' },
      { id: 'Q5', text: 'After a falling out or tension with [Name], who usually makes the first move to repair things?' },
    ],
    colleague: [
      { id: 'Q1', text: 'Describe how [Name] responds when someone challenges their idea or approach in a meeting.' },
      { id: 'Q2', text: 'Has [Name] ever disagreed with a decision made above them? How did they handle it — publicly or privately?' },
      { id: 'Q3', text: 'When a project goes wrong or something is [Name]\'s fault, how do they typically respond?' },
      { id: 'Q4', text: 'Have you ever seen [Name] take criticism from a manager or peer? What did that look like?' },
      { id: 'Q5', text: 'Does [Name] tend to address tension directly, or let it sit and hope it resolves itself?' },
    ],
    partner: [
      { id: 'Q1', text: 'Think of your last real disagreement. In the moment — not later — what did [Name] do?' },
      { id: 'Q2', text: 'When [Name] is upset with you, what does withdrawal look like? Do they go quiet, leave the room, become sarcastic?' },
      { id: 'Q3', text: 'Has [Name] ever escalated a small disagreement into something bigger? What triggered that?' },
      { id: 'Q4', text: 'Does [Name] tend to resolve conflict before sleeping or carry it into the next day?' },
      { id: 'Q5', text: 'After a difficult argument, how does [Name] signal that things are okay again?' },
    ],
    family: [
      { id: 'Q1', text: 'Think of a family argument or tense moment involving [Name]. What did they do — did they engage, deflect, or shut down?' },
      { id: 'Q2', text: 'When [Name] is upset with a family member, do they say it directly or does it come out in other ways?' },
      { id: 'Q3', text: 'Has [Name] ever held a grudge over something in the family — something that was never fully resolved?' },
      { id: 'Q4', text: 'How does [Name] behave when they feel criticised or judged by family?' },
      { id: 'Q5', text: 'When family tension gets high, does [Name] tend to mediate, take sides, or disappear?' },
    ],
  },
  stress: {
    friend: [
      { id: 'Q1', text: 'When [Name] is going through something hard — work stress, personal problems — what does that look like around you?' },
      { id: 'Q2', text: 'Does [Name] tend to reach out when they\'re struggling, or do they go quiet and pull back?' },
      { id: 'Q3', text: 'Has [Name] ever cancelled plans repeatedly or become less present when they were under pressure? What did that look like?' },
      { id: 'Q4', text: 'When [Name] is overwhelmed, do they tend to vent and process out loud, or keep it internal?' },
      { id: 'Q5', text: 'Is there anything that reliably makes [Name] visibly more tense or irritable? What is it?' },
    ],
    colleague: [
      { id: 'Q1', text: 'When [Name] is under deadline pressure, what changes about the way they work or communicate?' },
      { id: 'Q2', text: 'Does [Name] tend to take control when things get stressful, or do they become less decisive?' },
      { id: 'Q3', text: 'Has there been a period when [Name] was clearly overwhelmed at work? How did it show?' },
      { id: 'Q4', text: 'When [Name] is stressed, do they tend to over-communicate or under-communicate?' },
      { id: 'Q5', text: 'How does [Name] respond when multiple things are going wrong at once — do they prioritise, freeze, or escalate?' },
    ],
    partner: [
      { id: 'Q1', text: 'When [Name] is stressed about something outside the relationship — work, family — how does it affect how they are with you?' },
      { id: 'Q2', text: 'Does [Name] pull you in when they\'re struggling, or do they push you away and deal with it alone?' },
      { id: 'Q3', text: 'Have you noticed any physical or behavioural signs that [Name] is overwhelmed — sleep, appetite, irritability?' },
      { id: 'Q4', text: 'When [Name] needs space, how do they communicate that — directly, or does it come out as distance?' },
      { id: 'Q5', text: 'After a stressful period, does [Name] tend to reconnect and reset, or do residual effects linger?' },
    ],
    family: [
      { id: 'Q1', text: 'When [Name] is stressed about something in their life, how does it affect how they are with family?' },
      { id: 'Q2', text: 'Does [Name] lean on family when things are hard, or keep problems private?' },
      { id: 'Q3', text: 'Has there been a period where [Name] was clearly struggling? What did the family notice?' },
      { id: 'Q4', text: 'When family events add to [Name]\'s stress, how do they typically handle it?' },
      { id: 'Q5', text: 'Does [Name] tend to absorb and manage stress quietly, or does it come out in their behaviour?' },
    ],
  },
  trust: {
    friend: [
      { id: 'Q1', text: 'Has [Name] ever shown up for you in a way that genuinely surprised you — gone out of their way when they didn\'t have to?' },
      { id: 'Q2', text: 'Has [Name] ever let you down when you needed them? What happened and how did they handle it afterward?' },
      { id: 'Q3', text: 'How does [Name] show they care about you — what do they actually do?' },
      { id: 'Q4', text: 'Have you ever seen [Name] be fiercely loyal to someone — defend them, protect them, show up without being asked?' },
      { id: 'Q5', text: 'Is there anything that [Name] treats as a clear boundary in friendship — something they consider a betrayal?' },
    ],
    colleague: [
      { id: 'Q1', text: 'Has [Name] ever advocated for you or someone else at work — taken a professional risk to support someone?' },
      { id: 'Q2', text: 'Have you seen [Name] take credit for shared work, or seen them give credit generously? Give an example.' },
      { id: 'Q3', text: 'Has [Name] ever kept a confidence at work when they didn\'t have to? Or broken one?' },
      { id: 'Q4', text: 'How does [Name] behave toward people who are no longer useful to them professionally?' },
      { id: 'Q5', text: 'Is [Name] someone people go to for support at work, or do they tend to keep a professional distance?' },
    ],
    partner: [
      { id: 'Q1', text: 'In what ways does [Name] show you they\'re committed — not in words, but in what they actually do?' },
      { id: 'Q2', text: 'Has [Name] ever made a significant sacrifice or compromise for the relationship? What was it?' },
      { id: 'Q3', text: 'Have there been moments where [Name]\'s loyalty felt conditional — where you felt the relationship was more transactional?' },
      { id: 'Q4', text: 'When [Name] says they\'ll do something, how reliable are they? Is their word consistent with their follow-through?' },
      { id: 'Q5', text: 'How does [Name] respond when you\'re vulnerable or need something emotionally?' },
    ],
    family: [
      { id: 'Q1', text: 'Has [Name] ever shown up for a family member in a significant way — gone beyond what was expected?' },
      { id: 'Q2', text: 'Is [Name] the kind of person family calls in a crisis, or do they tend to step back?' },
      { id: 'Q3', text: 'Have you noticed [Name] being protective of certain family members over others? Why do you think that is?' },
      { id: 'Q4', text: 'Has [Name] ever done something that felt like a betrayal of family trust? How was it handled?' },
      { id: 'Q5', text: 'How does [Name] express love within the family — what do they actually do versus what they say?' },
    ],
  },
  social: {
    friend: [
      { id: 'Q1', text: 'How does [Name] behave differently when it\'s just the two of you versus in a group of friends?' },
      { id: 'Q2', text: 'Is [Name] the kind of person who gets more energised or more drained in social settings?' },
      { id: 'Q3', text: 'Has [Name] ever behaved noticeably differently around someone with status, authority, or high social standing?' },
      { id: 'Q4', text: 'In a group, does [Name] tend to lead the conversation, participate evenly, or hang back?' },
      { id: 'Q5', text: 'Have you ever seen [Name] perform — present a version of themselves that felt different from who you know one-on-one?' },
    ],
    colleague: [
      { id: 'Q1', text: 'How does [Name] behave differently in a small team meeting versus a large group presentation or all-hands?' },
      { id: 'Q2', text: 'Around senior leadership, does [Name]\'s behaviour change? In what way?' },
      { id: 'Q3', text: 'Is [Name] more effective and natural in one-on-one conversations or group settings?' },
      { id: 'Q4', text: 'When new people join the team, how does [Name] typically respond — welcoming, neutral, cautious?' },
      { id: 'Q5', text: 'Does [Name] have a noticeably different professional persona versus how they are in informal settings?' },
    ],
    partner: [
      { id: 'Q1', text: 'How does [Name] behave at social events — do they engage widely, stick with you, or look for an exit?' },
      { id: 'Q2', text: 'After a big social event, does [Name] seem energised or depleted?' },
      { id: 'Q3', text: 'Is [Name] different around your friends versus their own friends?' },
      { id: 'Q4', text: 'Around your or their family, does [Name]\'s behaviour shift? How?' },
      { id: 'Q5', text: 'Have you noticed [Name] performing — being "on" — in certain situations differently from how they are with you?' },
    ],
    family: [
      { id: 'Q1', text: 'How does [Name] behave at family gatherings versus in smaller one-on-one family interactions?' },
      { id: 'Q2', text: 'Does [Name] have a "family role" they play — the peacemaker, the black sheep, the achiever?' },
      { id: 'Q3', text: 'How does [Name] respond around older or more authoritative family members?' },
      { id: 'Q4', text: 'Is [Name] more open with some family members than others? What do you think drives that?' },
      { id: 'Q5', text: 'Have you seen [Name] behave completely differently outside of family settings than within them?' },
    ],
  },
  triggers: {
    friend: [
      { id: 'Q1', text: 'Has [Name] ever reacted more strongly than you expected — more defensive, more upset than the situation seemed to warrant? What triggered it?' },
      { id: 'Q2', text: 'Is there a topic, type of comment, or situation that you\'ve learned to avoid with [Name] because it reliably creates tension?' },
      { id: 'Q3', text: 'Have you ever seen someone else say something to [Name] that landed badly — something they probably didn\'t mean as harshly?' },
      { id: 'Q4', text: 'Does [Name] seem particularly sensitive to being left out, not consulted, or treated as an afterthought?' },
      { id: 'Q5', text: 'Is [Name] sensitive about their competence, intelligence, or reputation in any specific area?' },
    ],
    colleague: [
      { id: 'Q1', text: 'Have you ever seen [Name] get visibly defensive or reactive in a work context? What triggered it?' },
      { id: 'Q2', text: 'Is there a type of feedback, meeting dynamic, or management behaviour that consistently gets a negative reaction from [Name]?' },
      { id: 'Q3', text: 'Does [Name] seem sensitive to having their ideas dismissed, credit taken, or authority undermined?' },
      { id: 'Q4', text: 'Has [Name] ever escalated something that seemed small — taken something further up the chain or made it a bigger deal than expected?' },
      { id: 'Q5', text: 'Are there particular types of people or communication styles that [Name] consistently clashes with?' },
    ],
    partner: [
      { id: 'Q1', text: 'Is there something you\'ve said or done — even unintentionally — that has triggered a disproportionately strong reaction from [Name]?' },
      { id: 'Q2', text: 'Does [Name] seem particularly sensitive to feeling dismissed, minimised, or not taken seriously?' },
      { id: 'Q3', text: 'Have you learned to approach certain topics carefully with [Name] — things that reliably go sideways if not handled the right way?' },
      { id: 'Q4', text: 'Is [Name] sensitive to comparisons — being compared to others, to past partners, or to their own past behaviour?' },
      { id: 'Q5', text: 'Does [Name] react strongly to feeling controlled, overlooked, or not given enough independence?' },
    ],
    family: [
      { id: 'Q1', text: 'Are there topics or dynamics in the family that reliably upset or trigger [Name]?' },
      { id: 'Q2', text: 'Has [Name] ever reacted to a family situation much more strongly than others expected? What happened?' },
      { id: 'Q3', text: 'Is [Name] sensitive about any specific aspect of their family role or how they\'re perceived within the family?' },
      { id: 'Q4', text: 'Are there particular family members whose behaviour consistently provokes a reaction in [Name]?' },
      { id: 'Q5', text: 'Does [Name] have any unresolved family history that seems to influence how they respond to certain situations?' },
    ],
  },
  care: {
    friend: [
      { id: 'Q1', text: 'When [Name] cares about someone, what does that actually look like — what do they do?' },
      { id: 'Q2', text: 'Has [Name] ever done something for you that cost them time, effort, or inconvenience — not because they had to, but because they wanted to?' },
      { id: 'Q3', text: 'How does [Name] show up when a friend is going through something hard? Do they check in, show up in person, send practical help?' },
      { id: 'Q4', text: 'Does [Name] tend to express care through words or through actions?' },
      { id: 'Q5', text: 'Is there a difference between how [Name] shows care to close friends versus acquaintances?' },
    ],
    colleague: [
      { id: 'Q1', text: 'When a teammate is struggling, does [Name] tend to offer practical help, emotional support, or encouragement — or stay professional and uninvolved?' },
      { id: 'Q2', text: 'Has [Name] ever gone out of their way to help a colleague — beyond what their job required?' },
      { id: 'Q3', text: 'Does [Name] tend to celebrate others\' wins openly, or keep recognition private?' },
      { id: 'Q4', text: 'How does [Name] behave toward colleagues who are newer, less experienced, or struggling?' },
      { id: 'Q5', text: 'Is [Name] someone who remembers personal details — birthdays, life events — or do they keep relationships mostly professional?' },
    ],
    partner: [
      { id: 'Q1', text: 'How does [Name] most naturally show you they love you — not what they say, but what they do?' },
      { id: 'Q2', text: 'When you\'re having a hard time, what does [Name] instinctively do — try to fix it, listen, be physically present, or give you space?' },
      { id: 'Q3', text: 'Does [Name] express affection more through physical closeness, words, acts of service, or time spent together?' },
      { id: 'Q4', text: 'Is there a pattern in what [Name] does when they want to feel close to you or repair distance?' },
      { id: 'Q5', text: 'Has [Name] ever done something for you that felt like a significant expression of love?' },
    ],
    family: [
      { id: 'Q1', text: 'Within the family, how does [Name] typically show love — through actions, words, presence, or practical help?' },
      { id: 'Q2', text: 'Has [Name] ever done something significant for a family member that showed how much they care?' },
      { id: 'Q3', text: 'Does [Name] express affection openly in the family, or is it more understated?' },
      { id: 'Q4', text: 'Is there a family member [Name] is particularly attentive or caring toward? Why do you think that is?' },
      { id: 'Q5', text: 'How does [Name] show up during family celebrations, milestones, or crises?' },
    ],
  },
  patterns: {
    friend: [
      { id: 'Q1', text: 'Is there something [Name] does consistently that you\'ve noticed across many different situations — a behaviour that just keeps showing up?' },
      { id: 'Q2', text: 'Is there a recurring dynamic between you and [Name] — something that plays out the same way more than once?' },
      { id: 'Q3', text: 'Have you ever predicted how [Name] would react to something and been exactly right? What was the situation?' },
      { id: 'Q4', text: 'Is there something [Name] always does in a specific type of situation — when they\'re excited, embarrassed, or uncertain?' },
      { id: 'Q5', text: 'Looking back over your friendship, has [Name]\'s core behaviour changed, or has the same fundamental person always been there?' },
    ],
    colleague: [
      { id: 'Q1', text: 'Is there a pattern in how [Name] handles high-stakes situations at work — a behaviour that shows up consistently under pressure?' },
      { id: 'Q2', text: 'Have you noticed any recurring dynamic between [Name] and management, or [Name] and their peers?' },
      { id: 'Q3', text: 'Is there something [Name] consistently does when starting a new project, relationship, or initiative?' },
      { id: 'Q4', text: 'Have you ever correctly predicted how [Name] would respond to a situation? What was it?' },
      { id: 'Q5', text: 'Looking at [Name]\'s career trajectory or work style, is there a consistent thread you\'ve observed?' },
    ],
    partner: [
      { id: 'Q1', text: 'Is there a recurring pattern in your relationship — a sequence that plays out the same way more than once?' },
      { id: 'Q2', text: 'Have you noticed [Name] behaving in a consistent way in similar situations across the relationship?' },
      { id: 'Q3', text: 'Is there something [Name] does when they feel insecure or uncertain that has become a recognisable pattern?' },
      { id: 'Q4', text: 'Have you been able to predict [Name]\'s reactions to things before they happen? What gave it away?' },
      { id: 'Q5', text: 'Looking at the relationship as a whole, what is the most consistent thing about [Name]\'s behaviour?' },
    ],
    family: [
      { id: 'Q1', text: 'Is there a pattern in how [Name] behaves in the family that has been consistent for years?' },
      { id: 'Q2', text: 'Is there a recurring dynamic between [Name] and another specific family member?' },
      { id: 'Q3', text: 'Have there been situations in the family that [Name] has handled the same way multiple times?' },
      { id: 'Q4', text: 'Is there something about [Name] that the whole family knows — an established pattern or tendency?' },
      { id: 'Q5', text: 'Has [Name]\'s behaviour within the family changed significantly over time, or has the core pattern stayed the same?' },
    ],
  },
};

export const QUALITY_LABELS = [
  { min: 0, max: 0, label: 'No picture yet', description: 'Profile exists but no signal data. Predictions not recommended.' },
  { min: 1, max: 2, label: 'Forming', description: 'Very early signal. Predictions are possible but flagged as low confidence.' },
  { min: 3, max: 5, label: 'Clear', description: 'Solid coverage across major categories. Predictions are reliable.' },
  { min: 6, max: 7, label: 'Rich', description: 'Full coverage. Predictions draw on a complete behavioral picture.' },
];

export function getQualityLabel(completedCategories) {
  return QUALITY_LABELS.find(q => completedCategories >= q.min && completedCategories <= q.max) || QUALITY_LABELS[0];
}
