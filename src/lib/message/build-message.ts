import { fill } from '@/i18n/format';

export type FormKind = 'service' | 'join';
export type Channel = 'whatsapp' | 'email';

export interface MessageTexts {
  service: { subject: string; hello: string; need: string; context: string };
  join: { subject: string; hello: string; specialty: string; portfolio: string };
  reply: string;
  replyHere: string;
  gaps: Record<'name' | 'service' | 'details' | 'specialty' | 'about', string>;
  channels: Record<Channel, string>;
}

export interface MessageFields {
  name: string;
  service: string;
  details: string;
  specialty: string;
  portfolio: string;
  about: string;
  phone: string;
  email: string;
}

export interface MessageInput {
  kind: FormKind;
  via: string;
  fields: Partial<MessageFields>;
  context?: { label: string; text: string } | null;
}

export const escapeHtml = (text: string) =>
  text.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

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

export const messageLines = (input: MessageInput, texts: MessageTexts) => build(input, texts, false);

export const previewLines = (input: MessageInput, texts: MessageTexts) => build(input, texts, true);

export const subjectOf = (kind: FormKind, texts: MessageTexts) => texts[kind].subject;
