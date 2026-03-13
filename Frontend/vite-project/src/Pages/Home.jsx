import HomePageContent from "./HomePageContent";
import AboutPage from "./AboutProjectPage";
import ScrollReveal from "../Components/ScrollReveal";

const Home = () => {
  const basicTerms = [
    {
      term: "Land Area",
      unit: "Acre",
      detail: "1 acre = 43,560 sq ft = 0.4047 hectare",
    },
    {
      term: "Land Area",
      unit: "Hectare",
      detail: "1 hectare = 2.471 acres = 10,000 sq m",
    },
    {
      term: "Weight",
      unit: "Kilogram (kg)",
      detail: "Basic unit used for crop quantity and pricing",
    },
    {
      term: "Weight",
      unit: "Quintal",
      detail: "1 quintal = 100 kg",
    },
    {
      term: "Weight",
      unit: "Ton (Metric Tonne)",
      detail: "1 ton = 1,000 kg = 10 quintals",
    },
    {
      term: "Price Unit",
      unit: "per kg",
      detail: "Used in local or retail crop price comparison",
    },
    {
      term: "Price Unit",
      unit: "per quintal",
      detail: "Common in mandi/MSP and wholesale trading",
    },
    {
      term: "Yield",
      unit: "kg per acre",
      detail: "Production estimate from one acre of land",
    },
    {
      term: "Yield",
      unit: "quintal per acre",
      detail: "Large-scale yield planning and reporting unit",
    },
  ];

  return (
    <div className="w-full flex flex-col">
      <HomePageContent />
      
      {/* Quote Section with ScrollReveal */}
      <section className="py-0 px-6 text-center bg-white/30 backdrop-blur-sm overflow-hidden">
        <div className="max-w-3xl mx-auto">
          <ScrollReveal
            baseOpacity={0.1}
            enableBlur
            baseRotation={3}
            blurStrength={4}
          >
            {/* <blockquote className="text-2xl sm:text-3xl font-medium ios-title italic leading-relaxed">
              "When does a man die? When he is hit by a bullet? No! When he suffers a disease? 
              No! When he ate a soup made out of a poisonous mushroom? 
              No! A man dies when he is forgotten!"
            </blockquote> */}
            {/* <p className="mt-4 text-emerald-600 font-semibold">— Dr. Hiriluk</p> */}
          </ScrollReveal>
        </div>
      </section>

      <div className="md:contents block md:opacity-100 opacity-90 transition-opacity duration-700">
        <ScrollReveal duration={1.5} yOffset={30}>
          <AboutPage />
        </ScrollReveal>
      </div>

      <ScrollReveal threshold={0.05} yOffset={40}>
        <section className="w-full py-14 px-4 sm:px-6 md:px-8 bg-gradient-to-br from-emerald-50/70 via-white to-lime-50/60">
          <div className="max-w-6xl mx-auto">
            <div className="glass-card rounded-3xl p-6 sm:p-8 md:p-10">
              <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold ios-title">
                    Basic Agricultural Terms & Units
                  </h2>
                  <p className="ios-body mt-2 text-sm sm:text-base">
                    Quick reference for land area, weight, and pricing units used
                    throughout the platform.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
                  Field-ready reference
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {basicTerms.map((item) => (
                  <article
                    key={`${item.term}-${item.unit}`}
                    className="rounded-2xl border border-emerald-100 bg-white/90 p-4 shadow-sm"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 mb-1">
                      {item.term}
                    </p>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">
                      {item.unit}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {item.detail}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>
    </div>
  );
};

export default Home;
