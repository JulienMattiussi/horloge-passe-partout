import { useEffect, useRef } from "react";
import type {
  PassePartoutInstance,
  PassePartoutMountOptions,
} from "./passe-partout";
import "./App.css";

function Horloge(props: PassePartoutMountOptions) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const api = window.PassePartout;
    if (!api) return;
    const instance: PassePartoutInstance = api.mount(el, props);
    return () => instance.destroy();
  }, [props.format, props.time, props.imageBase]);

  return <div ref={ref} />;
}

const snippetExample = `<div data-passe-partout data-format="HH:MM"></div>
<script src="https://horloge-passe-partout.vercel.app/passe-partout.js"></script>`;

export function App() {
  return (
    <main className="demo">
      <header>
        <img className="logo" src="/favicon.svg" alt="" aria-hidden="true" />
        <h1>
          <span>Horloge</span>
          <span>Passe-Partout</span>
        </h1>
        <p>
          Un widget que vous pouvez déposer sur n&apos;importe quelle page web
          pour afficher l&apos;heure à l&apos;ancienne, avec les&nbsp;
          <em>passe-partout</em> qui miment les chiffres.
        </p>
        <p className="cta">
          Les clés pour l&apos;utiliser sont ici&nbsp;:{" "}
          <a href="#integration" className="cta-button">
            Comment l&apos;intégrer →
          </a>
        </p>
      </header>

      <section>
        <h2>Heure courante</h2>
        <Horloge format="HH:MM" />
      </section>

      <section>
        <h2>Avec les secondes</h2>
        <Horloge format="HH:MM:SS" />
      </section>

      <section>
        <h2>Heure figée</h2>
        <Horloge format="HH:MM" time="07:30" />
      </section>

      <section>
        <h2>Format personnalisé</h2>
        <Horloge format="HH-MM-SS" time="12:34:56" />
      </section>

      <section id="integration" className="howto">
        <h2>Comment l&apos;intégrer</h2>
        <p>
          Pour embarquer l&apos;horloge dans n&apos;importe quelle page web,
          collez ces deux lignes :
        </p>
        <pre>
          <code>{snippetExample}</code>
        </pre>
        <p>
          Attributs supportés sur le conteneur&nbsp;:
          <br />
          <code>data-format</code> — tokens <code>HH</code>, <code>MM</code>,{" "}
          <code>SS</code>; tout autre caractère est rendu tel quel. Défaut :{" "}
          <code>HH:MM</code>.
          <br />
          <code>data-time</code> — heure fixe au format <code>HH:MM</code> ou{" "}
          <code>HH:MM:SS</code>. Absent = heure courante qui défile.
        </p>
      </section>

      <footer className="footer">
        With <span aria-label="love">❤️</span> by{" "}
        <a
          href="https://github.com/JulienMattiussi/horloge-passe-partout"
          target="_blank"
          rel="noopener noreferrer"
        >
          YavaDeus
        </a>{" "}
        · © {new Date().getFullYear()}
      </footer>
    </main>
  );
}
