/**
 * The request form («اطلب خدمة», «اعمل معي»): a request link fills in what was already chosen, the phone beside
 * the form writes the message as the visitor types, each field is checked in words under it, and the message
 * opens ready in WhatsApp or email. The page then says what is left to do, and keeps a way back.
 * Texts: ScriptData "form" (RequestForm.astro); what a request link may choose: ScriptData "prefill" (ServiceChoice.astro).
 */
import { links } from '@/config/site';
import { fill } from '@/i18n/format';
import {
  escapeHtml,
  messageLines,
  previewLines,
  subjectOf,
  type Channel,
  type FormKind,
  type MessageInput,
  type MessageTexts,
} from '@/lib/message/build-message';
import { asciiDigits, isPhone } from '@/lib/message/phone';
import { parseRequestParams } from '@/lib/prefill/parse-request-params';
import { $, $$ } from '@/scripts/dom';
import { readScriptData } from '@/scripts/script-data';

export interface FormTexts {
  message: MessageTexts;
  errors: Record<'name' | 'service' | 'specialty' | 'details' | 'about' | 'phone' | 'email' | 'url', string>;
  /** the send buttons, with {channel} */
  send: { main: string; alt: string };
  done: {
    ready: Record<Channel, string>;
    /** with {channel}: the reply channel */
    text: string;
    open: Record<Channel, string>;
    copied: string;
    copyFailed: string;
  };
}

export interface PrefillData {
  problems: Record<string, string[]>;
  projects: Record<string, string>;
  labels: { problem: string; project: string };
  /** the note under the service choices, with {label} and {text} */
  noteHtml: string;
}

const other = (c: string): Channel => (c === 'email' ? 'whatsapp' : 'email');

export function initRequestForm() {
  const form = $<HTMLFormElement>('form[data-form]');
  if (!form) return;
  const texts = readScriptData<FormTexts>('form')!;
  const { channels } = texts.message;
  const kind = form.dataset.form as FormKind;
  const val = (n: string) =>
    String((form.elements.namedItem(n) as HTMLInputElement | RadioNodeList | null)?.value ?? '').trim();
  const labelOf = (n: string) => form.querySelector<HTMLElement>(`input[name="${n}"]:checked`)?.dataset.label || '';

  // what the visitor already chose on the way here: a service, a problem, or a similar project
  let context: MessageInput['context'] = null;
  const ctxBox = $('#ctx');
  if (kind === 'service') {
    const prefill = readScriptData<PrefillData>('prefill')!;
    const radios = $$<HTMLInputElement>('input[name="service"]', form);
    const chosen = parseRequestParams(location.search, {
      services: radios.map((r) => r.value),
      problems: prefill.problems,
      projects: prefill.projects,
    });
    const radio = radios.find((r) => r.value === chosen.service);
    if (radio) radio.checked = true;
    if (chosen.context) context = { label: prefill.labels[chosen.context.kind], text: chosen.context.text };
    if (context) {
      $('#ctxText')!.innerHTML = fill(prefill.noteHtml, { label: context.label, text: escapeHtml(context.text) });
      ctxBox!.hidden = false;
    }
    $('#ctxClear')!.addEventListener('click', () => {
      context = null;
      ctxBox!.hidden = true;
      paint();
      radios[0].focus();
    });
  }

  // the reply channel decides which contact field is asked for, and which channel the main button sends through
  const syncVia = () => {
    const via = val('via');
    $('#f-phone')!.hidden = via !== 'whatsapp';
    $('#f-email')!.hidden = via !== 'email';
    $('#sendMain')!.textContent = fill(texts.send.main, { channel: channels[via as Channel] });
    $('#sendAlt')!.textContent = fill(texts.send.alt, { channel: channels[other(via)] });
  };

  const input = (): MessageInput => ({
    kind,
    via: val('via'),
    context,
    fields: {
      name: val('name'),
      service: labelOf('service'),
      details: val('details'),
      specialty: labelOf('specialty'),
      portfolio: val('portfolio'),
      about: val('about'),
      phone: asciiDigits(val('phone')),
      email: val('email'),
    },
  });
  const bubbles = [$('#bubble'), $('#bubbleM')].filter((b) => b !== null);
  const paint = () => {
    const html = previewLines(input(), texts.message).join('\n');
    bubbles.forEach((b) => (b.innerHTML = html));
  };

  // checks, in the words the visitor reads under each field
  const { errors } = texts;
  // the channel this send goes through: a contact may stay empty when the reply can go back the way the message came
  let sendingBy = '';
  const contactRule = (channel: Channel, value: string, valid: boolean, error: string) => {
    if (val('via') !== channel) return '';
    if (!value) return (sendingBy || channel) === channel ? '' : error;
    return valid ? '' : error;
  };
  const rules: Record<string, () => string> = {
    name: () => (val('name').length >= 2 ? '' : errors.name),
    service: () => (val('service') ? '' : errors.service),
    specialty: () => (val('specialty') ? '' : errors.specialty),
    // a problem chosen on the way here already says what the request is about
    details: () => (context || val('details').length >= 8 ? '' : errors.details),
    about: () => (val('about').length >= 8 ? '' : errors.about),
    phone: () => contactRule('whatsapp', val('phone'), isPhone(val('phone')), errors.phone),
    email: () => contactRule('email', val('email'), /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val('email')), errors.email),
    portfolio: () => (!val('portfolio') || /^https?:\/\/\S+\.\S+/.test(val('portfolio')) ? '' : errors.url),
  };
  const check = (n: string) => {
    const box = $(`#f-${n}`);
    if (!box || !rules[n]) return '';
    const msg = rules[n]();
    box.classList.toggle('bad', !!msg);
    $(`#e-${n}`)!.textContent = msg;
    box
      .querySelectorAll('input, textarea')
      .forEach((el) => (msg ? el.setAttribute('aria-invalid', 'true') : el.removeAttribute('aria-invalid')));
    return msg;
  };
  const touched = new Set<string>();
  form.addEventListener('focusout', (e) => {
    const el = e.target as HTMLInputElement;
    if (el.name && rules[el.name] && el.type !== 'radio') {
      touched.add(el.name);
      check(el.name);
    }
  });
  form.addEventListener('input', (e) => {
    const el = e.target as HTMLInputElement;
    if (el.name === 'via') syncVia();
    if (touched.has(el.name) || el.type === 'radio') check(el.name);
    // once the summary shows, it keeps up: a line leaves as its field is put right
    if (!sum.hidden) listProblems();
    paint();
  });

  const sum = $('#sum')!;
  const done = $('#done')!;
  /** writes the summary and returns what is wrong, in the order the fields appear, so it reads top to bottom like the form */
  const listProblems = () => {
    const bad = Object.keys(rules)
      .filter((n) => $(`#f-${n}`) && !$(`#f-${n}`)!.hidden && check(n))
      .sort((a, b) =>
        $(`#f-${a}`)!.compareDocumentPosition($(`#f-${b}`)!) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
      );
    $('#sumList')!.innerHTML = bad
      .map((n) => `<li><a href="#f-${n}">${escapeHtml($(`#e-${n}`)!.textContent ?? '')}</a></li>`)
      .join('');
    sum.hidden = !bad.length;
    return bad;
  };
  // a line of the summary leads to its field, ready to type in
  sum.addEventListener('click', (e) => {
    const link = (e.target as HTMLElement).closest('a');
    if (!link) return;
    e.preventDefault();
    $(link.hash)?.querySelector<HTMLElement>('input, textarea')?.focus();
  });
  const failed = () => {
    const bad = listProblems();
    bad.forEach((n) => touched.add(n));
    if (bad.length) sum.focus();
    return bad.length > 0;
  };

  const subject = subjectOf(kind, texts.message);
  let sentText = '';
  // the message opens, ready, in the chosen app; the page then says what is left to do, and keeps a way back
  const send = (via: string) => {
    sendingBy = via;
    const blocked = failed();
    sendingBy = '';
    if (blocked) return;
    const channel: Channel = via === 'email' ? 'email' : 'whatsapp';
    const body = messageLines(input(), texts.message).join('\n');
    sentText = `${subject}\n${body}`;
    const url = channel === 'email' ? links.email(subject, body) : links.whatsapp(sentText);
    if (channel === 'email') location.href = url;
    else window.open(url, '_blank', 'noopener');
    const title = $('#doneTitle')!;
    title.textContent = texts.done.ready[channel];
    $('#doneText')!.textContent = fill(texts.done.text, { channel: channels[val('via') as Channel] });
    const open = $<HTMLAnchorElement>('#doneOpen')!;
    open.href = url;
    open.textContent = texts.done.open[channel];
    if (channel === 'email') open.removeAttribute('target');
    else open.target = '_blank';
    $('#doneCopied')!.textContent = '';
    form.hidden = true;
    done.hidden = false;
    title.focus();
  };
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    send(val('via'));
  });
  $('#sendAlt')!.addEventListener('click', () => send(other(val('via'))));
  // if no app opens, the message can still be pasted anywhere
  $('#doneCopy')!.addEventListener('click', async () => {
    const said = $('#doneCopied')!;
    try {
      await navigator.clipboard.writeText(sentText);
      said.textContent = texts.done.copied;
    } catch {
      said.textContent = texts.done.copyFailed;
    }
  });
  $('#again')!.addEventListener('click', () => {
    form.reset();
    context = null;
    if (ctxBox) ctxBox.hidden = true;
    touched.clear();
    form.querySelectorAll('.field.bad').forEach((f) => f.classList.remove('bad'));
    sum.hidden = true;
    done.hidden = true;
    form.hidden = false;
    syncVia();
    paint();
    form.querySelector<HTMLElement>('input, textarea')!.focus();
  });
  syncVia();
  paint();
  // coming back with Back, the browser restores the fields after this script ran: the preview follows them
  addEventListener('pageshow', () => {
    syncVia();
    paint();
  });
}
