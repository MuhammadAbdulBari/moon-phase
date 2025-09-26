import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [moonPhase, setMoonPhase] = useState(0); // 0..1 fraction
  const [phaseName, setPhaseName] = useState("");
  const [illumination, setIllumination] = useState(0); // percent
  const [daysSinceNew, setDaysSinceNew] = useState(0);

  const moonCycle = 29.5305882; // synodic month in days
  const msPerDay = 1000 * 60 * 60 * 24;

  const calculateMoonPhase = (date) => {
    // Known new moon reference (local time). This is just a commonly used reference.
    const knownNewMoon = new Date(2000, 0, 6, 18, 14, 0);
    const targetDate = new Date(date);
    const timeDiff = targetDate.getTime() - knownNewMoon.getTime();
    const daysDiff = timeDiff / msPerDay;

    // Ensure we get a positive modulo result then convert to 0..1
    const phaseDays = ((daysDiff % moonCycle) + moonCycle) % moonCycle;
    const phase = phaseDays / moonCycle;
    return phase;
  };

  const getPhaseName = (phase) => {
    // phase is 0..1 where 0 = new, 0.5 = full
    if (phase < 0.03 || phase >= 0.97) return "New Moon";
    if (phase < 0.22) return "Waxing Crescent";
    if (phase < 0.28) return "First Quarter";
    if (phase < 0.47) return "Waxing Gibbous";
    if (phase < 0.53) return "Full Moon";
    if (phase < 0.72) return "Waning Gibbous";
    if (phase < 0.78) return "Last Quarter";
    return "Waning Crescent";
  };

  const getIllumination = (phase) => {
    // Illumination percentage from 0..100 (0 new, 100 full)
    // When phase <= 0.5, illumination rises from 0 -> 100
    // After 0.5 it falls back to 0.
    if (phase <= 0.5) {
      return Math.round((phase / 0.5) * 100);
    } else {
      return Math.round(((1 - phase) / 0.5) * 100);
    }
  };

  const getShadowStyle = (phase) => {
    // Creates a clip-path for simple CSS shadow that approximates crescent/gibbous.
    // For phase <= 0.5 (waxing) we clip from the left; for phase>0.5 (waning) clip from right.
    if (phase <= 0.5) {
      const percent = (1 - (phase * 2)) * 100; // 100 -> 0
      // clamp percent to 0..100
      const p = Math.max(0, Math.min(100, percent));
      return { clipPath: `ellipse(${p}% 100% at 0% 50%)` };
    } else {
      const percent = ((phase - 0.5) * 2) * 100; // 0 -> 100
      const p = Math.max(0, Math.min(100, percent));
      return { clipPath: `ellipse(${p}% 100% at 100% 50%)` };
    }
  };

  const updateMoonPhase = (date) => {
    const phase = calculateMoonPhase(date);
    setMoonPhase(phase);
    setPhaseName(getPhaseName(phase));
    setIllumination(getIllumination(phase));
    setDaysSinceNew(Math.round(phase * moonCycle));
  };

  // When selectedDate changes, recalc moon info.
  useEffect(() => {
    updateMoonPhase(selectedDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  // Parse YYYY-MM-DD (from input) as a local date to avoid UTC offset issues
  const parseDateInputAsLocal = (value) => {
    // value format: "YYYY-MM-DD"
    const [y, m, d] = value.split("-").map((s) => parseInt(s, 10));
    return new Date(y, m - 1, d);
  };

  const handleDateChange = (event) => {
    const newDate = parseDateInputAsLocal(event.target.value);
    setSelectedDate(newDate);
    // don't call updateMoonPhase here — useEffect will handle it
  };

  const handleTodayClick = () => {
    setSelectedDate(new Date());
  };

  const handleRandomClick = () => {
    const start = new Date(1900, 0, 1);
    const end = new Date(2100, 11, 31);
    const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    setSelectedDate(randomDate);
  };

  const pad = (n) => (n < 10 ? "0" + n : n);

  // Format a Date as local yyyy-mm-dd for the date input value
  const formatDateForInput = (date) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };

  return (
    <div className="App">
      <div className="container">
        <h1>Moon Phase Calendar</h1>

        <div className="calendar-container">
          <input
            type="date"
            id="datePicker"
            value={formatDateForInput(selectedDate)}
            onChange={handleDateChange}
          />
          <button id="todayBtn" onClick={handleTodayClick}>
            Today
          </button>
          <button id="randomBtn" onClick={handleRandomClick}>
            Random Date
          </button>
        </div>

        <div className="moon-container">
          <div className="moon">
            <div className="moon-image" />
            <div className="shadow-mask" style={getShadowStyle(moonPhase)} />
          </div>

          <div className="moon-info">
            <h2>Moon Information</h2>
            <p id="phaseName">Phase: {phaseName}</p>
            <p id="phaseDate">Date: {selectedDate.toDateString()}</p>
            <p id="illumination">Illumination: {illumination}%</p>
            <p id="daysSinceNew">Days since new moon: {daysSinceNew}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
