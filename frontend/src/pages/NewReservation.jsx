import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { reservationAPI } from '../services/api';
import { ToastContext } from '../context/ToastContext';

const TIME_SLOTS = [
  { value: '12:00', label: '12:00 PM' },
  { value: '13:00', label: '1:00 PM' },
  { value: '14:00', label: '2:00 PM' },
  { value: '15:00', label: '3:00 PM' },
  { value: '16:00', label: '4:00 PM' },
  { value: '17:00', label: '5:00 PM' },
  { value: '18:00', label: '6:00 PM' },
  { value: '19:00', label: '7:00 PM' },
  { value: '20:00', label: '8:00 PM' },
  { value: '21:00', label: '9:00 PM' },
];

export default function NewReservation() {
  const navigate = useNavigate();
  const { addToast } = useContext(ToastContext);
  const [form, setForm] = useState({
    reservationDate: '',
    timeSlot: '',
    guestCount: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [checking, setChecking] = useState(false);

  const checkAvailability = async () => {
    if (!form.reservationDate || !form.guestCount) return;
    setChecking(true);
    try {
      const res = await reservationAPI.checkAvailability({
        date: form.reservationDate,
        guestCount: form.guestCount,
      });
      setAvailableSlots(res.data.availableSlots);
      if (res.data.availableSlots.length === 0 && !errors.noSlots) {
        setErrors((prev) => ({ ...prev, noSlots: 'No time slots available for this date and guest count.' }));
      } else {
        setErrors((prev) => {
          const { noSlots, ...rest } = prev;
          return rest;
        });
      }
    } catch {
      setAvailableSlots([]);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkAvailability();
  }, [form.reservationDate, form.guestCount]);

  const validate = () => {
    const errs = {};
    if (!form.reservationDate) errs.reservationDate = 'Please select a date';
    if (!form.guestCount || parseInt(form.guestCount) < 1) errs.guestCount = 'Guest count must be at least 1';
    if (parseInt(form.guestCount) > 20) errs.guestCount = 'Maximum 20 guests allowed';
    if (!form.timeSlot) errs.timeSlot = 'Please select a time slot';
    if (form.reservationDate) {
      const date = new Date(form.reservationDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (date < today) errs.reservationDate = 'Date cannot be in the past';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await reservationAPI.create({
        reservationDate: form.reservationDate,
        timeSlot: form.timeSlot,
        guestCount: parseInt(form.guestCount),
      });
      addToast(
        `Table #${res.data.reservation.table?.tableNumber} reserved for ${form.timeSlot}:00 on ${new Date(form.reservationDate).toLocaleDateString()}`,
        'success',
        'Reservation Confirmed!'
      );
      setTimeout(() => navigate('/reservations/my'), 1500);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create reservation';
      addToast(msg, 'error', 'Reservation Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const minDate = new Date().toISOString().split('T')[0];

  return (
    <div className="container main-content">
      <div className="page-header">
        <h2><i className="bi bi-plus-circle me-2" style={{ color: 'var(--color-primary)' }}></i>New Reservation</h2>
        <p className="text-muted mb-0">Choose your date, time, and guest count</p>
      </div>

      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-body">
              <form onSubmit={handleSubmit} noValidate>
                <div className="row g-4">
                  <div className="col-md-6">
                    <label className="form-label">Reservation Date</label>
                    <div className="input-group">
                      <span className="input-group-text"><i className="bi bi-calendar3"></i></span>
                      <input
                        type="date"
                        className={`form-control ${errors.reservationDate ? 'is-invalid' : ''}`}
                        value={form.reservationDate}
                        min={minDate}
                        onChange={(e) => setForm({ ...form, reservationDate: e.target.value, timeSlot: '' })}
                        required
                      />
                    </div>
                    {errors.reservationDate && <div className="text-danger small mt-1">{errors.reservationDate}</div>}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Number of Guests</label>
                    <div className="input-group">
                      <span className="input-group-text"><i className="bi bi-people"></i></span>
                      <input
                        type="number"
                        className={`form-control ${errors.guestCount ? 'is-invalid' : ''}`}
                        value={form.guestCount}
                        min="1"
                        max="20"
                        placeholder="1-20"
                        onChange={(e) => setForm({ ...form, guestCount: e.target.value, timeSlot: '' })}
                        required
                      />
                    </div>
                    {errors.guestCount && <div className="text-danger small mt-1">{errors.guestCount}</div>}
                  </div>
                </div>

                <div className="mt-4">
                  <label className="form-label">Available Time Slots</label>
                  {checking && (
                    <div className="d-flex align-items-center gap-2 text-muted mb-2">
                      <div className="spinner-border spinner-border-sm" />
                      <span>Checking availability...</span>
                    </div>
                  )}
                  {form.reservationDate && form.guestCount && !checking && (
                    <div className="row g-2">
                      {TIME_SLOTS.map((slot) => {
                        const isAvailable = availableSlots.includes(slot.value);
                        const isSelected = form.timeSlot === slot.value;
                        let btnClass = 'time-slot-btn';
                        if (isSelected) btnClass += ' selected';
                        else if (isAvailable) btnClass += ' available';

                        return (
                          <div className="col-4 col-md-2" key={slot.value}>
                            <button
                              type="button"
                              className={btnClass}
                              disabled={!isAvailable}
                              onClick={() => {
                                setForm({ ...form, timeSlot: slot.value });
                                setErrors((prev) => {
                                  const { timeSlot, ...rest } = prev;
                                  return rest;
                                });
                              }}
                            >
                              {slot.label.split(' ')[0]}
                              <small className="d-block" style={{ fontSize: '0.65rem', opacity: 0.7 }}>
                                {slot.label.split(' ')[1]}
                              </small>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {errors.timeSlot && <div className="text-danger small mt-1">{errors.timeSlot}</div>}
                  {errors.noSlots && <div className="text-warning small mt-1"><i className="bi bi-exclamation-circle me-1"></i>{errors.noSlots}</div>}
                </div>

                <div className="mt-4">
                  <button
                    type="submit"
                    className="btn btn-primary w-100"
                    disabled={submitting || !form.timeSlot}
                  >
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        Confirming...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-lg me-1"></i>Confirm Reservation
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
