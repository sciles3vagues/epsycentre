export interface FaqLink {
  text: string;
  href: string;
}

export type FaqParagraph = string | (string | FaqLink)[];

export interface FaqEntry {
  question: string;
  answer: FaqParagraph[];
}

export const paragraphText = (paragraph: FaqParagraph): string =>
  typeof paragraph === 'string'
    ? paragraph
    : paragraph.map(part => (typeof part === 'string' ? part : part.text)).join('');

export const FAQ: FaqEntry[] = [
  {
    question: 'Comment savoir si j’ai vraiment besoin de consulter ?',
    answer: [
      'Si une difficulté vous limite au quotidien, dure dans le temps, il peut être utile d’en parler à un professionnel. Le premier rendez-vous permet justement de faire le point.',
      'Il n’y a pas de seuil à atteindre pour consulter. Toute demande est légitime.',
    ],
  },
  {
    question: 'Est-ce que je dois demander une ordonnance ou l’avis de mon médecin avant de venir ?',
    answer: [
      'Il n’est pas obligatoire d’avoir une ordonnance pour prendre rendez-vous, mais il peut être intéressant d’obtenir un courrier si le médecin traitant souhaite partager des informations dans le cadre de votre suivi.',
    ],
  },
  {
    question: 'Quelles différences entre un psychologue, un(e) infirmier(ère) thérapeute et un psychiatre ?',
    answer: [
      'Psychologue : formé à la faculté de psychologie, il accompagne les difficultés psychologiques par l’écoute, l’évaluation et la psychothérapie.',
      'Infirmier(ère) thérapeute : infirmier diplômé d’État et formé en thérapie cognitivo-comportementale.',
      'Médecin psychiatre : médecin spécialisé, formé à la faculté de médecine et spécialisé en santé mentale, il diagnostique, soigne par la psychothérapie et peut prescrire des médicaments.',
    ],
  },
  {
    question: 'Comment fonctionnent les groupes ?',
    answer: [
      'Les groupes réunissent plusieurs participants autour d’une thématique commune. Animés par un ou plusieurs thérapeutes, ils se déroulent sur plusieurs séances et associent apports théoriques, exercices pratiques et échanges. Ils peuvent compléter un suivi individuel ou être suivis seuls. Chaque groupe a ses propres durées et modalités.',
    ],
  },
  {
    question: 'Est-ce que je serai forcément orienté vers un psychiatre ?',
    answer: [
      'L’orientation vers un psychiatre peut se faire à tout moment du suivi, en fonction des besoins. Elle n’est jamais systématique et se discute toujours avec vous.',
    ],
  },
  {
    question: 'Est-ce que je serai obligé de prendre des médicaments ?',
    answer: [
      'Non, vous n’êtes jamais obligé de prendre un médicament, car le consentement libre et éclairé est un droit fondamental pour tout usager. En tant qu’usager, vous restez libre d’accepter ou de refuser un traitement. Le médecin doit vous informer clairement des avantages et des risques.',
    ],
  },
  {
    question: 'Est-ce que les consultations sont remboursées ?',
    answer: [
      'Les consultations de psychologue et des thérapeutes ne sont pas remboursées par l’Assurance Maladie. De nombreuses mutuelles prennent en charge une partie des séances : renseignez-vous auprès de la vôtre.',
      'Les consultations de psychiatre sont, elles, remboursées par l’Assurance Maladie selon les conditions habituelles.',
    ],
  },
  {
    question: 'En cas d’urgence',
    answer: [
      'Le cabinet n’est pas un service d’urgence et ne peut pas assurer de permanence en dehors des rendez-vous. Si vous traversez une situation de crise, n’attendez pas votre prochaine séance.',
      [
        'Pour toute urgence, contactez le ',
        { text: '15 (SAMU)', href: 'tel:15' },
        ' ou rendez-vous aux urgences les plus proches.',
      ],
      [
        'En cas d’idées suicidaires, vous pouvez appeler le ',
        { text: '3114', href: 'tel:3114' },
        ', numéro national de prévention du suicide, gratuit et accessible 24h/24 et 7j/7.',
      ],
    ],
  },
];
