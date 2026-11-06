/**
 * The request message, written from the form's fields: the same lines go to WhatsApp or email, and to the phone
 * preview beside the form. In the preview the visitor's words are escaped, and each field still empty shows as a
 * marked gap (<span class="ph">) saying what goes there. The texts come from src/i18n/ui/<locale>/forms.json.
 */
import { fill } from '@/i18n/format';

export type FormKind = 'service' | 'join';
export type Channel = 'whatsapp' | 'email';

export interface MessageTexts {
  service: { subject: string; hello: string; need: string; context: string };
  join: { subject: string; hello: string; specialty: string; portfolio: string };
  /** the last line: where to reply */
  reply: string;
  /** the last line when no number or address was given: the reply goes where the message came from */
  replyHere: string;
  /** what the preview says in place of each empty field */
  gaps: Record<'name' | 'service' | 'details' | 'specialty' | 'about', string>;
  /** the channels' names, as the reply line says them */
  channels: Record<Channel, string>;
}

export interface MessageFields {
  name: string;
  /** the chosen service, as its label reads (request form) */
  service: string;
  details: string;
  /** the chosen specialty, as its label reads (join form) */
  specialty: string;
  portfolio: string;
  about: string;
  phone: string;
  email: string;
}

export interface MessageInput {
  kind: FormKind;
  /** the reply channel chosen; anything but email means WhatsApp */
  via: string;
  fields: Partial<MessageFields>;
  /** what the visitor came from (a problem, a similar project), when the request link said */
  context?: { label: string; text: string } | null;
}

export const escapeHtml = (text: string) =>
  text.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

/** a number or address keeps its own reading order inside an Arabic line, in the message and in the preview */
const isolate = (text: string) => `⁦${text}⁩`;

function build({ kind, via, fields: f, context }: MessageInput, texts: MessageTexts, preview: boolean) {
  const value = (v: string) => (preview ? escapeHtml(v) : v);
  const put = (v: string | undefined, gap: string) => (v ? value(v) : preview ? `<span class="ph">${gap}</span>` : '');
  const { gaps } = texts;
  const byEmail = via === 'email';
  const out: string[] = [];
  if (kind === 'service') {
    const t = texts.service;
    out.push(fill(t.hello, { name: put(f.name, gaps.name) }));
    out.push(fill(t.need, { service: put(f.service, gaps.service) }));
    if (context) out.push(fill(t.context, { label: context.label, text: value(context.text) }));
    // with a problem already chosen the details are optional: no empty line in the message, a gap in the preview
    if (preview || f.details) out.push(put(f.details, gaps.details));
  } else {
    const t = texts.join;
    out.push(fill(t.hello, { name: put(f.name, gaps.name) }));
    out.push(fill(t.specialty, { specialty: put(f.specialty, gaps.specialty) }));
    if (f.portfolio) out.push(fill(t.portfolio, { portfolio: value(f.portfolio) }));
    out.push(put(f.about, gaps.about));
  }
  const contact = byEmail ? f.email : f.phone;
  out.push(
    contact
      ? fill(texts.reply, { channel: texts.channels[byEmail ? 'email' : 'whatsapp'], contact: isolate(value(contact)) })
      : texts.replyHere,
  );
  return out;
}

/** the message as it is sent, one line per entry */
export const messageLines = (input: MessageInput, texts: MessageTexts) => build(input, texts, false);

/** the same lines as HTML for the preview: escaped words, and marked gaps where fields are still empty */
export const previewLines = (input: MessageInput, texts: MessageTexts) => build(input, texts, true);

/** the subject (email) and first line (WhatsApp) for each kind of form */
export const subjectOf = (kind: FormKind, texts: MessageTexts) => texts[kind].subject;
