"use client";

import { useId, useState } from "react";
import { AnimatePresence, m } from "motion/react";

type PreviewStep = {
  number: string;
  title: string;
  description: string;
};

type ProjectPreviewProps = {
  steps: PreviewStep[];
  accent: string;
  /** Accessible name for the disclosure control. */
  label: string;
};

/**
 * Hover and focus preview of a project's architecture.
 *
 * The panel is only a re-presentation of `project.architecture`, which is the same
 * verified data the SVG diagram and the case study render — nothing here is
 * written for effect. It is a button rather than a hover-only div so the preview
 * is reachable by keyboard and touch, where there is no pointer to hover with.
 */
export function ProjectPreview({ steps, accent, label }: ProjectPreviewProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <div
      className="project-preview"
      data-open={open ? "true" : undefined}
      onPointerEnter={() => setOpen(true)}
      onPointerLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={(event) => {
        // Only collapse when focus actually leaves the group, so tabbing between
        // the toggle and the panel does not flicker it shut.
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <button
        type="button"
        className="project-preview__toggle"
        aria-expanded={open}
        /* The panel unmounts when collapsed, so the reference is only emitted
           while its target exists — a static aria-controls would dangle and
           fail aria-valid-attr-value on the work archive. */
        aria-controls={open ? panelId : undefined}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="project-preview__toggle-label">{label}</span>
        <span className="project-preview__toggle-icon" aria-hidden="true">
          {open ? "−" : "+"}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <m.div
            id={panelId}
            className="project-preview__panel"
            data-accent={accent}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <ol className="project-preview__list">
              {steps.map((step) => (
                <li key={step.number} className="project-preview__step">
                  <span className="project-preview__num">{step.number}</span>
                  <span className="project-preview__text">
                    <span className="project-preview__title">{step.title}</span>
                    <span className="project-preview__desc">{step.description}</span>
                  </span>
                </li>
              ))}
            </ol>
          </m.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}