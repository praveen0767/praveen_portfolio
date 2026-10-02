import { capabilities } from "../../content/home";
import { Reveal } from "../ui/Reveal";

export function Capabilities() {
  return (
    <div className="caps">
      {capabilities.map((capability, index) => (
        <Reveal key={capability.id} delay={index * 80}>
          <article className="caps__module" data-accent={capability.accent}>
            <header className="caps__head">
              <span className="caps__index">0{index + 1}</span>
              <h3 className="caps__label">{capability.label}</h3>
            </header>
            <p className="caps__summary">{capability.summary}</p>
            <ul className="caps__items">
              {capability.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </Reveal>
      ))}
    </div>
  );
}