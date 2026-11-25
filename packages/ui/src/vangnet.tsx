import { Component, type ReactNode } from "react";

/**
 * Vangnet: gaat er bij het rekenen iets mis, dan ziet de gebruiker een melding en geen witte pagina.
 * De fout staat in de console, zodat een ontwikkelaar hem kan vinden.
 */
export class Vangnet extends Component<{ children: ReactNode; naam: string }, { fout: boolean }> {
  state = { fout: false };
  static getDerivedStateFromError() {
    return { fout: true };
  }
  componentDidCatch(e: unknown) {
    console.error(e);
  }
  render() {
    if (!this.state.fout) return this.props.children;
    return (
      <div className="melding waarschuwing" role="alert">
        <p>
          <strong>{this.props.naam} kan dit nu niet uitrekenen.</strong>
        </p>
        <p>Dat ligt niet aan u. Probeer het later opnieuw. Heeft u nu een vraag? Bel de gemeente Leiden: 14 071.</p>
      </div>
    );
  }
}
