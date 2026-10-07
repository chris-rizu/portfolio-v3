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
      const t = setTimeout(() => setGone(true), 900);
      return () => clearTimeout(t);
    }
    // never trap visitors behind the loader
    const bail = setTimeout(() => setState({ ready: true }), 20000);
    return () => clearTimeout(bail);
  }, [ready]);

  if (gone) return null;
  return (
    <div className={`loader ${ready ? "loader-done" : ""}`} role="status" aria-live="polite">
      <p className="loader-name">Chris Paolo Caral</p>
      <div className="loader-bar">
        <span style={{ transform: `scaleX(${progress / 100})` }} />
      </div>
      <p className="mono loader-pct">Loading the room — {String(Math.round(progress)).padStart(3, "0")}%</p>
    </div>
  );
}

/** Local time in Cebu, shown in the nav. Client-only to avoid a hydration mismatch. */
function CebuClock() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Manila", hour: "2-digit", minute: "2-digit" });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 20000);
    return () => clearInterval(id);
  }, []);
  return <span className="mono clock">CEBU {time}</span>;
}

function Nav() {
  const station = useStore((s) => s.station);
  return (
    <header className="nav">
      <button className="wordmark" onClick={() => goTo("intro")}>
        CPC<span>/26</span>
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
      <CebuClock />
      <a className="btn btn-sm" href={profile.resume} target="_blank" rel="noopener noreferrer">
        Résumé ↗
      </a>
    </header>
  );
}

function Intro() {
  const night = useStore((s) => s.night);
  return (
    <section id="intro" className="section section-intro">
      <div className="hero">
        <p className="tags mono">
          <span>Computer engineer</span>
          <span>Cebu, PH</span>
          <span className="tag-live">Open to work</span>
        </p>
        <h1 className="hero-name">
          Chris Paolo
          <br />
          Caral
        </h1>
        <p className="hero-lede">
          I build web apps for my city — fuel prices, government checklists, jeepney routes — and the internal
          tools and bots that keep small teams running.
        </p>
        <div className="hero-actions">
          <button className="btn btn-primary" onClick={() => goTo("projects")}>
            See the work →
          </button>
          <a className="btn" href={profile.resume} target="_blank" rel="noopener noreferrer">
            Résumé ↗
          </a>
        </div>
      </div>
      <p className="mono how" aria-hidden="true">
        <span className="how-drag">Drag to look around ·</span> Tap anything with a <i /> · tap the window for{" "}
        {night ? "golden hour" : "night"}
      </p>
    </section>
  );
}

function Panel({ label, fig, title, children }: { label: string; fig: string; title: ReactNode; children: ReactNode }) {
  return (
    <div className="panel">
      <div className="panel-bar mono">
        <span>{label}</span>
        <span>{fig}</span>
      </div>
      <div className="panel-body">
        <h2 className="panel-title">{title}</h2>
        {children}
      </div>
    </div>
  );
}

function SpecRow({ k, children }: { k: string; children: ReactNode }) {
  return (
    <div className="spec-row">
      <dt className="mono">{k}</dt>
      <dd>{children}</dd>
    </div>
  );
}

function About() {
  return (
    <section id="about" className="section">
      <Panel label="About" fig="Fig. 1 — The desk" title="I take things apart.">
        <p>
          Taking gadgets apart is how I started. It led me to Computer Engineering at Cebu Technological University,
          and now to writing software as a Software Engineer Intern at CIS.
        </p>
        <p>
          Outside work I build things Cebu needs: SugboGas tracks pump prices across the province, GovHub tells you
          exactly what to bring to a government office, and Lakbai finds you the right jeepney.
        </p>
        <dl className="spec">
          <SpecRow k="Based in">{profile.location}</SpecRow>
          <SpecRow k="Studied">{profile.education.degree}, CTU</SpecRow>
          <SpecRow k="Now">
            {experience[0].role}, {experience[0].company}
          </SpecRow>
          <SpecRow k="Shipped">{projects.length} projects</SpecRow>
        </dl>
      </Panel>
    </section>
  );
}

function Skills() {
  return (
    <section id="skills" className="section">
      <Panel label="Skills" fig="Fig. 2 — The shelf" title="What I build with.">
        <dl className="spec spec-wide">
          {skillGroups.map((g) => (
            <SpecRow key={g.label} k={g.label}>
              {g.skills.join(" · ")}
            </SpecRow>
          ))}
        </dl>
      </Panel>
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
          <h2 className="work-title">
            Work <span className="mono">({String(projects.length).padStart(2, "0")})</span>
          </h2>
          <p className="work-sub">
            Web apps for Cebu, internal tools for real teams, a couple of bots, and a robot that waters plants.
          </p>
          <div className="filters" role="tablist" aria-label="Filter projects">
            {projectFilters.map((f) => (
              <button
                key={f}
                role="tab"
                aria-selected={filter === f}
                className={`filter mono ${filter === f ? "filter-on" : ""}`}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </header>
        <ul className="grid">
          {list.map((p) => {
            const idx = projects.indexOf(p);
            return (
              <li key={p.title}>
                <button className="tile" onClick={() => setOpen(idx)}>
                  <span className="tile-img">
                    <Image
                      src={p.image}
                      alt={`${p.title} screenshot`}
                      fill
                      sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw"
                    />
                  </span>
                  <span className="tile-meta">
                    <span className="tile-top mono">
                      <span>{String(idx + 1).padStart(2, "0")}</span>
                      <span>{p.kind}</span>
                    </span>
                    <span className="tile-name">{p.title}</span>
                    <span className="tile-desc">{p.description}</span>
                    <span className="tile-cta mono">Open →</span>
                  </span>
                </button>
              </li>
            );
          })}
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
        <div className="dialog-bar mono">
          <span>
            {String(index + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")} — {projectCategory[p.title]}
          </span>
          <button onClick={onClose} aria-label="Close">
            Close ✕
          </button>
        </div>
        <div className="dialog-img">
          <Image src={p.image} alt={`${p.title} screenshot`} fill sizes="(max-width: 1100px) 100vw, 1100px" priority />
        </div>
        <div className="dialog-body">
          <div>
            <p className="mono dialog-kind">{p.kind}</p>
            <h3 className="dialog-title">{p.title}</h3>
            <p className="dialog-desc">{p.description}</p>
            <p className="mono dialog-tech">{p.tech.join(" / ")}</p>
          </div>
          <div className="dialog-actions">
            {p.link && (
              <a className="btn btn-primary" href={p.link} target="_blank" rel="noopener noreferrer">
                Visit site ↗
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
      </div>
    </div>,
    document.body,
  );
}

function Experience() {
  return (
    <section id="experience" className="section">
      <Panel label="Experience" fig="Fig. 3 — The reading chair" title="Where I've worked.">
        <ol className="rows">
          {experience.map((job) => (
            <li key={job.company + job.role}>
              <span className="mono row-k">{job.period}</span>
              <div>
                <h3>
                  {job.role} {job.current && <span className="tag-now mono">Now</span>}
                </h3>
                <p className="row-sub">{job.company}</p>
                <p className="row-desc">{job.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </Panel>
    </section>
  );
}

function Credentials() {
  return (
    <section id="certifications" className="section">
      <Panel label="Credentials" fig="Fig. 4 — The wall" title="Certificates & awards.">
        <ol className="rows">
          {awards.map((a) => (
            <li key={a.name}>
              <span className="mono row-k">{a.date}</span>
              <div>
                <h3>
                  {a.name} <span className="tag-now mono">{a.result}</span>
                </h3>
                <p className="row-desc">{a.detail}</p>
              </div>
            </li>
          ))}
          {certifications.map((c) => (
            <li key={c.name}>
              <span className="mono row-k">{c.date}</span>
              <div>
                <h3>{c.name}</h3>
                <p className="row-sub">
                  {"link" in c && c.link ? (
                    <a href={c.link} target="_blank" rel="noopener noreferrer">
                      {c.issuer} ↗
                    </a>
                  ) : (
                    c.issuer
                  )}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </Panel>
    </section>
  );
}

function Contact() {
  return (
    <section id="contact" className="section section-contact">
      <Panel label="Contact" fig="Fig. 5 — The window" title="Got something to build?">
        <p>I&apos;m open to roles, freelance work and collaborations. Email is the fastest way to reach me.</p>
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
      </Panel>
      <footer className="footer mono">
        <span>© 2026 {profile.name}</span>
        <span>
          3D assets: <a href="https://polyhaven.com" target="_blank" rel="noopener noreferrer">Poly Haven</a> (CC0)
        </span>
        <a href="https://chrispaolo.dev" target="_blank" rel="noopener noreferrer">
          Classic site ↗
        </a>
      </footer>
    </section>
  );
}
