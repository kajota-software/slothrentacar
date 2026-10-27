'use client';

import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';
import { fleet, type Vehicle } from '@/lib/fleet';
import { formatUSD, formatCRC, crcToUsd, usdToCrc, getExchangeRate, buildWhatsAppUrl, getWhatsAppNumber, isSantaFeAvailable, omitKeys } from '@/lib/utils';
import { transportRules, rentalRequirements } from '@/lib/transport';
import { crLocalNowPlusHours, formatCrLocalEs, meetsMinNotice } from '@/lib/costaRicaTime';
import { useCurrencyRate } from '@/lib/useCurrencyRate';
import InfoTip from './InfoTip';

/* ── Country codes ── */
export const COUNTRY_CODES = [
  { code: '+506', label: 'CR +506' },
  { code: '+1',   label: 'US/CA +1' },
  { code: '+52',  label: 'MX +52' },
  { code: '+54',  label: 'AR +54' },
  { code: '+34',  label: 'ES +34' },
  { code: '+57',  label: 'CO +57' },
];

/* ── Types ── */
interface BookingInfo {
  vehicleSlug: string;
  pickupDate: string;
  returnDate: string;
  pickupLocation: string;
  extraZeroDeductible: boolean;
  extraChildSeat: boolean;
  notes: string;
  // Transporte aeropuerto ↔ Turrialba
  airportPickup: boolean;
  flightNumber: string;
  flightArrival: string;   // datetime-local, hora de CR
  deliveryPlace: string;   // solo si pickupLocation === 'turrialba-area'
  returnTransfer: boolean;
  returnFlightDeparture: string; // datetime-local, hora de CR — puede ser otro día que la devolución
}

interface ContactInfo {
  name: string;
  countryCode: string;
  phone: string;
  email: string;
  requirementsConfirmed: boolean;
}

interface Props {
  open: boolean;
  onClose: () => void;
  preselectedVehicle?: Vehicle;
  preselectedPickupDate?: string;
  preselectedReturnDate?: string;
  currency?: 'CRC' | 'USD';
  rate?: number | null;
}

/* ── Price calculator — base CRC ── */
function calcDays(pickup: string, ret: string): number {
  if (!pickup || !ret) return 0;
  const diff = new Date(ret).getTime() - new Date(pickup).getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

function calcPrice(booking: BookingInfo, liveRate: number | null) {
  const rate = liveRate ?? getExchangeRate();
  const vehicle = fleet.find((v) => v.slug === booking.vehicleSlug);
  const days = calcDays(booking.pickupDate, booking.returnDate);

  const vehicleCRC = (vehicle?.pricePerDayCRC ?? 0) * days;
  // extras fijados en USD → convertir a CRC con tipo de cambio del día
  const zdCRC = booking.extraZeroDeductible ? usdToCrc(15 * days, rate) : 0;
  const csCRC = booking.extraChildSeat ? usdToCrc(10 * days, rate) : 0;
  const pickupTransferCRC = booking.airportPickup ? transportRules.rentalAddonPriceCRC : 0;
  const returnTransferCRC = booking.returnTransfer ? transportRules.rentalAddonPriceCRC : 0;
  const totalCRC = vehicleCRC + zdCRC + csCRC + pickupTransferCRC + returnTransferCRC;
  const depositCRC = totalCRC * 0.5;

  return { vehicle, days, vehicleCRC, zdCRC, csCRC, pickupTransferCRC, returnTransferCRC, totalCRC, depositCRC, rate };
}

/* Formatea en la moneda seleccionada */
function fmt(crc: number, currency: 'CRC' | 'USD', rate: number): string {
  return currency === 'USD' ? formatUSD(crcToUsd(crc, rate)) : formatCRC(crc);
}

/* ── Helpers ── */
const MONTHS_ES = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];

function fmtDate(iso: string): string {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${parseInt(d)} ${MONTHS_ES[parseInt(m) - 1]} ${y}`;
}

/* ── WhatsApp message ── */
function buildMessage(
  booking: BookingInfo,
  contact: ContactInfo,
  currency: 'CRC' | 'USD',
  rate: number,
  isEnglish: boolean,
): string {
  const { vehicle, days, totalCRC, depositCRC } = calcPrice(booking, rate);

  const totalDisplay = fmt(totalCRC, currency, rate);
  const depositDisplay = fmt(depositCRC, currency, rate);
  const currencyLabel = currency === 'USD' ? 'USD' : 'CRC';

  const extras: string[] = [];
  if (booking.extraZeroDeductible) extras.push('0 deducible (+$15/dia)');
  if (booking.extraChildSeat) extras.push('Silla para ninos (+$10/dia)');

  const locationLabels: Record<string, string> = {
    turrialba: 'Sucursal Turrialba',
    airport: 'Aeropuerto Juan Santamaria (SJO)',
    other: booking.notes ? 'Otro (ver notas)' : 'Otro',
    'turrialba-area': 'Alrededores de Turrialba',
  };

  // Transporte al aeropuerto — cada línea solo si aplica
  const transferPrice = formatCRC(transportRules.rentalAddonPriceCRC);
  const transferLines: string[] = [];
  if (booking.airportPickup) {
    const arrival = formatCrLocalEs(booking.flightArrival);
    transferLines.push(
      `*Recogida en aeropuerto:* Sí — Vuelo ${booking.flightNumber.trim()}, llega ${arrival.date} ${arrival.time} (${transferPrice})`,
    );
  }
  if (booking.pickupLocation === 'turrialba-area') {
    transferLines.push(`*Entrega del carro:* ${booking.deliveryPlace.trim()} (a cotizar)`);
  }
  if (booking.returnTransfer) {
    const departure = formatCrLocalEs(booking.returnFlightDeparture);
    transferLines.push(`*Traslado de regreso:* Sí — Vuelo de salida: ${departure.date} a las ${departure.time} (${transferPrice})`);
  }

  const closingLines: string[] = [];
  if (contact.requirementsConfirmed) {
    closingLines.push(`*Confirma requisitos:* Sí (${rentalRequirements.map((r) => r.short).join(', ')})`);
  }
  if (isEnglish) closingLines.push('*Idioma del cliente:* Inglés');

  const sep = '━━━━━━━━━━━━━━━━━━━━';

  return `*SLOTH RENT A CAR*
*Nueva solicitud de reserva*
${sep}

*Vehiculo:* ${vehicle ? `${vehicle.name} ${vehicle.year}` : '—'}
*Entrega:* ${locationLabels[booking.pickupLocation] ?? booking.pickupLocation}
*Recogida:* ${fmtDate(booking.pickupDate)}
*Devolucion:* ${fmtDate(booking.returnDate)}
*Dias:* ${days}
*Extras:* ${extras.length > 0 ? extras.join(' | ') : 'Ninguno'}${transferLines.length > 0 ? `\n${transferLines.join('\n')}` : ''}

${sep}
*Total estimado:* ~${totalDisplay} ${currencyLabel}
*Anticipo (50%):* ~${depositDisplay} ${currencyLabel}
_T/C referencia: ${rate.toLocaleString('es-CR')} CRC/USD_

${sep}
*Nombre:* ${contact.name}
*WhatsApp:* ${contact.countryCode} ${contact.phone}
*Email:* ${contact.email || '—'}
*Notas:* ${booking.notes || '—'}${closingLines.length > 0 ? `\n\n${closingLines.join('\n')}` : ''}`;
}

/* ── Component ── */
export default function ReservationModal({
  open,
  onClose,
  preselectedVehicle,
  preselectedPickupDate,
  preselectedReturnDate,
  currency = 'CRC',
  rate: rateProp = null,
}: Props) {
  const t = useTranslations('modal');
  const tTips = useTranslations('infoTips');
  const locale = useLocale();

  const [step, setStep] = useState(1);
  const [booking, setBooking] = useState<BookingInfo>({
    vehicleSlug: preselectedVehicle?.slug ?? '',
    pickupDate: preselectedPickupDate ?? '',
    returnDate: preselectedReturnDate ?? '',
    pickupLocation: 'turrialba',
    extraZeroDeductible: false,
    extraChildSeat: false,
    notes: '',
    airportPickup: false,
    flightNumber: '',
    flightArrival: '',
    deliveryPlace: '',
    returnTransfer: false,
    returnFlightDeparture: '',
  });
  const [contact, setContact] = useState<ContactInfo>({
    name: '',
    countryCode: '+506',
    phone: '',
    email: '',
    requirementsConfirmed: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [flightTooSoon, setFlightTooSoon] = useState(false);
  const [minFlightArrival, setMinFlightArrival] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Sincroniza las preselecciones del padre (ajuste de estado durante el render, sin efecto)
  const [prevPreselected, setPrevPreselected] = useState({ preselectedVehicle, preselectedPickupDate, preselectedReturnDate });
  if (
    prevPreselected.preselectedVehicle !== preselectedVehicle ||
    prevPreselected.preselectedPickupDate !== preselectedPickupDate ||
    prevPreselected.preselectedReturnDate !== preselectedReturnDate
  ) {
    setPrevPreselected({ preselectedVehicle, preselectedPickupDate, preselectedReturnDate });
    setBooking((s) => ({
      ...s,
      vehicleSlug: preselectedVehicle?.slug ?? s.vehicleSlug,
      pickupDate: preselectedPickupDate ?? s.pickupDate,
      returnDate: preselectedReturnDate ?? s.returnDate,
    }));
  }

  // Al cerrar, vuelve al paso 1 y limpia errores
  const [prevOpen, setPrevOpen] = useState(open);
  if (prevOpen !== open) {
    setPrevOpen(open);
    if (!open) {
      setStep(1);
      setErrors({});
    }
  }

  useEffect(() => {
    if (!open) return;
    // Lock body scroll — iOS-safe (position:fixed keeps page from scrolling under the modal)
    const y = window.scrollY;
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${y}px`;
    document.body.style.width = '100%';
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, y);
    };
  }, [open]);

  // Siempre la tasa de Hacienda (la misma en todo el sitio); 500 solo si la API no responde
  const { rate: liveRate } = useCurrencyRate();
  const price = calcPrice(booking, rateProp ?? liveRate);

  const availableVehicles = fleet.filter(
    (v) => !(v.note === 'availability-limited' && !isSantaFeAvailable())
  );

  const today = new Date().toISOString().split('T')[0];
  const minReturn = booking.pickupDate
    ? new Date(new Date(booking.pickupDate).getTime() + 86400000).toISOString().split('T')[0]
    : today;

  /* Validation */
  function validateStep1(): boolean {
    const e: Record<string, string> = {};
    if (!booking.vehicleSlug) e.vehicle = t('required');
    if (!booking.pickupDate) e.pickupDate = t('required');
    if (!booking.returnDate) e.returnDate = t('required');
    if (booking.pickupDate && booking.returnDate && calcDays(booking.pickupDate, booking.returnDate) < 1) {
      e.returnDate = t('minDays');
    }
    let tooSoon = false;
    if (booking.airportPickup) {
      if (!booking.flightNumber.trim()) e.flightNumber = t('required');
      if (!booking.flightArrival) e.flightArrival = t('required');
      else tooSoon = !meetsMinNotice(booking.flightArrival, transportRules.minNoticeHours);
    }
    if (booking.pickupLocation === 'turrialba-area' && !booking.deliveryPlace.trim()) {
      e.deliveryPlace = t('required');
    }
    if (booking.returnTransfer) {
      if (!booking.returnFlightDeparture) e.returnFlightDeparture = t('required');
      else if (booking.returnDate && booking.returnFlightDeparture.slice(0, 10) < booking.returnDate) {
        e.returnFlightDeparture = t('returnFlightBeforeReturn');
      }
    }
    setFlightTooSoon(tooSoon);
    setErrors(e);
    return Object.keys(e).length === 0 && !tooSoon;
  }

  function validateStep2(): boolean {
    const e: Record<string, string> = {};
    if (!contact.name.trim()) e.name = t('required');
    if (!contact.phone.trim()) e.phone = t('required');
    if (!contact.requirementsConfirmed) e.requirements = t('requirementsError');
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleNext() {
    if (!validateStep1()) return;
    setStep(2);
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleSend() {
    if (!validateStep2()) return;
    const msg = buildMessage(booking, contact, currency, price.rate, locale === 'en');
    window.open(buildWhatsAppUrl(msg), '_blank', 'noopener,noreferrer');
    onClose();
  }

  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          aria-hidden="true"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 60, scale: 0.97 }}
          transition={{ type: 'spring', damping: 30, stiffness: 400 }}
          className="relative z-10 w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-sand">
            <div>
              <h2 className="font-heading text-forest text-xl font-bold">{t('title')}</h2>
              <p className="text-xs text-forest-muted mt-0.5">
                {t('stepOf', { current: step, total: 2 })} —{' '}
                <span className="font-medium">{step === 1 ? t('step1') : t('step2')}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              aria-label={t('close')}
              className="w-9 h-9 rounded-full bg-sand hover:bg-sand-dark flex items-center justify-center transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-forest" aria-hidden="true">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-sand">
            <motion.div
              className="h-full bg-amber rounded-full"
              animate={{ width: step === 1 ? '50%' : '100%' }}
              transition={{ duration: 0.4 }}
            />
          </div>

          {/* Body */}
          <div ref={scrollRef} className="overflow-y-auto flex-1 px-6 py-5 scroll-hide">
            <AnimatePresence mode="wait">
              {/* ── STEP 1: Booking details ── */}
              {step === 1 ? (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4"
                >
                  {/* Vehicle */}
                  <div>
                    <label htmlFor="modal-vehicle" className="block text-sm font-medium text-forest mb-1.5">{t('vehicle')}</label>
                    <select
                      id="modal-vehicle"
                      value={booking.vehicleSlug}
                      onChange={(e) => setBooking({ ...booking, vehicleSlug: e.target.value })}
                      className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-forest/30 bg-white transition-colors ${
                        errors.vehicle ? 'border-red-400' : 'border-sand-dark'
                      }`}
                    >
                      <option value="">{t('selectVehicle')}</option>
                      {availableVehicles.map((v) => (
                        <option key={v.slug} value={v.slug}>
                          {v.name} {v.year} — {fmt(v.pricePerDayCRC, currency, price.rate)}/día
                        </option>
                      ))}
                    </select>
                    {errors.vehicle && <p className="text-red-500 text-xs mt-1">{errors.vehicle}</p>}
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-1 min-[480px]:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="modal-pickup-date" className="block text-sm font-medium text-forest mb-1.5">{t('pickupDate')}</label>
                      <input
                        id="modal-pickup-date"
                        type="date"
                        min={today}
                        value={booking.pickupDate}
                        onChange={(e) => setBooking({ ...booking, pickupDate: e.target.value, returnDate: '' })}
                        className={`w-full border rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-forest/30 transition-colors ${
                          errors.pickupDate ? 'border-red-400' : 'border-sand-dark'
                        }`}
                      />
                      {errors.pickupDate && <p className="text-red-500 text-xs mt-1">{errors.pickupDate}</p>}
                    </div>
                    <div>
                      <label htmlFor="modal-return-date" className="block text-sm font-medium text-forest mb-1.5">{t('returnDate')}</label>
                      <input
                        id="modal-return-date"
                        type="date"
                        min={minReturn}
                        value={booking.returnDate}
                        onChange={(e) => setBooking({ ...booking, returnDate: e.target.value })}
                        className={`w-full border rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-forest/30 transition-colors ${
                          errors.returnDate ? 'border-red-400' : 'border-sand-dark'
                        }`}
                      />
                      {errors.returnDate && <p className="text-red-500 text-xs mt-1">{errors.returnDate}</p>}
                    </div>
                  </div>

                  {/* Airport transfers */}
                  <div className="rounded-2xl border border-sand-dark p-4 space-y-3">
                    <p className="text-sm font-medium text-forest">{t('transfers')}</p>
                    <label htmlFor="modal-airport-pickup" className="flex items-start gap-3 cursor-pointer group">
                      <input
                        id="modal-airport-pickup"
                        type="checkbox"
                        checked={booking.airportPickup}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          // Con recogida en aeropuerto el carro se entrega en Turrialba o alrededores
                          setBooking({ ...booking, airportPickup: checked, pickupLocation: 'turrialba', deliveryPlace: '' });
                          if (!checked) {
                            setFlightTooSoon(false);
                            setErrors((e) => omitKeys(e, 'flightNumber', 'flightArrival', 'deliveryPlace'));
                          }
                        }}
                        className="w-4 h-4 mt-0.5 flex-none accent-forest rounded"
                      />
                      <span className="text-sm text-forest-muted group-hover:text-forest transition-colors leading-snug">
                        {t('airportPickup', { price: formatCRC(transportRules.rentalAddonPriceCRC) })}
                      </span>
                    </label>

                    {booking.airportPickup && (
                      <div className="grid grid-cols-1 min-[480px]:grid-cols-2 gap-3 pl-7">
                        <div>
                          <label htmlFor="modal-flight-number" className="block text-sm font-medium text-forest mb-1.5">{t('flightNumber')}</label>
                          <input
                            id="modal-flight-number"
                            type="text"
                            autoCapitalize="characters"
                            placeholder={t('flightNumberPlaceholder')}
                            value={booking.flightNumber}
                            onChange={(e) => setBooking({ ...booking, flightNumber: e.target.value.toUpperCase() })}
                            className={`w-full border rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-forest/30 transition-colors ${
                              errors.flightNumber ? 'border-red-400' : 'border-sand-dark'
                            }`}
                          />
                          {errors.flightNumber && <p className="text-red-500 text-xs mt-1">{errors.flightNumber}</p>}
                        </div>
                        <div>
                          <label htmlFor="modal-flight-arrival" className="flex items-center gap-2 text-sm font-medium text-forest mb-1.5">
                            {t('flightArrival')}
                            <InfoTip text={tTips('notice')} />
                          </label>
                          <input
                            id="modal-flight-arrival"
                            type="datetime-local"
                            min={minFlightArrival || undefined}
                            onFocus={() => setMinFlightArrival(crLocalNowPlusHours(transportRules.minNoticeHours))}
                            value={booking.flightArrival}
                            onChange={(e) => {
                              const value = e.target.value;
                              setBooking({ ...booking, flightArrival: value });
                              setFlightTooSoon(!!value && !meetsMinNotice(value, transportRules.minNoticeHours));
                            }}
                            className={`w-full border rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-forest/30 transition-colors min-h-[46px] bg-white ${
                              errors.flightArrival || flightTooSoon ? 'border-red-400' : 'border-sand-dark'
                            }`}
                          />
                          {errors.flightArrival && <p className="text-red-500 text-xs mt-1">{errors.flightArrival}</p>}
                        </div>
                        {flightTooSoon && (
                          <div role="alert" className="min-[480px]:col-span-2 rounded-xl border border-amber/40 bg-amber/10 p-3">
                            <p className="text-xs text-forest-dark leading-relaxed">{t('tooSoon')}</p>
                            <a
                              href={`https://wa.me/${getWhatsAppNumber()}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-2 inline-flex items-center rounded-full bg-[#25D366] hover:brightness-95 text-white text-xs font-semibold px-3 py-1.5 transition"
                            >
                              {t('tooSoonCta')}
                            </a>
                          </div>
                        )}
                      </div>
                    )}

                    <label htmlFor="modal-return-transfer" className="flex items-start gap-3 cursor-pointer group">
                      <input
                        id="modal-return-transfer"
                        type="checkbox"
                        checked={booking.returnTransfer}
                        onChange={(e) => {
                          setBooking({ ...booking, returnTransfer: e.target.checked, returnFlightDeparture: '' });
                          if (!e.target.checked) setErrors((err) => omitKeys(err, 'returnFlightDeparture'));
                        }}
                        className="w-4 h-4 mt-0.5 flex-none accent-forest rounded"
                      />
                      <span className="text-sm text-forest-muted group-hover:text-forest transition-colors leading-snug">
                        {t('returnTransfer', { price: formatCRC(transportRules.rentalAddonPriceCRC) })}
                      </span>
                    </label>

                    {booking.returnTransfer && (
                      <div className="pl-7">
                        <label htmlFor="modal-return-flight-departure" className="block text-sm font-medium text-forest mb-1.5">{t('returnFlightDeparture')}</label>
                        <input
                          id="modal-return-flight-departure"
                          type="datetime-local"
                          min={booking.returnDate ? `${booking.returnDate}T00:00` : undefined}
                          value={booking.returnFlightDeparture}
                          onChange={(e) => {
                            setBooking({ ...booking, returnFlightDeparture: e.target.value });
                            setErrors((err) => omitKeys(err, 'returnFlightDeparture'));
                          }}
                          className={`w-full min-[480px]:w-1/2 border rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-forest/30 min-h-[46px] bg-white transition-colors ${
                            errors.returnFlightDeparture ? 'border-red-400' : 'border-sand-dark'
                          }`}
                        />
                        <p className="text-[11px] text-forest-muted mt-1">{t('returnFlightDepartureHint')}</p>
                        {errors.returnFlightDeparture && <p className="text-red-500 text-xs mt-1">{errors.returnFlightDeparture}</p>}
                      </div>
                    )}
                  </div>

                  {/* Location */}
                  <div>
                    <label htmlFor="modal-location" className="flex items-center gap-2 text-sm font-medium text-forest mb-1.5">
                      {t('pickupLocation')}
                      {booking.airportPickup && <InfoTip text={tTips('turrialbaArea')} />}
                    </label>
                    <select
                      id="modal-location"
                      value={booking.pickupLocation}
                      onChange={(e) => setBooking({ ...booking, pickupLocation: e.target.value, deliveryPlace: '' })}
                      className="w-full border border-sand-dark rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-forest/30 bg-white"
                    >
                      {booking.airportPickup ? (
                        <>
                          <option value="turrialba">{t('locationTurrialba')}</option>
                          <option value="turrialba-area">{t('locationTurrialbaArea')}</option>
                        </>
                      ) : (
                        <>
                          <option value="turrialba">{t('locationTurrialba')}</option>
                          <option value="airport">{t('locationAirport')}</option>
                          <option value="other">{t('locationOther')}</option>
                        </>
                      )}
                    </select>
                  </div>

                  {booking.pickupLocation === 'turrialba-area' && (
                    <div>
                      <label htmlFor="modal-delivery-place" className="block text-sm font-medium text-forest mb-1.5">{t('deliveryPlace')}</label>
                      <input
                        id="modal-delivery-place"
                        type="text"
                        placeholder={t('deliveryPlacePlaceholder')}
                        value={booking.deliveryPlace}
                        onChange={(e) => setBooking({ ...booking, deliveryPlace: e.target.value })}
                        className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-forest/30 transition-colors ${
                          errors.deliveryPlace ? 'border-red-400' : 'border-sand-dark'
                        }`}
                      />
                      {errors.deliveryPlace && <p className="text-red-500 text-xs mt-1">{errors.deliveryPlace}</p>}
                    </div>
                  )}

                  {/* Extras */}
                  <div>
                    <p className="text-sm font-medium text-forest mb-2">{t('extras')}</p>
                    <div className="space-y-2">
                      <label htmlFor="modal-extra-zd" className="flex items-center gap-3 cursor-pointer group">
                        <input
                          id="modal-extra-zd"
                          type="checkbox"
                          checked={booking.extraZeroDeductible}
                          onChange={(e) => setBooking({ ...booking, extraZeroDeductible: e.target.checked })}
                          className="w-4 h-4 accent-forest rounded"
                        />
                        <span className="text-sm text-forest-muted group-hover:text-forest transition-colors">
                          {t('extraZeroDeductible')}
                        </span>
                        <InfoTip text={tTips('deductible')} />
                      </label>
                      <label htmlFor="modal-extra-cs" className="flex items-center gap-3 cursor-pointer group">
                        <input
                          id="modal-extra-cs"
                          type="checkbox"
                          checked={booking.extraChildSeat}
                          onChange={(e) => setBooking({ ...booking, extraChildSeat: e.target.checked })}
                          className="w-4 h-4 accent-forest rounded"
                        />
                        <span className="text-sm text-forest-muted group-hover:text-forest transition-colors">
                          {t('extraChildSeat')}
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label htmlFor="modal-notes" className="block text-sm font-medium text-forest mb-1.5">{t('notes')}</label>
                    <textarea
                      id="modal-notes"
                      placeholder={t('notesPlaceholder')}
                      value={booking.notes}
                      onChange={(e) => setBooking({ ...booking, notes: e.target.value })}
                      rows={2}
                      className="w-full border border-sand-dark rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-forest/30 resize-none"
                    />
                  </div>

                  {/* Live price calculator */}
                  {price.vehicle && price.days > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-sand rounded-2xl p-4 text-sm space-y-2"
                    >
                      <p className="font-heading text-forest font-semibold text-base mb-3">{t('summary')}</p>

                      <div className="flex justify-between text-forest-muted">
                        <span>{price.vehicle.name} × {price.days} {price.days === 1 ? 'día' : 'días'}</span>
                        <span className="font-medium text-forest">{fmt(price.vehicleCRC, currency, price.rate)}</span>
                      </div>
                      {price.zdCRC > 0 && (
                        <div className="flex justify-between text-forest-muted">
                          <span>0 deducible × {price.days}d</span>
                          <span className="font-medium text-forest">{fmt(price.zdCRC, currency, price.rate)}</span>
                        </div>
                      )}
                      {price.csCRC > 0 && (
                        <div className="flex justify-between text-forest-muted">
                          <span>Silla niños × {price.days}d</span>
                          <span className="font-medium text-forest">{fmt(price.csCRC, currency, price.rate)}</span>
                        </div>
                      )}
                      {price.pickupTransferCRC > 0 && (
                        <div className="flex justify-between gap-3 text-forest-muted">
                          <span>{t('lineAirportPickup')}</span>
                          <span className="font-medium text-forest whitespace-nowrap">{fmt(price.pickupTransferCRC, currency, price.rate)}</span>
                        </div>
                      )}
                      {price.returnTransferCRC > 0 && (
                        <div className="flex justify-between gap-3 text-forest-muted">
                          <span>{t('lineReturnTransfer')}</span>
                          <span className="font-medium text-forest whitespace-nowrap">{fmt(price.returnTransferCRC, currency, price.rate)}</span>
                        </div>
                      )}
                      {booking.pickupLocation === 'turrialba-area' && (
                        <div className="flex justify-between gap-3 text-forest-muted">
                          <span className="min-w-0 break-words">
                            {t('lineDelivery', { place: booking.deliveryPlace.trim() || t('locationTurrialbaArea').split(' (')[0] })}
                          </span>
                          <span className="font-medium text-forest whitespace-nowrap">{t('toQuote')}</span>
                        </div>
                      )}

                      <div className="border-t border-sand-dark pt-2 mt-2">
                        <div className="flex justify-between font-semibold text-forest">
                          <span>{t('totalEstimated')}</span>
                          <span>{fmt(price.totalCRC, currency, price.rate)} {currency}</span>
                        </div>
                        <div className="flex justify-between text-amber font-semibold mt-1">
                          <span>{t('depositRequired')}</span>
                          <span>{fmt(price.depositCRC, currency, price.rate)} {currency}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 pt-2">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-forest flex-shrink-0" aria-hidden="true">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                        </svg>
                        <span className="text-xs font-semibold text-forest">{t('noHiddenFees')}</span>
                      </div>
                      <p className="text-xs text-forest-muted leading-relaxed">
                        {t('disclaimer', { deposit: price.vehicle.deposit })}
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              ) : (
                /* ── STEP 2: Contact info ── */
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4"
                >
                  {/* Booking summary pill */}
                  {price.vehicle && (
                    <div className="bg-sand rounded-2xl px-4 py-3 flex items-center justify-between text-sm">
                      <span className="font-semibold text-forest">{price.vehicle.name} {price.vehicle.year}</span>
                      <span className="text-forest-muted">
                        {price.days}d · {fmt(price.totalCRC, currency, price.rate)} {currency}
                      </span>
                    </div>
                  )}

                  {/* Name */}
                  <div>
                    <label htmlFor="modal-name" className="block text-sm font-medium text-forest mb-1.5">{t('name')}</label>
                    <input
                      id="modal-name"
                      type="text"
                      placeholder={t('namePlaceholder')}
                      value={contact.name}
                      onChange={(e) => setContact({ ...contact, name: e.target.value })}
                      className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-forest/30 transition-colors ${
                        errors.name ? 'border-red-400' : 'border-sand-dark'
                      }`}
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                  </div>

                  {/* Phone */}
                  <div>
                    <label htmlFor="modal-phone" className="block text-sm font-medium text-forest mb-1.5">{t('phone')}</label>
                    <div className="flex gap-2">
                      <select
                        aria-label={t('countryCode')}
                        value={contact.countryCode}
                        onChange={(e) => setContact({ ...contact, countryCode: e.target.value })}
                        className="border border-sand-dark rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-forest/30 bg-white"
                      >
                        {COUNTRY_CODES.map((c) => (
                          <option key={c.code} value={c.code}>{c.label}</option>
                        ))}
                      </select>
                      <input
                        id="modal-phone"
                        type="tel"
                        placeholder={t('phonePlaceholder')}
                        value={contact.phone}
                        onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                        className={`flex-1 border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-forest/30 transition-colors ${
                          errors.phone ? 'border-red-400' : 'border-sand-dark'
                        }`}
                      />
                    </div>
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="modal-email" className="block text-sm font-medium text-forest mb-1.5">{t('email')}</label>
                    <input
                      id="modal-email"
                      type="email"
                      placeholder={t('emailPlaceholder')}
                      value={contact.email}
                      onChange={(e) => setContact({ ...contact, email: e.target.value })}
                      className="w-full border border-sand-dark rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-forest/30"
                    />
                  </div>

                  {/* Requisitos */}
                  <div className={`rounded-2xl border p-4 ${errors.requirements ? 'border-red-400 bg-red-50/40' : 'border-sand-dark bg-cream'}`}>
                    <p className="font-heading text-forest font-semibold text-sm mb-2">{t('requirementsTitle')}</p>
                    <ul className="space-y-1.5 mb-3">
                      {rentalRequirements.map((r) => (
                        <li key={r.es} className="flex items-start gap-2 text-sm text-forest-muted">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-forest-light flex-none mt-0.5" aria-hidden="true">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                          </svg>
                          {locale === 'en' ? r.en : r.es}
                        </li>
                      ))}
                    </ul>
                    <label htmlFor="modal-requirements" className="flex items-center gap-3 cursor-pointer border-t border-sand-dark pt-3">
                      <input
                        id="modal-requirements"
                        type="checkbox"
                        checked={contact.requirementsConfirmed}
                        onChange={(e) => {
                          setContact({ ...contact, requirementsConfirmed: e.target.checked });
                          if (e.target.checked) setErrors((e) => omitKeys(e, 'requirements'));
                        }}
                        className="w-4 h-4 accent-forest rounded"
                      />
                      <span className="text-sm font-medium text-forest">{t('requirementsConfirm')}</span>
                    </label>
                    {errors.requirements && <p className="text-red-500 text-xs mt-2">{errors.requirements}</p>}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-sand flex gap-3">
            {step === 2 && (
              <button
                onClick={() => { setStep(1); setErrors({}); }}
                className="px-5 py-3 rounded-xl border border-sand-dark text-forest-muted hover:text-forest hover:border-forest text-sm font-medium transition-all duration-200"
              >
                {t('back')}
              </button>
            )}
            <button
              onClick={step === 1 ? handleNext : handleSend}
              className="flex-1 bg-amber hover:bg-amber-dark text-forest-dark font-semibold py-3 rounded-xl text-sm transition-all duration-200 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
            >
              {step === 1 ? (
                t('next')
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  {t('send')}
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
