/**
 * Een link naar een andere website opent in een nieuw tabblad. Zo blijft de uitkomst staan: Leidenwerkt en Leidengeldwijzer
 * bewaren niets. Een klein pijltje laat dat zien. Een schermlezer leest "opent in een nieuw tabblad" (WCAG-techniek G201).
 */
export function NieuwTabblad() {
  return (
    <>
      <span className="nieuw-tabblad" aria-hidden="true">
        ↗
      </span>
      <span className="visueel-verborgen"> (opent in een nieuw tabblad)</span>
    </>
  );
}

/** De naam van de website, zonder www. Bijvoorbeeld gemeente.leiden.nl. */
export function websiteVan(url: string): string | undefined {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return undefined;
  }
}
