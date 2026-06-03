'use client';

import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { fleet, type Vehicle } from '@/lib/fleet';
import { formatUSD, crcToUsd, getExchangeRate, buildWhatsAppUrl, isSantaFeAvailable } from '@/lib/utils';

/* ── Country codes ── */
const COUNTRY_CODES = [
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
}

interface ContactInfo {
  name: string;
  countryCode: string;
  phone: string;
  email: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  preselectedVehicle?: Vehicle;
}

/* ── Price calculator ── */
function calcDays(pickup: string, ret: string): number {
  if (!pickup || !ret) return 0;
  const diff = new Date(ret).getTime() - new Date(pickup).getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

function usePrice(booking: BookingInfo) {
  const rate = getExchangeRate();
  const vehicle = fleet.find((v) => v.slug === booking.vehicleSlug);
  const days = calcDays(booking.pickupDate, booking.returnDate);

  const vehicleUSD = crcToUsd((vehicle?.pricePerDayCRC ?? 0) * days, rate);
  const zdUSD = booking.extraZeroDeductible ? 15 * days : 0;
  const csUSD = booking.extraChildSeat ? 10 * days : 0;
  const totalUSD = vehicleUSD + zdUSD + csUSD;
  const depositUSD = totalUSD * 0.5;

  return { vehicle, days, vehicleUSD, zdUSD, csUSD, totalUSD, depositUSD };
}

/* ── WhatsApp message ── */
function buildMessage(booking: BookingInfo, contact: ContactInfo, t: ReturnType<typeof useTranslations>): string {
  const price = (() => {
    const rate = getExchangeRate();
    const vehicle = fleet.find((v) => v.slug === booking.vehicleSlug);
    const days = calcDays(booking.pickupDate, booking.returnDate);
    const vehicleUSD = crcToUsd((vehicle?.pricePerDayCRC ?? 0) * days, rate);
    const zdUSD = booking.extraZeroDeductible ? 15 * days : 0;
    const csUSD = booking.extraChildSeat ? 10 * days : 0;
    const totalUSD = vehicleUSD + zdUSD + csUSD;
    return { vehicle, days, totalUSD, depositUSD: totalUSD * 0.5 };
  })();

  const extras: string[] = [];
  if (booking.extraZeroDeductible) extras.push('Cobertura 0 deducible (+$15/día)');
  if (booking.extraChildSeat) extras.push('Silla para niños (+$10/día)');

  const locationLabels: Record<string, string> = {
    turrialba: 'Sucursal Turrialba',
    airport: 'Aeropuerto Juan Santamaría (SJO)',
    other: booking.notes ? `Otro (ver notas)` : 'Otro',
  };

  return `🦥 *Nueva reserva — Sloth Rent a Car*

👤 Cliente: ${contact.name}
📱 WhatsApp: ${contact.countryCode} ${contact.phone}
📧 Email: ${contact.email || '—'}

🚗 Vehículo: ${price.vehicle ? `${price.vehicle.name} ${price.vehicle.year}` : '—'}
📍 Entrega: ${locationLabels[booking.pickupLocation] ?? booking.pickupLocation}
📅 Fecha entrega: ${booking.pickupDate}
📅 Fecha devolución: ${booking.returnDate}
🗓 Días: ${price.days}

➕ Extras: ${extras.length > 0 ? extras.join(', ') : 'Ninguno'}

💰 Total estimado: ~${formatUSD(price.totalUSD)} USD
💳 Anticipo requerido (50%): ~${formatUSD(price.depositUSD)} USD

📝 Notas: ${booking.notes || '—'}`;
}

/* ── Component ── */
export default function ReservationModal({ open, onClose, preselectedVehicle }: Props) {
  const t = useTranslations('modal');

  const [step, setStep] = useState(1);
  const [booking, setBooking] = useState<BookingInfo>({
    vehicleSlug: preselectedVehicle?.slug ?? '',
    pickupDate: '',
    returnDate: '',
    pickupLocation: 'turrialba',
    extraZeroDeductible: false,
    extraChildSeat: false,
    notes: '',
  });
  const [contact, setContact] = useState<ContactInfo>({
    name: '',
    countryCode: '+506',
    phone: '',
    email: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (preselectedVehicle) {
      setBooking((s) => ({ ...s, vehicleSlug: preselectedVehicle.slug }));
    }
  }, [preselectedVehicle]);

  useEffect(() => {
    if (!open) {
      setStep(1);
      setErrors({});
    }
  }, [open]);

  const price = usePrice(booking);

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
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function validateStep2(): boolean {
    const e: Record<string, string> = {};
    if (!contact.name.trim()) e.name = t('required');
    if (!contact.phone.trim()) e.phone = t('required');
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
    const msg = buildMessage(booking, contact, t);
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
                    <label className="block text-sm font-medium text-forest mb-1.5">{t('vehicle')}</label>
                    <select
                      value={booking.vehicleSlug}
                      onChange={(e) => setBooking({ ...booking, vehicleSlug: e.target.value })}
                      className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-forest/30 bg-white transition-colors ${
                        errors.vehicle ? 'border-red-400' : 'border-sand-dark'
                      }`}
                    >
                      <option value="">{t('selectVehicle')}</option>
                      {availableVehicles.map((v) => (
                        <option key={v.slug} value={v.slug}>
                          {v.name} {v.year} — {formatUSD(crcToUsd(v.pricePerDayCRC))}/día
                        </option>
                      ))}
                    </select>
                    {errors.vehicle && <p className="text-red-500 text-xs mt-1">{errors.vehicle}</p>}
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-forest mb-1.5">{t('pickupDate')}</label>
                      <input
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
                      <label className="block text-sm font-medium text-forest mb-1.5">{t('returnDate')}</label>
                      <input
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

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-forest mb-1.5">{t('pickupLocation')}</label>
                    <select
                      value={booking.pickupLocation}
                      onChange={(e) => setBooking({ ...booking, pickupLocation: e.target.value })}
                      className="w-full border border-sand-dark rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-forest/30 bg-white"
                    >
                      <option value="turrialba">{t('locationTurrialba')}</option>
                      <option value="airport">{t('locationAirport')}</option>
                      <option value="other">{t('locationOther')}</option>
                    </select>
                  </div>

                  {/* Extras */}
                  <div>
                    <p className="text-sm font-medium text-forest mb-2">{t('extras')}</p>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={booking.extraZeroDeductible}
                          onChange={(e) => setBooking({ ...booking, extraZeroDeductible: e.target.checked })}
                          className="w-4 h-4 accent-forest rounded"
                        />
                        <span className="text-sm text-forest-muted group-hover:text-forest transition-colors">
                          {t('extraZeroDeductible')}
                        </span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <input
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
                    <label className="block text-sm font-medium text-forest mb-1.5">{t('notes')}</label>
                    <textarea
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
                        <span className="font-medium text-forest">{formatUSD(price.vehicleUSD)}</span>
                      </div>
                      {price.zdUSD > 0 && (
                        <div className="flex justify-between text-forest-muted">
                          <span>0 deducible × {price.days}d</span>
                          <span className="font-medium text-forest">{formatUSD(price.zdUSD)}</span>
                        </div>
                      )}
                      {price.csUSD > 0 && (
                        <div className="flex justify-between text-forest-muted">
                          <span>Silla niños × {price.days}d</span>
                          <span className="font-medium text-forest">{formatUSD(price.csUSD)}</span>
                        </div>
                      )}

                      <div className="border-t border-sand-dark pt-2 mt-2">
                        <div className="flex justify-between font-semibold text-forest">
                          <span>{t('totalEstimated')}</span>
                          <span>{formatUSD(price.totalUSD)} USD</span>
                        </div>
                        <div className="flex justify-between text-amber font-semibold mt-1">
                          <span>{t('depositRequired')}</span>
                          <span>{formatUSD(price.depositUSD)} USD</span>
                        </div>
                      </div>

                      <p className="text-xs text-forest-muted pt-1 leading-relaxed">
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
                      <span className="text-forest-muted">{price.days}d · {formatUSD(price.totalUSD)} USD</span>
                    </div>
                  )}

                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-forest mb-1.5">{t('name')}</label>
                    <input
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
                    <label className="block text-sm font-medium text-forest mb-1.5">{t('phone')}</label>
                    <div className="flex gap-2">
                      <select
                        value={contact.countryCode}
                        onChange={(e) => setContact({ ...contact, countryCode: e.target.value })}
                        className="border border-sand-dark rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-forest/30 bg-white"
                      >
                        {COUNTRY_CODES.map((c) => (
                          <option key={c.code} value={c.code}>{c.label}</option>
                        ))}
                      </select>
                      <input
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
                    <label className="block text-sm font-medium text-forest mb-1.5">{t('email')}</label>
                    <input
                      type="email"
                      placeholder={t('emailPlaceholder')}
                      value={contact.email}
                      onChange={(e) => setContact({ ...contact, email: e.target.value })}
                      className="w-full border border-sand-dark rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-forest/30"
                    />
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
