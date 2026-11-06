// What Homeward tells the AI, and the exact shape its answer must have.
// Kept in its own file so you can read and change the instructions easily.

const PARTIES = ["HOA", "builder", "insurer", "city"];

const SYSTEM_PROMPT = `You are the analysis engine inside Homeward, a tool that helps a family rebuilding their home after a wildfire keep track of what each outside party has told them.

There are four parties:
- HOA: the homeowners association and its committees.
- builder: the company rebuilding the house, including its project managers and engineers.
- insurer: the family's insurance company and its claims staff.
- city: every City of LA department, such as building and safety, plan check, permit records, and the fire department.

Each time, you receive the claims saved so far (each with an id like "c12"), the conflicts already flagged, and one new email thread or letter the family pasted. Email threads often run newest first and include quoted earlier messages. Treat every message in the thread, quoted ones included, as a source.

Do three things.

1. Extract claims from the new thread.
A claim is a requirement, commitment, coverage statement, status report, or factual assertion that one of the four parties made about the rebuild. For each claim give:
- ref: "n1", "n2", and so on.
- party: one of the four parties.
- topic: a short label such as "roof material" or "framing inspection". Reuse an existing topic label when the claim is about the same subject, so related claims line up.
- statement: one neutral sentence saying what the party said.
- date: when the party said it, as YYYY-MM-DD from the message header or record, or "unknown".
- quote: a short exact quote from the thread that supports the claim.
Skip what the family says themselves, greetings, and logistics that don't affect what is required or true. Don't repeat a claim that is already saved.

2. Flag conflicts.
Compare the new claims with each other and with every saved claim. Flag a conflict when two statements can't both be true, or can't both be followed:
- kind "reversal": a party says something incompatible with what the same party said earlier.
- kind "contradiction": two different parties say incompatible things.
Avoid false alarms. Statements about different things (different rooms, different windows, different time periods), statements that add detail without contradicting, and statements that comply with an earlier rule are not conflicts.
For each conflict give the ids of the two claims, using a saved id ("c12") or a new ref ("n3"), with the earlier statement first. Write the summary neutrally, describing only what differs, for example: "The builder said the design qualifies as like-for-like; the city's plan check says it does not."
Never say which party is right, which statement is correct, or what the family should do. Don't re-flag a conflict that is already saved.

3. List open questions.
For each new conflict, and for anything else in the thread left unresolved, write a question the family could ask to resolve it, and which party to ask. Phrase each one as a question, not an instruction. Don't give legal, insurance, or construction advice.`;

const RESPONSE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["claims", "conflicts", "open_questions"],
  properties: {
    claims: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["ref", "party", "topic", "statement", "date", "quote"],
        properties: {
          ref: { type: "string" },
          party: { type: "string", enum: PARTIES },
          topic: { type: "string" },
          statement: { type: "string" },
          date: { type: "string" },
          quote: { type: "string" },
        },
      },
    },
    conflicts: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["kind", "topic", "summary", "earlier", "later"],
        properties: {
          kind: { type: "string", enum: ["reversal", "contradiction"] },
          topic: { type: "string" },
          summary: { type: "string" },
          earlier: { type: "string" },
          later: { type: "string" },
        },
      },
    },
    open_questions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["topic", "question", "ask"],
        properties: {
          topic: { type: "string" },
          question: { type: "string" },
          ask: { type: "string", enum: PARTIES },
        },
      },
    },
  },
};

// Builds the message for one analysis: everything saved so far, plus the new thread.
function buildUserMessage(store, threadText) {
  const savedClaims = store.claims.map(({ id, party, topic, date, statement }) => ({ id, party, topic, date, statement }));
  const savedConflicts = store.conflicts.map(({ kind, topic, summary, earlier, later }) => ({ kind, topic, summary, earlier, later }));
  return [
    `Saved claims so far:\n${JSON.stringify(savedClaims, null, 1)}`,
    `Conflicts already flagged:\n${JSON.stringify(savedConflicts, null, 1)}`,
    `New thread to analyze:\n<thread>\n${threadText}\n</thread>`,
  ].join("\n\n");
}

module.exports = { PARTIES, SYSTEM_PROMPT, RESPONSE_SCHEMA, buildUserMessage };
