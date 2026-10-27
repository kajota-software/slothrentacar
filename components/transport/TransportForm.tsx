'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import {
  transportRoutes,
  transportRules,
  getTransportRoute,
  routeDirection,
  type TransportRoute,
  type RouteDirection,
} from '@/lib/transport';
import { crLocalNowPlusHours, formatCrLocalEs, meetsMinNotice } from '@/lib/costaRicaTime';
import { buildWhatsAppUrl, crcToUsd, formatCRC, formatUSD, getWhatsAppNumber, omitKeys, cn } from '@/lib/utils';
import { trackLead } from '@/lib/tracking';
import { COUNTRY_CODES } from '../ReservationModal';
import InfoTip from '../InfoTip';
import { WhatsAppIcon } from '../icons';
import { useRouteLabel, useTransport } from './TransportContext';

interface FormState {
  name: string;
  countryCode: string;
  phone: string;
  fromText: string;
  toText: string;
  datetime: string;
  flight: string;
  passengers: number;
  large: number;
  medium: number;
  notes: string;
}

const DATE_LABEL_ES: Record<RouteDirection, string> = {
  fromAirport: 'Llegada del vuelo',
  toAirport: 'Recogida',
  other: 'Viaje',
};

/* Mensaje de WhatsApp — siempre en español */
function buildTransportMessage(
  form: FormState,
  route: TransportRoute,
  isEnglish: boolean,
): string {
  const direction = routeDirection(route);
  const from = route.from ?? form.fromText.trim();
  const to = route.to ?? form.toText.trim();
  const { date, time } = formatCrLocalEs(form.datetime);

  // Mismo formato que el mensaje de renta de ReservationModal (sin emojis)
  const sep = '━━━━━━━━━━━━━━━━━━━━';
  const lines = [
    '*SLOTH RENT A CAR*',
    '*Reserva de transporte*',
    sep,
    '',
    `*Ruta:* ${from} → ${to}`,
    `*${DATE_LABEL_ES[direction]}:* ${date} a las ${time}`,
    `*Vuelo:* ${form.flight.trim() || '—'}`,
    `*Pasajeros:* ${form.passengers}`,
    `*Equipaje:* ${form.large} ${form.large === 1 ? 'grande' : 'grandes'}, ${form.medium} ${form.medium === 1 ? 'mediana' : 'medianas'}`,
    `*Precio:* ${route.priceCRC !== null ? `${formatCRC(route.priceCRC)} por viaje` : 'a cotizar'}`,
    '',
    sep,
    `*Nombre:* ${form.name.trim()}`,
    `*WhatsApp:* ${form.countryCode} ${form.phone.trim()}`,
    ...(isEnglish ? ['*Idioma del cliente:* Inglés'] : []),
    `*Notas:* ${form.notes.trim() || '—'}`,
  ];
  return lines.join('\n');
}

const range = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => from + i);

export default function TransportForm() {
  const t = useTranslations('transport.form');
  const tRoutes = useTranslations('transport.routes');
  const tTips = useTranslations('infoTips');
  const locale = useLocale();
  const { routeId, setRouteId, rate } = useTransport();
  const routeLabel = useRouteLabel();

  const [form, setForm] = useState<FormState>({
    name: '',
    countryCode: '+506',
    phone: '',
    fromText: '',
    toText: '',
    datetime: '',
    flight: '',
    passengers: 1,
    large: 0,
    medium: 0,
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tooSoon, setTooSoon] = useState(false);
  const [minDatetime, setMinDatetime] = useState('');

  const route = getTransportRoute(routeId);
  const direction = routeDirection(route);
  const isOther = route?.id === 'other';
  const flightRequired = direction === 'fromAirport';

  const dateLabel =
    direction === 'fromAirport' ? t('dateFromAirport') : direction === 'toAirport' ? t('dateToAirport') : t('dateOther');

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => omitKeys(e, key));
  }

  function handleDatetime(value: string) {
    update('datetime', value);
    setTooSoon(!!value && !meetsMinNotice(value, transportRules.minNoticeHours));
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = t('required');
    if (!form.phone.trim()) e.phone = t('required');
    if (!route) e.route = t('required');
    if (isOther && !form.fromText.trim()) e.fromText = t('required');
    if (isOther && !form.toText.trim()) e.toText = t('required');
    if (!form.datetime) e.datetime = t('required');
    if (flightRequired && !form.flight.trim()) e.flight = t('required');
    setErrors(e);

    const soon = !!form.datetime && !meetsMinNotice(form.datetime, transportRules.minNoticeHours);
    setTooSoon(soon);

    const firstError = Object.keys(e)[0] ?? (soon ? 'datetime' : null);
    if (firstError) document.getElementById(`transport-${firstError}`)?.focus();
    return Object.keys(e).length === 0 && !soon;
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate() || !route) return;
    const msg = buildTransportMessage(form, route, locale === 'en');
    trackLead('transporte');
    window.open(buildWhatsAppUrl(msg), '_blank', 'noopener,noreferrer');
  }

  const inputCls = (err?: string) =>
    cn(
      'w-full border rounded-xl px-4 py-3 text-base sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest/30 transition-colors',
      err ? 'border-red-400' : 'border-sand-dark',
    );
  const labelCls = 'flex items-center gap-2 text-sm font-medium text-forest mb-1.5';
  const errorText = (key: string) =>
    errors[key] ? <p className="text-red-500 text-xs mt-1">{errors[key]}</p> : null;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {/* Nombre */}
      <div>
        <label htmlFor="transport-name" className={labelCls}>{t('name')}</label>
        <input
          id="transport-name"
          type="text"
          autoComplete="name"
          placeholder={t('namePlaceholder')}
          value={form.name}
          onChange={(e) => update('name', e.target.value)}
          className={inputCls(errors.name)}
        />
        {errorText('name')}
      </div>

      {/* WhatsApp */}
      <div>
        <label htmlFor="transport-phone" className={labelCls}>{t('phone')}</label>
        <div className="flex gap-2">
          <select
            aria-label={t('countryCode')}
            value={form.countryCode}
            onChange={(e) => update('countryCode', e.target.value)}
            className="border border-sand-dark rounded-xl px-3 py-3 text-base sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest/30"
          >
            {COUNTRY_CODES.map((c) => (
              <option key={c.code} value={c.code}>{c.label}</option>
            ))}
          </select>
          <input
            id="transport-phone"
            type="tel"
            autoComplete="tel-national"
            placeholder={t('phonePlaceholder')}
            value={form.phone}
            onChange={(e) => update('phone', e.target.value)}
            className={cn(inputCls(errors.phone), 'flex-1 min-w-0')}
          />
        </div>
        {errorText('phone')}
      </div>

      {/* Ruta */}
      <div>
        <label htmlFor="transport-route" className={labelCls}>
          {t('route')}
          {isOther && <InfoTip text={tTips('otherDestination')} />}
        </label>
        <select
          id="transport-route"
          value={routeId}
          onChange={(e) => {
            setRouteId(e.target.value);
            setErrors((e) => omitKeys(e, 'route', 'flight'));
          }}
          className={inputCls(errors.route)}
        >
          <option value="">{t('selectRoute')}</option>
          {transportRoutes.map((r) => (
            <option key={r.id} value={r.id}>
              {r.priceCRC === null
                ? tRoutes('otherOption')
                : `${routeLabel(r)}${r.oneWay ? ` (${tRoutes('oneWay')})` : ''} — ${formatCRC(r.priceCRC)}`}
            </option>
          ))}
        </select>
        {errorText('route')}
      </div>

      {/* Otro destino */}
      {isOther && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="transport-fromText" className={labelCls}>{t('from')}</label>
            <input
              id="transport-fromText"
              type="text"
              placeholder={t('fromPlaceholder')}
              value={form.fromText}
              onChange={(e) => update('fromText', e.target.value)}
              className={inputCls(errors.fromText)}
            />
            {errorText('fromText')}
          </div>
          <div>
            <label htmlFor="transport-toText" className={labelCls}>{t('to')}</label>
            <input
              id="transport-toText"
              type="text"
              placeholder={t('toPlaceholder')}
              value={form.toText}
              onChange={(e) => update('toText', e.target.value)}
              className={inputCls(errors.toText)}
            />
            {errorText('toText')}
          </div>
        </div>
      )}

      {/* Fecha y hora + vuelo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="transport-datetime" className={labelCls}>
            {dateLabel}
            <InfoTip text={tTips('notice')} />
          </label>
          <input
            id="transport-datetime"
            type="datetime-local"
            min={minDatetime || undefined}
            onFocus={() => setMinDatetime(crLocalNowPlusHours(transportRules.minNoticeHours))}
            value={form.datetime}
            onChange={(e) => handleDatetime(e.target.value)}
            className={cn(inputCls(errors.datetime || (tooSoon ? 'x' : undefined)), 'min-h-[50px]')}
          />
          {errorText('datetime')}
        </div>
        <div>
          <label htmlFor="transport-flight" className={labelCls}>
            {flightRequired ? t('flight') : t('flightOptional')}
          </label>
          <input
            id="transport-flight"
            type="text"
            autoCapitalize="characters"
            placeholder={t('flightPlaceholder')}
            value={form.flight}
            onChange={(e) => update('flight', e.target.value.toUpperCase())}
            className={inputCls(errors.flight)}
          />
          {errorText('flight')}
        </div>
      </div>

      {tooSoon && (
        <div role="alert" className="rounded-2xl border border-amber/40 bg-amber/10 p-4">
          <p className="text-sm text-forest-dark leading-relaxed">{t('tooSoon')}</p>
          <a
            href={`https://wa.me/${getWhatsAppNumber()}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#25D366] hover:brightness-95 text-white text-sm font-semibold px-4 py-2 transition"
          >
            <WhatsAppIcon className="w-4 h-4" />
            {t('tooSoonCta')}
          </a>
        </div>
      )}

      {/* Pasajeros y equipaje */}
      <div className="grid grid-cols-3 gap-3">
        {(
          [
            ['passengers', t('passengers'), 1, transportRules.maxPassengers],
            ['large', t('largeBags'), 0, transportRules.maxLuggage.large],
            ['medium', t('mediumBags'), 0, transportRules.maxLuggage.medium],
          ] as const
        ).map(([key, label, min, max]) => (
          <div key={key} className="flex flex-col">
            <label htmlFor={`transport-${key}`} className="block text-sm font-medium text-forest leading-tight">
              {label}
            </label>
            <span className="text-[11px] text-forest-muted mb-1.5">{t('max', { n: max })}</span>
            <select
              id={`transport-${key}`}
              value={form[key]}
              onChange={(e) => update(key, Math.min(max, Math.max(min, Number(e.target.value))))}
              className={cn(inputCls(), 'mt-auto px-3')}
            >
              {range(min, max).map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* Notas */}
      <div>
        <label htmlFor="transport-notes" className={labelCls}>{t('notes')}</label>
        <textarea
          id="transport-notes"
          rows={2}
          placeholder={t('notesPlaceholder')}
          value={form.notes}
          onChange={(e) => update('notes', e.target.value)}
          className={cn(inputCls(), 'resize-none')}
        />
      </div>

      {/* Resumen de precio en vivo */}
      {route && (
        <div className="bg-sand rounded-2xl p-4 text-sm space-y-2">
          <p className="font-heading text-forest font-semibold text-base">{t('summaryTitle')}</p>
          <p className="text-forest-muted">
            {t('perTrip', {
              route: isOther
                ? form.fromText.trim() && form.toText.trim()
                  ? `${form.fromText.trim()} → ${form.toText.trim()}`
                  : tRoutes('otherOption')
                : routeLabel(route),
            })}
          </p>
          <div className="border-t border-sand-dark pt-2">
            {route.priceCRC !== null ? (
              <p className="flex justify-between items-baseline gap-3 font-semibold text-forest">
                <span>{t('total')}</span>
                <span className="text-right">
                  {formatCRC(route.priceCRC)}{' '}
                  <span className="font-normal text-forest-muted">
                    (~{formatUSD(crcToUsd(route.priceCRC, rate))} USD)
                  </span>
                </span>
              </p>
            ) : (
              <p className="font-semibold text-forest">{t('quote')}</p>
            )}
          </div>
          <p className="text-xs text-forest-muted leading-relaxed">
            {t('note')} <InfoTip text={tTips('flightDelay')} className="ml-0.5" />
          </p>
        </div>
      )}

      <button
        type="submit"
        className="w-full bg-amber hover:bg-amber-dark text-forest-dark font-semibold py-4 rounded-xl text-base transition-all duration-200 hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-amber/20"
      >
        <WhatsAppIcon className="w-5 h-5" />
        {t('submit')}
      </button>
    </form>
  );
}
