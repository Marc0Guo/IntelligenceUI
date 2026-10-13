import { useMemo, useState } from "react";

const APPLY = {
  linkedin: "Apply on LinkedIn",
  indeed: "Apply on Indeed",
  upwork: "Apply on Upwork",
  ziprecruiter: "Apply on ZipRecruiter",
};

export function JobsCard({ node }) {
  const state = node.state;
  const label = APPLY[state.source] ?? "Apply";
  const href = state.apply_url_with_tracking;
  return (
    <article className="job-card" data-d-component="JobsWidget">
      <div className="job-head">
        <div className="job-title-block">
          <div className="job-company">
            {state.company_logo_url ? (
              <img className="logo" alt="" src={state.company_logo_url} width={20} height={20} />
            ) : null}
            {state.company ? <span>{state.company}</span> : null}
          </div>
          <h3>{state.title}</h3>
        </div>
        <ApplyLink className="apply apply-desktop" href={href} label={label} />
      </div>
      <div className="rule" />
      <div className="job-meta">
        <Meta icon={<Pin />} label="Location" value={state.location} />
        <Meta icon={<Pay />} label="Pay" value={state.salary} />
        <Meta icon={<Brief />} label="Term" value={state.employment_type} />
      </div>
      {state.role_summary ? <p className="job-summary">{state.role_summary}</p> : null}
      <ApplyLink className="apply apply-mobile" href={href} label={label} />
    </article>
  );
}

function ApplyLink({ href, label, className }) {
  if (!href) {
    return (
      <span className={className} aria-disabled="true">
        {label}
      </span>
    );
  }
  return (
    <a className={className} href={href} target="_blank" rel="noopener noreferrer">
      {label}
    </a>
  );
}

function Meta({ icon, label, value }) {
  if (value == null || value === "") return null;
  return (
    <span>
      {icon}
      <span className="meta-label">{label}</span>
      <span>{value}</span>
    </span>
  );
}

export function NewsCarousel({ node }) {
  const items = node.state?.items ?? [node.state];
  return (
    <div className="news-row" data-d-component={items.length > 1 ? "NewsArticleWidgetCarousel" : "NewsArticleWidget"}>
      {items.map((item) => (
        <a
          key={item.ref}
          className="news-card"
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open ${item.title}`}
        >
          <div className="news-top">
            <div>
              <div className="news-source">
                <Favicon domain={item.domain} label={item.source_label} />
                <span>{item.source_label}</span>
              </div>
              <h3>{item.title}</h3>
            </div>
            {item.thumbnail_url ? <img className="thumb" alt="" src={item.thumbnail_url} width={100} height={100} /> : null}
          </div>
          {item.snippet ? (
            <>
              <div className="rule" />
              <div className="news-body">
                {item.date_label ? <p className="news-date">{item.date_label}</p> : null}
                <p className="news-snippet">{item.snippet}</p>
              </div>
            </>
          ) : null}
        </a>
      ))}
    </div>
  );
}

function Favicon({ domain, label }) {
  const [failed, setFailed] = useState(false);
  if (!domain || failed) {
    return (
      <span className="favicon" aria-hidden="true">
        {(label || "?").slice(0, 1)}
      </span>
    );
  }
  return (
    <img
      className="favicon"
      alt=""
      width={20}
      height={20}
      src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`}
      onError={() => setFailed(true)}
    />
  );
}

const SCORERS = { gcs: scoreGcs, gbs: scoreGbs };

export function ClinicalCard({ node }) {
  const state = node.state;
  const score = SCORERS[node.scorer] ?? scoreGcs;
  const [section, setSection] = useState(state.active_info_section);
  const [values, setValues] = useState(state.values);
  const [copied, setCopied] = useState(false);
  const result = useMemo(() => score(values), [score, values]);
  const active = state.info_sections.find((item) => item.key === section) ?? state.info_sections[0];
  const summary = `${state.summary_prefix}: ${state.score_label} = ${result.displayScore}; ${result.detail}`;

  return (
    <section className="clinical" data-d-component={node.type}>
      <header className="clinical-head">
        <p className="clinical-kicker">
          <i />
          Clinical risk calculator
        </p>
        <h3>{state.title}</h3>
        <p>{state.subtitle}</p>
      </header>
      <div className="clinical-body">
        {state.info_sections.length > 0 ? (
          <>
            <div className="segmented clinical-tabs" role="group" aria-label="Calculator notes">
              {state.info_sections.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  aria-pressed={section === item.key}
                  onClick={() => setSection(item.key)}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="info-panel">{active?.body}</div>
          </>
        ) : null}
        <div className="score-row">
          <div className="score-box">
            <p>{state.score_label}</p>
            <strong>{result.displayScore}</strong>
            {state.score_range_label ? <span>{state.score_range_label}</span> : null}
          </div>
          <div className="score-box result">
            <p>{state.result_title}</p>
            {result.band ? <span className={`badge badge-${result.color}`}>{result.band}</span> : null}
            <span className="detail">{result.detail}</span>
          </div>
        </div>
        <div className="inputs-head">
          <h4>Inputs</h4>
          <button
            type="button"
            className="outline"
            onClick={() => {
              setValues(state.defaults);
              setCopied(false);
            }}
          >
            Reset
          </button>
        </div>
        {state.inputs.map((field) => (
          <label key={field.key} className="criterion">
            <span>{field.label}</span>
            <span className="control">
              {field.options ? (
                <select
                  aria-label={field.label}
                  value={values[field.key] ?? ""}
                  onChange={(event) => setValues({ ...values, [field.key]: event.target.value })}
                >
                  {field.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="number-field">
                  <input
                    aria-label={field.label}
                    inputMode="decimal"
                    value={values[field.key] ?? ""}
                    onChange={(event) => setValues({ ...values, [field.key]: event.target.value })}
                  />
                  {field.suffix ? <em>{field.suffix}</em> : null}
                </span>
              )}
            </span>
          </label>
        ))}
        {state.notes.length > 0 ? (
          <>
            <h4>Notes</h4>
            <div className="notes">
              {state.notes.map((note) => (
                <p key={note}>
                  <span>-</span>
                  <span>{note}</span>
                </p>
              ))}
            </div>
          </>
        ) : null}
        <h4>Copyable summary</h4>
        <p className="summary-box">{summary}</p>
        <button
          type="button"
          className="outline"
          onClick={() => {
            setCopied(true);
            navigator.clipboard?.writeText(summary).catch(() => {});
          }}
        >
          {copied ? "Copied" : "Copy summary"}
        </button>
      </div>
    </section>
  );
}

function scoreGcs(values) {
  const score = ["eye", "verbal", "motor"].reduce((total, key) => total + Number(values[key] || 0), 0);
  return {
    displayScore: String(score),
    band: score >= 13 ? "Mild brain injury range" : score >= 9 ? "Moderate brain injury range" : "Severe brain injury range",
    detail:
      score >= 13
        ? "GCS 13-15: mild impairment range."
        : score >= 9
          ? "GCS 9-12: moderate impairment range."
          : "GCS 3-8: severe impairment range, often prompting airway and critical-care considerations.",
    color: score >= 13 ? "success" : score >= 9 ? "warning" : "danger",
  };
}

function scoreGbs(values) {
  if (values.bun === "" || values.hemoglobin === "" || values.sbp === "" || values.pulse === "") {
    return {
      displayScore: "-",
      band: "Incomplete",
      detail: "Enter sex, BUN, hemoglobin, systolic blood pressure, and pulse to finish the GBS.",
      color: "secondary",
    };
  }
  const bun = Number(values.bun);
  const hgb = Number(values.hemoglobin);
  const sbp = Number(values.sbp);
  const score = Math.trunc(
    (bun >= 70 ? 6 : bun >= 28 ? 4 : bun >= 22.4 ? 3 : bun >= 18.2 ? 2 : 0) +
      (values.sex === "male" ? (hgb < 10 ? 6 : hgb < 12 ? 3 : hgb < 13 ? 1 : 0) : hgb < 10 ? 6 : hgb < 12 ? 1 : 0) +
      (sbp < 90 ? 3 : sbp < 100 ? 2 : sbp < 110 ? 1 : 0) +
      (Number(values.pulse) >= 100 ? 1 : 0) +
      Number(values.melena) +
      2 * Number(values.syncope) +
      2 * Number(values.hepatic_disease) +
      2 * Number(values.cardiac_failure),
  );
  if (score === 0) {
    return {
      displayScore: "0",
      band: "Very low-risk bleed",
      detail: "A Glasgow-Blatchford score of 0 identifies very low-risk patients who may be candidates for outpatient management.",
      color: "success",
    };
  }
  if (score <= 5) {
    return {
      displayScore: String(score),
      band: "Higher-risk bleed",
      detail: "Nonzero GBS suggests the need for hospital-based evaluation and likely endoscopy.",
      color: "warning",
    };
  }
  return {
    displayScore: String(score),
    band: "High-risk bleed",
    detail: "Higher GBS values suggest substantial need for intervention and closer monitoring.",
    color: "danger",
  };
}

function Pin() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10z" />
      <circle cx="12" cy="11" r="2" />
    </svg>
  );
}

function Pay() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M3 10h18" />
    </svg>
  );
}

function Brief() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5h8v2" />
    </svg>
  );
}
