// Arguments extraits des fiches techniques réelles — aucune stat inventée

const arguments_ = [
  {
    num: '01',
    title: 'Moteur 100% Cuivre',
    body: 'Bobinage cuivre pur sur tous nos modèles — longévité supérieure, chaleur réduite, consommation optimisée.',
  },
  {
    num: '02',
    title: 'Garantie 2 Ans',
    body: 'Chaque produit Continental® est couvert 2 ans pièces et main-d\'œuvre. Qualité vérifiable, service réel.',
  },
  {
    num: '03',
    title: 'Fonctionnement Silencieux',
    body: 'Technologie anti-vibration. Conçu pour les chambres, bureaux et espaces de travail exigeants.',
  },
  {
    num: '04',
    title: 'Livraison à Dakar',
    body: 'Plateau, Médina, Guédiawaye, Pikine, Rufisque — livraison rapide partout dans la région dakaroise.',
  },
]

export default function ArgumentsSection() {
  return (
    <section className="bg-bg-dark py-20 md:py-28">
      <div className="container-site">

        {/* Header */}
        <div className="mb-16">
          <p className="product-ref text-text-light/30 tracking-[0.25em] mb-3">POURQUOI CONTINENTAL</p>
          <h2 className="font-heading font-bold text-text-light text-4xl md:text-5xl max-w-xl">
            Ce qui fait la différence.
          </h2>
        </div>

        {/* 4 arguments — numéros grands, pas d'icônes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 border-l border-border-dark">
          {arguments_.map((arg) => (
            <div
              key={arg.num}
              className="border-r border-b border-border-dark px-6 md:px-8 py-8 flex flex-col gap-4"
            >
              {/* Numéro */}
              <span
                className="font-heading font-black leading-none select-none"
                style={{
                  fontSize: 'clamp(3rem, 5vw, 5rem)',
                  color: 'rgba(255,255,255,0.07)',
                }}
                aria-hidden="true"
              >
                {arg.num}
              </span>

              {/* Titre */}
              <h3 className="font-heading font-bold text-text-light text-xl md:text-2xl -mt-2">
                {arg.title}
              </h3>

              {/* Corps */}
              <p className="text-text-light/50 text-sm leading-relaxed">
                {arg.body}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
