"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { Component, useCallback, useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useProgress } from "@react-three/drei";
import {
  awards,
  certifications,
  experience,
  profile,
  projectCategory,
  projectFilters,
  projects,
  skillGroups,
  type Project,
} from "@/data/portfolio";
import { sections } from "@/lib/stations";
import { goTo, rig, setState, useStore } from "@/lib/store";

const Workshop = dynamic(() => import("./scene/Workshop"), { ssr: false });

export function Portfolio() {
  useScrollDriver();
  return (
    <>
      <div className="scene" aria-hidden="true">
        <SceneBoundary>
          <Workshop />
        </SceneBoundary>
      </div>
      <Loader />
      <Nav />
      <main>
        <Intro />
        <About />
        <Skills />
        <Work />
        <Experience />
        <Credentials />
        <Contact />
      </main>
    </>
  );
}

/** Maps page scroll to a continuous camera station value. */
function useScrollDriver() {
  useEffect(() => {
    const els = sections.map((s) => document.getElementById(s.id)!);
    const update = () => {
      const vh = window.innerHeight;
      const line = window.scrollY + vh * 0.35;
      let s = 0;
      for (let i = 0; i < els.length; i++) {
        const top = els[i].offsetTop;
        const h = els[i].offsetHeight;
        if (line >= top + h) {
          s = i + 1;
          continue;
        }
        if (line >= top) {
          // hold on this station, then glide to the next over the section's last stretch
          const zone = Math.min(vh * 0.55, h * 0.5);
          const f = (line - top - (h - zone)) / zone;
          s = i + Math.min(Math.max(f, 0), 1);
        }
        break;
      }
      rig.s = Math.min(s, els.length - 1);
      setState({ station: Math.round(rig.s) });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);
}

/** If WebGL is unavailable the page still works as a plain, readable portfolio. */
class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    setState({ ready: true });
  }
  render() {
    return this.state.failed ? <div className="scene-fallback" /> : this.props.children;
  }
}

function Loader() {
  const ready = useStore((s) => s.ready);
  const { progress } = useProgress();
  const [gone, setGone] = useState(false);

  useEffect(() => {
    if (ready) {
      const t = setTimeout(() => setGone(true), 1000);
      return () => clearTimeout(t);
    }
    // never trap visitors behind the loader
    const bail = setTimeout(() => setState({ ready: true }), 20000);
    return () => clearTimeout(bail);
  }, [ready]);

  if (gone) return null;
  return (
    <div className={`loader ${ready ? "loader-done" : ""}`} role="status" aria-live="polite">
      <p className="loader-name">{profile.name}</p>
      <div className="loader-bar">
        <span style={{ transform: `scaleX(${progress / 100})` }} />
      </div>
      <p className="loader-pct">Setting up the room · {Math.round(progress)}%</p>
    </div>
  );
}

function Nav() {
  const station = useStore((s) => s.station);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <header className={`nav ${scrolled ? "nav-solid" : ""}`}>
      <button className="wordmark" onClick={() => goTo("intro")}>
        Chris Paolo Caral
      </button>
      <nav aria-label="Sections">
        {sections.slice(1).map((s, i) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className={station === i + 1 ? "active" : undefined}
            aria-current={station === i + 1 ? "true" : undefined}
          >
            {s.label}
          </a>
        ))}
      </nav>
      <a className="btn btn-sm" href={profile.resume} target="_blank" rel="noopener noreferrer">
        Résumé
      </a>
    </header>
  );
}

function Eyebrow({ n, children }: { n: number; children: ReactNode }) {
  return (
    <p className="eyebrow">
      <span>{String(n).padStart(2, "0")}</span>
      {children}
    </p>
  );
}

function Intro() {
  const station = useStore((s) => s.station);
  return (
    <section id="intro" className="section section-intro">
      <div className="hero">
        <p className="hero-kicker">
          <span className="dot" /> {profile.role} · {profile.location}
        </p>
        <h1 className="hero-name">
          Chris Paolo <em>Caral</em>
        </h1>
        <p className="hero-lede">
          I build web apps, automation, and the occasional robot. This is my room — scroll to walk through it.
        </p>
        <div className="hero-actions">
          <button className="btn btn-primary" onClick={() => goTo("projects")}>
            View my work
          </button>
          <a className="btn" href={profile.resume} target="_blank" rel="noopener noreferrer">
            Résumé ↗
          </a>
        </div>
      </div>
      <p className={`hint ${station === 0 ? "" : "hint-hidden"}`} aria-hidden="true">
        Tip: click the desk lamp
      </p>
      <div className="scroll-cue" aria-hidden="true">
        <span />
        Scroll
      </div>
    </section>
  );
}

function Card({ n, label, title, children }: { n: number; label: string; title: ReactNode; children: ReactNode }) {
  return (
    <div className="card">
      <Eyebrow n={n}>{label}</Eyebrow>
      <h2 className="card-title">{title}</h2>
      {children}
    </div>
  );
}

function About() {
  return (
    <section id="about" className="section">
      <Card n={1} label="About" title="Hardware brain, software hands.">
        <p className="lede">{profile.summary}</p>
        <div className="stats">
          <div>
            <b>{projects.length}</b>
            <span>projects built</span>
          </div>
          <div>
            <b>{experience.length}</b>
            <span>roles held</span>
          </div>
          <div>
            <b>{certifications.length + awards.length}</b>
            <span>credentials</span>
          </div>
        </div>
        <p className="muted small">
          {profile.education.degree} · {profile.education.school}
          <br />
          Now: {experience[0].role} at {experience[0].company}
        </p>
      </Card>
    </section>
  );
}

function Skills() {
  return (
    <section id="skills" className="section">
      <Card n={2} label="Skills" title="What I work with.">
        <div className="skill-groups">
          {skillGroups.map((g) => (
            <div key={g.label}>
              <p className="group-label">{g.label}</p>
              <p className="chips">
                {g.skills.map((s) => (
                  <span key={s} className="chip">
                    {s}
                  </span>
                ))}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
}

function Work() {
  const [filter, setFilter] = useState<(typeof projectFilters)[number]>("All");
  const [open, setOpen] = useState<number | null>(null);
  const list = projects.filter((p) => filter === "All" || projectCategory[p.title] === filter);

  return (
    <section id="projects" className="section-work">
      <div className="work-inner">
        <header className="work-head">
          <div>
            <Eyebrow n={3}>Selected work</Eyebrow>
            <h2 className="work-title">Things I&apos;ve built.</h2>
            <p className="muted">
              Web apps used around Cebu, internal tools for real teams, bots, and a robot that waters plants.
            </p>
          </div>
          <div className="filters" role="tablist" aria-label="Filter projects">
            {projectFilters.map((f) => (
              <button
                key={f}
                role="tab"
                aria-selected={filter === f}
                className={`filter ${filter === f ? "filter-on" : ""}`}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </header>
        <ul className="grid">
          {list.map((p) => (
            <li key={p.title}>
              <button className="tile" onClick={() => setOpen(projects.indexOf(p))}>
                <span className="tile-img">
                  <Image
                    src={p.image}
                    alt={`${p.title} screenshot`}
                    fill
                    sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 40vw"
                  />
                  <span className="tile-cta">View project →</span>
                </span>
                <span className="tile-meta">
                  <span className="tile-kind">{p.kind}</span>
                  <span className="tile-name">{p.title}</span>
                  <span className="tile-desc">{p.description}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      {open !== null && <ProjectDialog index={open} onIndex={setOpen} onClose={() => setOpen(null)} />}
    </section>
  );
}

function ProjectDialog({ index, onIndex, onClose }: { index: number; onIndex: (i: number) => void; onClose: () => void }) {
  const p: Project = projects[index];
  const step = useCallback((d: number) => onIndex((index + d + projects.length) % projects.length), [index, onIndex]);

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", key);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", key);
      document.body.style.overflow = "";
    };
  }, [onClose, step]);

  // portal to <body> so the dialog sits above the fixed nav and the 3D layer
  return createPortal(
    <div className="dialog-backdrop" onClick={onClose}>
      <div className="dialog" role="dialog" aria-modal="true" aria-label={p.title} onClick={(e) => e.stopPropagation()}>
        <div className="dialog-img">
          <Image src={p.image} alt={`${p.title} screenshot`} fill sizes="(max-width: 1100px) 100vw, 1100px" priority />
        </div>
        <div className="dialog-body">
          <div>
            <p className="tile-kind">
              {p.kind} · {projectCategory[p.title]}
            </p>
            <h3 className="dialog-title">{p.title}</h3>
            <p className="dialog-desc">{p.description}</p>
            <p className="chips">
              {p.tech.map((t) => (
                <span key={t} className="chip">
                  {t}
                </span>
              ))}
            </p>
          </div>
          <div className="dialog-actions">
            {p.link && (
              <a className="btn btn-primary" href={p.link} target="_blank" rel="noopener noreferrer">
                Visit live site ↗
              </a>
            )}
            <button className="btn" onClick={() => step(-1)} aria-label="Previous project">
              ←
            </button>
            <button className="btn" onClick={() => step(1)} aria-label="Next project">
              →
            </button>
          </div>
        </div>
        <button className="dialog-close" onClick={onClose} aria-label="Close">
          ×
        </button>
      </div>
    </div>,
    document.body,
  );
}

function Experience() {
  return (
    <section id="experience" className="section">
      <Card n={4} label="Experience" title="Where I've worked.">
        <ol className="timeline">
          {experience.map((job) => (
            <li key={job.company + job.role}>
              <div className="tl-head">
                <h3>{job.role}</h3>
                {job.current && <span className="badge">Now</span>}
              </div>
              <p className="tl-meta">
                {job.company} · {job.period}
              </p>
              <p className="muted small">{job.description}</p>
            </li>
          ))}
        </ol>
      </Card>
    </section>
  );
}

function Credentials() {
  return (
    <section id="certifications" className="section">
      <Card n={5} label="Credentials" title="Certified & recognized.">
        <ul className="creds">
          {awards.map((a) => (
            <li key={a.name}>
              <span className="cred-icon" aria-hidden="true">
                ★
              </span>
              <div>
                <h3>
                  {a.name} <span className="badge">{a.result}</span>
                </h3>
                <p className="muted small">
                  {a.date} · {a.detail}
                </p>
              </div>
            </li>
          ))}
          {certifications.map((c) => (
            <li key={c.name}>
              <span className="cred-icon" aria-hidden="true">
                ✓
              </span>
              <div>
                <h3>{c.name}</h3>
                <p className="muted small">
                  {"link" in c && c.link ? (
                    <a className="link" href={c.link} target="_blank" rel="noopener noreferrer">
                      {c.issuer} ↗
                    </a>
                  ) : (
                    c.issuer
                  )}{" "}
                  · {c.date}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </section>
  );
}

function Contact() {
  return (
    <section id="contact" className="section section-contact">
      <Card n={6} label="Contact" title="Let's build something.">
        <p className="lede">
          Open to roles, freelance work, and collaborations — web apps, automation, or anything with a circuit board in
          it.
        </p>
        <a className="contact-email" href={`mailto:${profile.email}`}>
          {profile.email}
        </a>
        <p className="contact-links">
          <a className="btn" href={profile.github} target="_blank" rel="noopener noreferrer">
            GitHub ↗
          </a>
          <a className="btn" href={profile.linkedin} target="_blank" rel="noopener noreferrer">
            LinkedIn ↗
          </a>
          <a className="btn" href={profile.resume} target="_blank" rel="noopener noreferrer">
            Résumé ↗
          </a>
        </p>
      </Card>
      <footer className="footer">
        © 2026 {profile.name} · Made in Cebu ·{" "}
        <a href="https://chrispaolo.dev" target="_blank" rel="noopener noreferrer">
          classic site
        </a>
      </footer>
    </section>
  );
}
