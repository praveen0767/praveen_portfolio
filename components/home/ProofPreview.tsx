import Link from "next/link";
import { achievements } from "../../content/proof/achievements";

/** Homepage shows only the strongest verified results. */
const selected = [...achievements]
  .filter((achievement) => achievement.featured)
  .sort((a, b) => a.tier - b.tier)
  .slice(0, 3);

export function ProofPreview() {
  const champions = achievements.filter((achievement) => achievement.tier === 1).length;
  const finalists = achievements.filter((achievement) => achievement.tier === 2).length;

  return (
    <div className="proof-preview">
      <ul className="proof-preview__list">
        {selected.map((achievement) => (
          <li key={achievement.id} className="proof-row" data-tier={achievement.tier}>
            <div className="proof-row__result">
              <span className="proof-row__result-text">{achievement.result}</span>
              <span className="proof-row__org">{achievement.organization}</span>
            </div>
            <div className="proof-row__body">
              <h3 className="proof-row__title">{achievement.event}</h3>
              <p className="proof-row__contribution">{achievement.contribution}</p>
            </div>
          </li>
        ))}
      </ul>

      <div className="proof-preview__footer">
        <p className="proof-preview__tally">
          <span>
            <strong>{champions}</strong> championships
          </span>
          <span>
            <strong>{finalists}</strong> national top-10 results
          </span>
          <span>
            <strong>{achievements.length}</strong> records on file
          </span>
        </p>
        <Link className="proof-preview__cta" href="/proof">
          Explore all proof
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </div>
  );
}