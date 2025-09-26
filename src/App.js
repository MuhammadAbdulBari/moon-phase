import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [moonPhase, setMoonPhase] = useState(0);
  const [phaseName, setPhaseName] = useState("");
  const [illumination, setIllumination] = useState(0);
  const [daysSinceNew, setDaysSinceNew] = useState(0);

  const moonCycle = 29.5305882; 
  const msPerDay = 1000 * 60 * 60 * 24;

  const calculateMoonPhase = (date) => {
    const knownNewMoon = new Date(2000, 0, 6, 18, 14, 0);
    const targetDate = new Date(date);
    const timeDiff = targetDate.getTime() - knownNewMoon.getTime();
    const daysDiff = timeDiff / msPerDay;
    const phaseDays = ((daysDiff % moonCycle) + moonCycle) % moonCycle;
    const phase = phaseDays / moonCycle;
    return phase;
  };

  const getPhaseName = (phase) => {
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
    if (phase <= 0.5) {
      return Math.round((phase / 0.5) * 100);
    } else {
      return Math.round(((1 - phase) / 0.5) * 100);
    }
  };

  const getShadowStyle = (phase) => {
    if (phase <= 0.5) {
      const percent = (1 - (phase * 2)) * 100; 
      const p = Math.max(0, Math.min(100, percent));
      return { clipPath: `ellipse(${p}% 100% at 0% 50%)` };
    } else {
      const percent = ((phase - 0.5) * 2) * 100; 
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


  useEffect(() => {
    updateMoonPhase(selectedDate);
  }, [selectedDate]);

  const parseDateInputAsLocal = (value) => {
    const [y, m, d] = value.split("-").map((s) => parseInt(s, 10));
    return new Date(y, m - 1, d);
  };

  const handleDateChange = (event) => {
    const newDate = parseDateInputAsLocal(event.target.value);
    setSelectedDate(newDate);
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
