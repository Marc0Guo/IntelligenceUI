import { useEffect, useMemo, useState } from "react";

function Card({ title, kicker, children, component }) {
  return (
    <section className="dil-card" data-d-component={component}>
      {kicker ? <p className="kicker">{kicker}</p> : null}
      {title ? <h3>{title}</h3> : null}
      {children}
    </section>
  );
}

export function WeatherCard({ node }) {
  const [unit, setUnit] = useState("f");
  const [hour, setHour] = useState(2);
  const temp = unit === "c" ? node.tempC : node.tempF;
  const selected = node.hours[hour];
  const max = Math.max(...node.hours.map((item) => (unit === "c" ? item.c : item.f)));

  return (
    <Card kicker={node.city} title={node.condition} component="weather">
      <div className="weather-top">
        <p className="temp">
          {temp}°{unit.toUpperCase()}
        </p>
        <div className="segmented" role="group" aria-label="Temperature unit">
          {["f", "c"].map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={unit === value}
              onClick={() => setUnit(value)}
            >
              °{value.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      <p className="muted">{node.summary}</p>
      <div className="hours" role="list">
        {node.hours.map((item, index) => {
          const value = unit === "c" ? item.c : item.f;
          return (
            <button
              key={item.label}
              type="button"
              className={index === hour ? "hour is-on" : "hour"}
              onClick={() => setHour(index)}
            >
              <span>{item.label}</span>
              <span className="bar-track">
                <span className="bar" style={{ height: `${(value / max) * 100}%` }} />
              </span>
              <span>{value}°</span>
            </button>
          );
        })}
      </div>
      <p className="muted">
        {selected.label}: {unit === "c" ? selected.c : selected.f}°
      </p>
    </Card>
  );
}

export function ClockCard({ node }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  const shifted = new Date(now.getTime() + node.offsetHours * 3600 * 1000);
  const hours = shifted.getUTCHours();
  const minutes = shifted.getUTCMinutes();
  const seconds = shifted.getUTCSeconds();
  const label = shifted.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  });

  return (
    <Card kicker={node.place} title={label} component="clock">
      <div className="clock" aria-hidden="true">
        <span className="hand hour" style={{ transform: `rotate(${(hours % 12) * 30 + minutes * 0.5}deg)` }} />
        <span className="hand minute" style={{ transform: `rotate(${minutes * 6}deg)` }} />
        <span className="hand second" style={{ transform: `rotate(${seconds * 6}deg)` }} />
      </div>
    </Card>
  );
}

export function ScheduleCard({ node }) {
  const [open, setOpen] = useState(0);
  return (
    <Card title={node.title} component="schedule">
      <ul className="schedule">
        {node.items.map((item, index) => (
          <li key={item.title}>
            <button
              type="button"
              aria-expanded={open === index}
              onClick={() => setOpen(open === index ? -1 : index)}
            >
              <span className="time">{item.time}</span>
              <span>
                <strong>{item.title}</strong>
                {open === index ? <span className="detail">{item.detail}</span> : null}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export function LocationCard({ node }) {
  return (
    <Card kicker={node.area} title={node.name} component="location">
      <div className="map" aria-hidden="true">
        <svg viewBox="0 0 320 140">
          <path d="M0 90 C40 70 70 100 110 86 C150 72 170 40 210 48 C250 56 270 90 320 78 L320 140 L0 140 Z" />
          <path d="M0 108 C60 96 90 118 140 108 C190 98 230 120 320 104" />
          <circle cx="168" cy="62" r="7" />
        </svg>
        <span className="pin">{node.name}</span>
      </div>
      <p className="muted">{node.note}</p>
    </Card>
  );
}

export function StockCard({ node }) {
  const ranges = Object.keys(node.ranges);
  const [range, setRange] = useState(ranges[0]);
  const [hover, setHover] = useState(null);
  const series = node.ranges[range];
  const path = useMemo(() => toPath(series), [series]);
  const shown = hover == null ? node.price : series[hover].toFixed(0);

  return (
    <Card kicker={node.symbol} title={node.name} component="stock">
      <div className="stock-top">
        <p className="temp">{shown}</p>
        <p className="up">{node.change}</p>
        <div className="segmented" role="group" aria-label="Chart range">
          {ranges.map((value) => (
            <button key={value} type="button" aria-pressed={range === value} onClick={() => setRange(value)}>
              {value}
            </button>
          ))}
        </div>
      </div>
      <svg
        className="chart"
        viewBox="0 0 320 120"
        data-d-stream-chart-reveal="true"
        onMouseLeave={() => setHover(null)}
        onMouseMove={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          const ratio = (event.clientX - rect.left) / rect.width;
          setHover(Math.max(0, Math.min(series.length - 1, Math.round(ratio * (series.length - 1)))));
        }}
      >
        <path d={path} />
      </svg>
      <p className="muted">{hover == null ? `${range} range` : `Point ${hover + 1} of ${series.length}`}</p>
    </Card>
  );
}

function toPath(series) {
  const min = Math.min(...series);
  const max = Math.max(...series);
  return series
    .map((value, index) => {
      const x = (index / (series.length - 1)) * 320;
      const y = 110 - ((value - min) / (max - min || 1)) * 90;
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

export function CurrencyCard({ node }) {
  const [amount, setAmount] = useState(String(node.amount));
  const [flipped, setFlipped] = useState(false);
  const from = flipped ? node.to : node.from;
  const to = flipped ? node.from : node.to;
  const rate = flipped ? 1 / node.rate : node.rate;
  const value = Number(amount);
  const converted = Number.isFinite(value) ? (value * rate).toFixed(2) : "—";

  return (
    <Card title="Currency" component="currency">
      <label className="field">
        <span>{from}</span>
        <input
          inputMode="decimal"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
        />
      </label>
      <button type="button" className="swap" onClick={() => setFlipped((value) => !value)}>
        Swap
      </button>
      <p className="result">
        {converted} <span>{to}</span>
      </p>
      <p className="muted">
        1 {from} = {rate.toFixed(3)} {to}
      </p>
    </Card>
  );
}

export function PieCard({ node }) {
  const total = node.slices.reduce((sum, slice) => sum + slice.value, 0);
  let cursor = 0;
  const stops = node.slices.map((slice) => {
    const start = cursor;
    cursor += (slice.value / total) * 100;
    return `${slice.color} ${start}% ${cursor}%`;
  });

  return (
    <Card title={node.title} component="pie-chart">
      <div className="pie-row">
        <div className="pie" style={{ background: `conic-gradient(${stops.join(",")})` }} />
        <ul>
          {node.slices.map((slice) => (
            <li key={slice.label}>
              <i style={{ background: slice.color }} />
              {slice.label}
              <span>{slice.value}%</span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}

export function QuizCard({ node }) {
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState(null);
  const question = node.questions[step];
  const correct = picked === question.answer;

  return (
    <Card kicker={`Question ${step + 1} of ${node.questions.length}`} title={question.prompt} component="quiz">
      <div className="choices">
        {question.choices.map((choice, index) => {
          let state = "";
          if (picked != null && index === question.answer) state = "is-right";
          else if (picked === index) state = "is-wrong";
          return (
            <button key={choice} type="button" className={state} onClick={() => setPicked(index)} disabled={picked != null}>
              {choice}
            </button>
          );
        })}
      </div>
      {picked != null ? <p className="muted">{correct ? "That's the one." : "Not quite. The highlighted choice is the match."}</p> : null}
      {picked != null && step < node.questions.length - 1 ? (
        <button
          type="button"
          className="text-button"
          onClick={() => {
            setStep((value) => value + 1);
            setPicked(null);
          }}
        >
          Next
        </button>
      ) : null}
    </Card>
  );
}

export function Flashcard({ node }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <button type="button" className={flipped ? "flashcard is-flipped" : "flashcard"} onClick={() => setFlipped((value) => !value)} data-d-component="flashcard">
      <span>{flipped ? node.back : node.front}</span>
      <small>{flipped ? "Answer" : "Tap to flip"}</small>
    </button>
  );
}

export function CalculatorCard({ node }) {
  const [display, setDisplay] = useState(node.start);
  const [scientific, setScientific] = useState(false);

  function press(token) {
    if (token === "C") {
      setDisplay("0");
      return;
    }
    if (token === "=") {
      try {
        const safe = display.replace(/[^0-9+\-*/().]/g, "");
        const value = Function(`"use strict"; return (${safe})`)();
        setDisplay(String(value));
      } catch {
        setDisplay("Error");
      }
      return;
    }
    if (token === "√") {
      const value = Number(display);
      setDisplay(Number.isFinite(value) ? String(Math.sqrt(value)) : display);
      return;
    }
    setDisplay((current) => (current === "0" || current === "Error" ? token : current + token));
  }

  const keys = ["7", "8", "9", "/", "4", "5", "6", "*", "1", "2", "3", "-", "0", ".", "C", "=", "+"];
  const sci = ["√", "(", ")"];

  return (
    <Card title={node.title} component="calculator">
      <p className="calc-display">{display}</p>
      <button type="button" className="text-button" onClick={() => setScientific((value) => !value)}>
        {scientific ? "Hide scientific" : "Scientific"}
      </button>
      {scientific ? (
        <div className="keys sci">
          {sci.map((key) => (
            <button key={key} type="button" onClick={() => press(key)}>
              {key}
            </button>
          ))}
        </div>
      ) : null}
      <div className="keys">
        {keys.map((key) => (
          <button key={key} type="button" onClick={() => press(key)}>
            {key}
          </button>
        ))}
      </div>
    </Card>
  );
}

export function Followups({ node, onPick }) {
  return (
    <div className="followups" data-d-component="pressable">
      {node.items.map((item) => (
        <button key={item} type="button" onClick={() => onPick(item)}>
          {item}
        </button>
      ))}
    </div>
  );
}

export function StreamText({ text, words }) {
  const shown = text.trim().split(/\s+/).slice(0, words).join(" ");
  return (
    <p className="prose" data-d-component="text" data-d-stream-word="true">
      {shown}
    </p>
  );
}
