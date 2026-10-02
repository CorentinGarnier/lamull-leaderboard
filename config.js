// Tout ce qui est propre au streamer se règle ici.
export const config = {
  streamer: "LaMull",
  code: "LAMULL",                         // code promo à afficher
  signupUrl: "https://vegabet.promo/AlexandreMuller",          // lien d'inscription (remplace par ton lien affilié)
  prizePool: 5000,
  currency: "EUR",                        // "EUR" ou "USD"
  // Lots par rang (le rang 1 est le premier). Au-delà de la liste : pas de lot.
  // Valeurs d'exemple reprises du site de référence : remplace-les par les vrais lots.
  prizes: [2000, 1000, 550, 400, 300, 200, 175, 150, 125, 100],
  // Date de fin de période (ISO). null = fin du mois en cours.
  endsAt: null,
  // Images (dans /public) : mets "/mascot.png" pour l'image du hero, et 3 images pour le podium.
  mascot: "",
  podiumImages: ["", "", ""],             // [1er, 2e, 3e]
  refreshLabel: "Mis à jour en direct",
};