import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = {
  general: [
    {
      question: "Qu'est-ce que ReachDem ?",
      answer:
        "ReachDem est une plateforme de messagerie SMS professionnelle qui vous permet d'envoyer des campagnes SMS à grande échelle, de gérer vos contacts et de suivre vos performances en temps réel.",
    },
    {
      question: "Comment puis-je démarrer avec ReachDem ?",
      answer:
        "Pour commencer, créez simplement un compte sur notre plateforme. Une fois inscrit, vous pourrez créer votre premier projet, ajouter vos contacts et lancer votre première campagne SMS.",
    },
    {
      question: "Quels types de campagnes puis-je envoyer ?",
      answer:
        "Vous pouvez envoyer différents types de campagnes SMS : messages promotionnels, notifications, alertes, messages transactionnels, et plus encore. Notre plateforme prend en charge l'envoi de messages personnalisés à grande échelle.",
    },
    {
      question: "Comment puis-je importer mes contacts ?",
      answer:
        "Vous pouvez importer vos contacts facilement via notre outil d'importation CSV intelligent. Il vous suffit de télécharger votre fichier CSV contenant les numéros de téléphone et les informations de vos contacts.",
    },
    {
      question: "Est-ce que je peux suivre les performances de mes campagnes ?",
      answer:
        "Oui, notre plateforme offre des statistiques détaillées pour chaque campagne, incluant les taux de livraison, les taux d'ouverture, et d'autres métriques importantes pour optimiser vos performances.",
    },
  ],
  billing: [
    {
      question: "Comment fonctionne la facturation ?",
      answer:
        "Nous utilisons un système de crédits. Chaque SMS envoyé consomme un certain nombre de crédits selon la destination. Vous pouvez recharger vos crédits à tout moment via notre système de paiement sécurisé.",
    },
    {
      question: "Quels sont les moyens de paiement acceptés ?",
      answer:
        "Nous acceptons plusieurs moyens de paiement, notamment Mobile Money (MTN, Orange), et d'autres méthodes de paiement locales. Les paiements sont traités de manière sécurisée via notre plateforme.",
    },
    {
      question: "Comment puis-je vérifier mon solde de crédits ?",
      answer:
        "Votre solde de crédits est visible en permanence dans votre tableau de bord. Vous pouvez également consulter l'historique détaillé de vos consommations dans la section 'Gestion des crédits'.",
    },
    {
      question: "Existe-t-il des forfaits ou des réductions pour les grands volumes ?",
      answer:
        "Oui, nous proposons des tarifs dégressifs en fonction du volume de SMS envoyés. Contactez notre équipe commerciale pour obtenir une offre personnalisée adaptée à vos besoins.",
    },
  ],
};

const Faq8 = () => {
  return (
    <section className="py-32 px-4 lg:px-24">
        <div className="">
          <h2 className="mb-8 text-3xl font-semibold md:mb-11 md:text-5xl">
            Frequently asked questions.
          </h2>
          <div className="grid gap-4 border-t pt-4 md:grid-cols-3 md:gap-10">
            <h3 className="text-xl font-medium">General</h3>
            <Accordion type="multiple" className="md:col-span-2">
              {faqs.general.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
          <div className="mt-10 grid gap-4 border-t pt-4 md:grid-cols-3 md:gap-10">
            <h3 className="text-xl font-medium">Billing</h3>
            <Accordion type="multiple" className="md:col-span-2">
              {faqs.billing.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>        </div>
      </section>
  );
};

export default Faq8;
