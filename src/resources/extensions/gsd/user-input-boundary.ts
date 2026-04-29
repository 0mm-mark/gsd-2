const USER_APPROVAL_UNIT_TYPES = new Set([
  "discuss-project",
  "discuss-requirements",
  "discuss-milestone",
  "research-decision",
]);

const REMOTE_QUESTION_FAILURE_RE =
  /(?:Remote (?:auth failed|questions failed|channel configured but returned no result|questions timed out|questions timed out or failed)|Failed to send questions via)/i;

const APPROVAL_WAIT_RE =
  /\bwait(?:ing)?\s+for\s+(?:your\s+)?(?:confirmation|approval|input|response|answer)\b/i;

const APPROVAL_QUESTION_RE =
  /\?(?=[\s\S]*\b(?:confirm|confirmation|approve|approval|requirements|capture|captured|correctly|right|adjust|clarify|scope|write|proceed|reclassify)\b)/i;

function extractTextFromMessage(msg: unknown): string {
  if (!msg || typeof msg !== "object") return "";
  const content = (msg as { content?: unknown }).content;
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  const parts: string[] = [];
  for (const block of content) {
    if (!block || typeof block !== "object") continue;
    const typed = block as { type?: unknown; text?: unknown };
    if (typed.type === "text" && typeof typed.text === "string") {
      parts.push(typed.text);
    }
  }
  return parts.join("\n");
}

function lastAssistantText(messages: unknown[] | undefined): string {
  if (!Array.isArray(messages)) return "";
  for (let i = messages.length - 1; i >= 0; i--) {
    const text = extractTextFromMessage(messages[i]).trim();
    if (text) return text;
  }
  return "";
}

export function isAwaitingUserInput(messages: unknown[] | undefined): boolean {
  const text = lastAssistantText(messages);
  if (!text) return false;
  if (/ask_user_questions was cancelled before receiving a response/i.test(text)) return true;
  if (REMOTE_QUESTION_FAILURE_RE.test(text)) return true;
  if (APPROVAL_WAIT_RE.test(text)) return true;
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (lines.some((line) => line.endsWith("?"))) return true;
  return APPROVAL_QUESTION_RE.test(text);
}

export function shouldPauseForUserApprovalQuestion(
  unitType: string | undefined,
  messages: unknown[] | undefined,
): boolean {
  return !!unitType && USER_APPROVAL_UNIT_TYPES.has(unitType) && isAwaitingUserInput(messages);
}
