import type { Project } from "../../content/projects";

type DiagramProps = {
  project: Project;
  /** Compact mode is used inside archive rows. */
  compact?: boolean;
};

/**
 * Renders the verified architecture steps of a project as an SVG signal path.
 * Three layouts keep three featured projects from looking identical.
 */
export function ProjectDiagram({ project, compact = false }: DiagramProps) {
  const steps = project.architecture;
  const label = steps.map((step) => step.title).join(" → ");

  if (project.diagram === "horizontal") {
    return <HorizontalDiagram project={project} compact={compact} label={label} />;
  }
  if (project.diagram === "merge") {
    return <MergeDiagram project={project} compact={compact} label={label} />;
  }
  return <VerticalDiagram project={project} compact={compact} label={label} />;
}

type BaseProps = DiagramProps & { label: string };

function VerticalDiagram({ project, compact, label }: BaseProps) {
  const steps = project.architecture;
  const height = 46 + steps.length * 58;
  return (
    <svg
      className="diagram"
      viewBox={`0 0 300 ${height}`}
      role="img"
      aria-label={`${project.title} architecture: ${label}`}
      data-compact={compact || undefined}
    >
      {steps.map((step, index) => {
        const y = 28 + index * 58;
        return (
          <g key={step.number} className="diagram__node">
            {index > 0 && <line className="diagram__wire" x1="150" y1={y - 34} x2="150" y2={y - 14} />}
            <rect className="diagram__plate" x={54} y={y - 14} width={192} height={28} rx={9} />
            <text className="diagram__num" x={68} y={y + 4}>
              {step.number}
            </text>
            <text className="diagram__label" x={150} y={y + 4} textAnchor="middle">
              {step.title}
            </text>
            {index < steps.length - 1 && (
              <circle className="diagram__packet" r={2.6} cx={150} cy={y - 24}>
                <animate attributeName="cy" values={`${y - 12};${y - 34}`} dur="2.2s" begin={`${index * 0.28}s`} repeatCount="indefinite" />
              </circle>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function HorizontalDiagram({ project, compact, label }: BaseProps) {
  const steps = project.architecture;
  const gap = 96;
  const width = 40 + steps.length * gap;
  return (
    <svg
      className="diagram"
      viewBox={`0 0 ${width} 176`}
      role="img"
      aria-label={`${project.title} architecture: ${label}`}
      data-compact={compact || undefined}
    >
      <line className="diagram__wire" x1={40} y1={58} x2={width - 40} y2={58} />
      {steps.map((step, index) => {
        const x = 44 + index * gap;
        return (
          <g key={step.number} className="diagram__node">
            <circle className="diagram__dot" cx={x} cy={58} r={17} />
            <text className="diagram__num" x={x} y={62} textAnchor="middle">
              {step.number}
            </text>
            <text className="diagram__label" x={x} y={104} textAnchor="middle">
              {step.title}
            </text>
            <text className="diagram__caption" x={x} y={122} textAnchor="middle">
              {step.description.split(" ").slice(0, 4).join(" ")}
            </text>
            <circle className="diagram__packet" r={2.8} cx={x} cy={58}>
              <animateTransform
                attributeName="transform"
                type="translate"
                values="0 0; 96 0"
                dur="2.6s"
                begin={`${index * 0.42}s`}
                repeatCount="indefinite"
              />
            </circle>
          </g>
        );
      })}
    </svg>
  );
}

function MergeDiagram({ project, compact, label }: BaseProps) {
  const steps = project.architecture;
  const [inputs, ...rest] = steps;
  const railY = 132;
  return (
    <svg
      className="diagram"
      viewBox="0 0 320 190"
      role="img"
      aria-label={`${project.title} architecture: ${label}`}
      data-compact={compact || undefined}
    >
      {/* three sensor inputs converging into the edge stage */}
      {[64, 160, 256].map((x, index) => (
        <g key={x} className="diagram__node">
          <rect className="diagram__plate" x={x - 34} y={18} width={68} height={26} rx={8} />
          <text className="diagram__label diagram__label--tight" x={x} y={35} textAnchor="middle">
            {["CAM", "GPS / IMU", "CAN"][index]}
          </text>
          <path
            className="diagram__wire diagram__wire--curve"
            d={`M ${x} 46 C ${x} 96, 160 84, 160 ${railY - 14}`}
          />
          <circle className="diagram__packet" r={2.6} cx={x} cy={62}>
            <animate
              attributeName="cy"
              values="52;112"
              dur="2s"
              begin={`${index * 0.4}s`}
              repeatCount="indefinite"
            />
          </circle>
        </g>
      ))}

      <line className="diagram__wire" x1={160} y1={railY - 14} x2={160} y2={railY - 40} />

      {rest.map((step, index) => {
        const x = 30 + index * 88;
        return (
          <g key={step.number} className="diagram__node">
            <rect className="diagram__plate diagram__plate--solid" x={x} y={railY} width={80} height={30} rx={9} />
            <text className="diagram__label diagram__label--on" x={x + 40} y={railY + 19} textAnchor="middle">
              {step.title}
            </text>
            {index < rest.length - 1 && (
              <>
                <line className="diagram__wire" x1={x + 80} y1={railY + 15} x2={x + 88} y2={railY + 15} />
                <circle className="diagram__packet" r={2.4} cx={x + 82} cy={railY + 15}>
                  <animateTransform
                    attributeName="transform"
                    type="translate"
                    values="0 0; 6 0"
                    dur="1.2s"
                    begin={`${index * 0.5}s`}
                    repeatCount="indefinite"
                  />
                </circle>
              </>
            )}
          </g>
        );
      })}

      <text className="diagram__caption diagram__caption--left" x={30} y={railY + 56}>
        {inputs?.description}
      </text>
    </svg>
  );
}