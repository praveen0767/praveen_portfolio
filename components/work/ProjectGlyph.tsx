import type { Project } from "../../content/projects";

type GlyphProps = {
  project: Project;
  className?: string;
};

/**
 * Abstract technical graphics for the companion projects.
 *
 * Each glyph is drawn from the project's own verified architecture steps, so the
 * picture cannot claim a capability the project does not have. They are abstract
 * on purpose: no evidence graph with invented scores, no accuracy number, no
 * detection rate — just the shape of the pipeline that actually exists.
 *
 * ARIV does not appear here. It gets the full control-plane visual instead.
 */
export function ProjectGlyph({ project, className = "" }: GlyphProps) {
  const label = project.architecture.map((step) => step.title).join(" → ");

  if (project.diagram === "horizontal") {
    return (
      <svg
        className={`glyph ${className}`.trim()}
        viewBox="0 0 420 250"
        role="img"
        aria-label={`${project.title}: ${label}`}
        data-glyph="graph"
      >
        {/* structured ingestion — record rows, no fabricated values */}
        <g className="glyph__rows">
          {[0, 1, 2, 3].map((row) => (
            <rect key={row} className="glyph__row" x={16} y={44 + row * 26} width={72} height={16} rx={5} />
          ))}
          <rect className="glyph__row glyph__row--accent" x={16} y={148} width={72} height={16} rx={5} />
        </g>
        <text className="glyph__caption" x={16} y={28}>
          Records
        </text>

        {/* geospatial field */}
        <g className="glyph__geo">
          {[0, 1, 2, 3].map((row) =>
            [0, 1, 2, 3, 4].map((column) => (
              <circle
                key={`${row}-${column}`}
                className="glyph__geo-dot"
                cx={126 + column * 21 + (row % 2 ? 10 : 0)}
                cy={38 + row * 22}
                r={2.4}
              />
            )),
          )}
        </g>
        <text className="glyph__caption" x={126} y={28}>
          Geospatial
        </text>

        {/* entity graph */}
        <g className="glyph__graph">
          <path className="glyph__graph-wire" d="M 246 54 L 292 82 L 246 110 L 300 138 L 258 158" />
          <path className="glyph__graph-wire" d="M 292 82 L 338 62" />
          <path className="glyph__graph-wire" d="M 300 138 L 344 168" />
          {[
            [246, 54],
            [292, 82],
            [246, 110],
            [300, 138],
            [258, 158],
            [338, 62],
            [344, 168],
          ].map(([cx, cy]) => (
            <circle key={`${cx}-${cy}`} className="glyph__graph-dot" cx={cx} cy={cy} r={5} />
          ))}
        </g>
        <text className="glyph__caption" x={246} y={28}>
          Entity graph
        </text>

        {/* serving channels — magnitude without a number */}
        <g className="glyph__serving">
          {[0, 1, 2, 3].map((index) => (
            <rect
              key={index}
              className="glyph__bar"
              x={368}
              y={44 + index * 26}
              width={[66, 40, 78, 48][index]}
              height={16}
              rx={5}
            />
          ))}
          <rect className="glyph__bar glyph__bar--accent" x={368} y={148} width={58} height={16} rx={5} />
        </g>
        <text className="glyph__caption" x={368} y={28}>
          Scoring
        </text>

        <text className="glyph__note" x={16} y={206}>
          Modular pipelines and schema validation feed feature engineering; graph-based entity analysis and
          geospatial context add system context before FastAPI model-serving APIs expose risk scoring with
          explanations.
        </text>
      </svg>
    );
  }

  if (project.diagram === "merge") {
    return (
      <svg
        className={`glyph ${className}`.trim()}
        viewBox="0 0 420 250"
        role="img"
        aria-label={`${project.title}: ${label}`}
        data-glyph="edge"
      >
        {/* camera frame abstraction with a detection plate and a motion trace */}
        <g className="glyph__frame">
          <rect className="glyph__frame-box" x={16} y={40} width={124} height={94} rx={8} />
          <rect className="glyph__frame-detect" x={54} y={68} width={54} height={40} rx={4} />
          <path className="glyph__trace" d="M 20 178 C 46 158, 58 196, 84 172 S 124 150, 136 164" />
          {[
            [16, 40],
            [140, 40],
            [16, 134],
            [140, 134],
          ].map(([x, y]) => (
            <path
              key={`${x}-${y}`}
              className="glyph__frame-corner"
              d={`M ${x} ${y + 12} L ${x} ${y} L ${x + 12} ${y}`}
            />
          ))}
        </g>
        <text className="glyph__caption" x={16} y={28}>
          Edge input
        </text>

        {/* sensor lanes */}
        <g className="glyph__sensors">
          <path className="glyph__wire" d="M 148 74 L 196 74" />
          <path className="glyph__wire" d="M 148 112 L 196 112" />
          <path className="glyph__wire" d="M 148 150 L 196 150" />
          {[
            ["INFER", 62],
            ["GPS / IMU", 100],
            ["CAN", 138],
          ].map(([name, y]) => (
            <g key={name}>
              <rect className="glyph__plate" x={200} y={(y as number) - 0} width={86} height={24} rx={7} />
              <text className="glyph__plate-text" x={243} y={(y as number) + 16} textAnchor="middle">
                {name}
              </text>
            </g>
          ))}
        </g>
        <text className="glyph__caption" x={200} y={40}>
          Inference + fusion
        </text>

        {/* transport queue */}
        <g className="glyph__queue">
          <path className="glyph__wire" d="M 292 100 L 330 100" />
          {[0, 1, 2, 3].map((index) => (
            <rect key={index} className="glyph__packet" x={334} y={64 + index * 20} width={68} height={13} rx={4} />
          ))}
        </g>
        <text className="glyph__caption" x={334} y={40}>
          Transport
        </text>

        <text className="glyph__note" x={16} y={214}>
          Raspberry Pi runs YOLOv8 and OpenCV on the road, fuses detections with GPS/IMU and CAN-bus telemetry, and
          ships structured hazard events asynchronously over RabbitMQ to real-time geospatial analytics.
        </text>
      </svg>
    );
  }

  return (
    <svg
      className={`glyph ${className}`.trim()}
      viewBox="0 0 420 250"
      role="img"
      aria-label={`${project.title}: ${label}`}
      data-glyph="verify"
    >
      {/* three input modalities */}
      <g className="glyph__lanes">
        {[
          ["TEXT", 44],
          ["IMAGE", 82],
          ["AUDIO", 120],
        ].map(([name, y]) => (
          <g key={name}>
            <rect className="glyph__plate" x={16} y={(y as number) - 14} width={82} height={24} rx={7} />
            <text className="glyph__plate-text" x={57} y={(y as number) + 2} textAnchor="middle">
              {name}
            </text>
            <path className="glyph__wire" d={`M 100 ${y} L 138 ${y}`} />
          </g>
        ))}
      </g>
      <text className="glyph__caption" x={16} y={20}>
        Multimodal input
      </text>

      {/* embedding lattice */}
      <g className="glyph__lattice">
        {Array.from({ length: 36 }, (_, index) => (
          <rect
            key={index}
            className="glyph__cell"
            x={142 + (index % 6) * 11}
            y={36 + Math.floor(index / 6) * 11}
            width={7}
            height={7}
            rx={2}
            style={{ animationDelay: `${(index % 9) * 0.14}s` }}
          />
        ))}
      </g>
      <text className="glyph__caption" x={142} y={20}>
        Embeddings
      </text>

      {/* retrieval clusters */}
      <g className="glyph__clusters">
        <path className="glyph__wire" d="M 212 82 L 244 82" />
        {[0, 1, 2].map((cluster) => (
          <g key={cluster}>
            <circle
              className="glyph__cluster-halo"
              cx={276 + (cluster % 2) * 56}
              cy={56 + Math.floor(cluster / 2) * 52}
              r={20}
            />
            {[0, 1, 2, 3].map((dot) => (
              <circle
                key={dot}
                className="glyph__cluster-dot"
                cx={276 + (cluster % 2) * 56 + (dot % 2 ? 7 : -6)}
                cy={56 + Math.floor(cluster / 2) * 52 + (dot < 2 ? -6 : 7)}
                r={2.6}
              />
            ))}
          </g>
        ))}
      </g>
      <text className="glyph__caption" x={258} y={20}>
        Retrieval
      </text>

      {/* agent + review gate */}
      <g className="glyph__gate">
        <rect className="glyph__plate glyph__plate--accent" x={336} y={54} width={68} height={26} rx={8} />
        <text className="glyph__plate-text glyph__plate-text--on" x={370} y={71} textAnchor="middle">
          AGENT
        </text>
        <rect className="glyph__plate" x={336} y={92} width={68} height={26} rx={8} />
        <text className="glyph__plate-text" x={370} y={109} textAnchor="middle">
          REVIEW
        </text>
        <path className="glyph__wire" d="M 370 80 L 370 92" />
      </g>

      <text className="glyph__note" x={16} y={186}>
        OCR and ASR extract usable content, Qdrant-backed hybrid retrieval returns evidence with metadata
        filtering, LangGraph orchestrates the verification steps and maintains claim memory, and uncertain
        results reach a confidence-based human review path instead of being asserted.
      </text>
    </svg>
  );
}
