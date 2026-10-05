"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { m, useMotionValue, useSpring, useTransform } from "motion/react";
import { TechLogo } from "../ui/TechLogo";
import { ProjectMark } from "../ui/ProjectMark";
import { getTechnology, projectsUsing } from "../../content/tech";
import { projects } from "../../content/projects";
import { TiltCard } from "../motion/TiltCard";
import { hasFinePointer, prefersReducedMotion } from "../../lib/motion-env";
import { profile } from "../../content/profile";
import { LAYERS, type Layer } from "../../content/fde-layers";

type Short = { name: string; number: string; slug: string };

function shortTitle(title: string) {
  return title.split(/—|-/)[0].trim();
}

/** Connector between graph rows. Anchors land on the child column centres
 *  (25% / 75%) because the SVG always spans the full graph width. */
function Connector({ variant = "fan" }: { variant?: "stem" | "fan" | "converge" }) {
  const d =
    variant === "stem"
      ? "M50,0 V100"
      : variant === "fan"
        ? "M50,0 V42 M25,42 H75 M25,42 V100 M75,42 V100"
        : "M25,0 V42 M75,0 V42 M25,42 H75 M50,42 V100";
  return (
    <svg
      className="map__link-line"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <path d={d} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export function DeveloperDesk() {
  const ref = useRef<HTMLDivElement>(null);
  const enabled = useRef(false);
  const [active, setActive] = useState<string>("software");
  const [focusTech, setFocusTech] = useState<{ layer: string; tech: string } | null>(null);

  const px = useMotionValue(0);
  const py = useMotionValue(0);

  // Portrait is the primary depth object.
  const sx = useSpring(px, { stiffness: 120, damping: 16, mass: 0.7 });
  const sy = useSpring(py, { stiffness: 120, damping: 16, mass: 0.7 });

  // The graph counter-moves slightly so the two planes read as separate depths.
  const graphX = useTransform(sx, [-0.5, 0.5], [5, -5]);
  const graphY = useTransform(sy, [-0.5, 0.5], [4, -4]);

  useEffect(() => {
    enabled.current = !prefersReducedMotion() && hasFinePointer();
  }, []);

  /**
   * Project relationships derived from project stacks. The framing layer
   * owns every project; every other layer owns exactly the projects whose
   * verified stack contains one of its technologies.
   */
  const projectsByLayer = useMemo(() => {
    const map = new Map<string, Short[]>();
    for (const layer of LAYERS) {
      if (layer.id === "problem") {
        map.set(layer.id, projects.map((p) => ({ name: shortTitle(p.title), number: p.number, slug: p.slug })));
        continue;
      }
      const seen = new Map<string, Short>();
      for (const name of layer.techs) {
        const tech = getTechnology(name);
        if (!tech) continue;
        for (const project of projectsUsing(tech)) {
          seen.set(project.slug, {
            name: shortTitle(project.title),
            number: project.number,
            slug: project.slug,
          });
        }
      }
      map.set(
        layer.id,
        projects
          .filter((project) => seen.has(project.slug))
          .map((project) => seen.get(project.slug)!)
      );
    }
    return map;
  }, []);

  const projectsForTech = useMemo(() => {
    if (!focusTech) return [] as Short[];
    const tech = getTechnology(focusTech.tech);
    if (!tech) return [];
    return projectsUsing(tech).map((project) => ({
      name: shortTitle(project.title),
      number: project.number,
      slug: project.slug,
    }));
  }, [focusTech]);

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!enabled.current) return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    px.set((event.clientX - rect.left) / rect.width - 0.5);
    py.set((event.clientY - rect.top) / rect.height - 0.5);
  }

  function onPointerLeave() {
    px.set(0);
    py.set(0);
  }

  const activeLayer = LAYERS.find((layer) => layer.id === active) ?? LAYERS[1];
  const activeProjects = projectsByLayer.get(activeLayer.id) ?? [];

  const byId = (id: string) => LAYERS.find((l) => l.id === id)!;

  const node = (layer: Layer) => {
    const isActive = layer.id === active;
    const isEvaluation = layer.id === "evaluation";

    return (
      <li
        key={layer.id}
        className="map__node"
        data-span={layer.span || undefined}
        data-active={isActive || undefined}
        data-layer={layer.id}
      >
        <button
          type="button"
          className="map__core"
          aria-expanded={isActive}
          aria-controls="map-projects"
          onClick={() => {
            setActive(layer.id);
            setFocusTech(null);
          }}
          onMouseEnter={() => setActive(layer.id)}
          onFocus={() => setActive(layer.id)}
        >
          <span className="map__index">{layer.index}</span>
          <span className="map__name">{layer.label}</span>
        </button>

        {isEvaluation ? (
          <ul className="map__practices" aria-label="Evaluation disciplines">
            {layer.techs.map((name) => (
              <li key={name}>
                <button
                  type="button"
                  className="map__practice"
                  data-tech={name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}
                  data-on={focusTech?.tech === name || undefined}
                  onMouseEnter={() => {
                    setActive(layer.id);
                    setFocusTech({ layer: layer.id, tech: name });
                  }}
                  onFocus={() => {
                    setActive(layer.id);
                    setFocusTech({ layer: layer.id, tech: name });
                  }}
                  onClick={() => setFocusTech({ layer: layer.id, tech: name })}
                  onMouseLeave={() => setFocusTech(null)}
                  onBlur={() => setFocusTech(null)}
                >
                  <span className="map__practice-dot" aria-hidden="true" />
                  <span className="map__practice-name">{name}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : layer.techs.length > 0 ? (
          <ul className="map__techs">
            {layer.techs.map((name) => (
              <li key={name}>
                <button
                  type="button"
                  className="map__tech"
                  data-tech={name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}
                  data-on={focusTech?.tech === name || undefined}
                  onMouseEnter={() => {
                    setActive(layer.id);
                    setFocusTech({ layer: layer.id, tech: name });
                  }}
                  onFocus={() => {
                    setActive(layer.id);
                    setFocusTech({ layer: layer.id, tech: name });
                  }}
                  onClick={() => setFocusTech({ layer: layer.id, tech: name })}
                  onMouseLeave={() => setFocusTech(null)}
                  onBlur={() => setFocusTech(null)}
                  title={name}
                >
                  <TechLogo name={name} size={18} />
                  <span className="visually-hidden">{name}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}

      </li>
    );
  };

  return (
    <div
      className="desk"
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      <div className="desk__glow" aria-hidden="true" />

      {/* ── Plane 1: the portrait (human focal point) ─────────── */}
      <div className="desk__plane desk__plane--portrait">
        <TiltCard className="desk__stage" strength={1.8} lift={8}>
          <div className="desk__portrait-wrap">
            <div className="desk__portrait">
              <Image
                src={profile.portraitPath}
                alt={`${profile.name}, ${profile.professionalTitle.toLowerCase()}`}
                width={420}
                height={540}
                sizes="(max-width: 640px) 72vw, (max-width: 1200px) 320px, 360px"
                priority
                className="desk__portrait-img"
              />
              <span className="desk__portrait-frame" aria-hidden="true" />
            </div>
          </div>

          <p className="desk__avail">
            <span className="pulse-dot" aria-hidden="true" />
            {profile.baseLine}
          </p>
        </TiltCard>
      </div>

      {/* ── Plane 2: the capability system (engineering focus) ── */}
      <m.div
        className="desk__plane desk__plane--map"
        style={{ x: graphX, y: graphY }}
      >
        <div className="map">
          <p className="map__label">
            <span className="map__label-rule" aria-hidden="true" />
            FDE capability system
          </p>

          {/* Root */}
          <div className="map__root">
            <span className="map__root-ring" aria-hidden="true">
              <span className="map__root-dot" />
            </span>
            <span className="map__root-label">FDE</span>
          </div>
          <Connector variant="stem" />

          <ul className="map__graph">
            {node(byId("problem"))}
          </ul>
          <Connector variant="fan" />

          <ul className="map__pair">
            {node(byId("software"))}
            {node(byId("ai-systems"))}
          </ul>
          <Connector variant="converge" />

          <ul className="map__graph">
            {node(byId("data"))}
          </ul>
          <Connector variant="fan" />

          <ul className="map__pair">
            {node(byId("integration"))}
            {node(byId("infra"))}
          </ul>
          <Connector variant="converge" />

          <ul className="map__graph">
            {node(byId("evaluation"))}
          </ul>

          {/* One reserved console band. Every capability node is the same
              height because the related-project links live here rather than
              inside the active node — so hovering or activating a branch
              changes this panel's contents and never reflows the graph. */}
          <div className="map__console">
            <p className="map__readout" aria-live="polite">
              <span className="map__readout-key">
                {focusTech ? focusTech.tech : activeLayer.label}
              </span>
              <span className="map__readout-val">
                {focusTech
                  ? projectsForTech.length > 0
                    ? `used in ${projectsForTech.map((p) => p.name).join(" · ")}`
                    : "no project record references it yet"
                  : activeLayer.note}
              </span>
            </p>

            <div className="map__projects" id="map-projects">
              <span className="map__projects-label" aria-hidden="true">
                {activeLayer.label} →
              </span>
              {activeProjects.length > 0 ? (
                <ul className="map__rel-list">
                  {activeProjects.map((project) => (
                    <li key={project.slug}>
                      <Link className="map__rel-link" href={`/work/${project.slug}`}>
                        <ProjectMark slug={project.slug} title={project.name} size={18} />
                        <span className="map__rel-num" aria-hidden="true">
                          {project.number}
                        </span>
                        {project.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="map__rel-empty">No project record claims this yet.</p>
              )}
            </div>
          </div>
        </div>
      </m.div>
    </div>
  );
}