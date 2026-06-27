export const characters = [
  {
    slug: "yuji",
    name: "Yuji Itadori",
    handle: "@receptaculo-de-sukuna",
    avatar: "/images/Itadori1.jpg",
    cover: "/images/itadori4.jpg",
    summary: "Coragem, empatia e força",
    tags: ["Protagonista", "Primeiro ano", "Força física"],
    bio: "Quero ajudar as pessoas e garantir que tenham uma morte digna.",
    stats: ["15.8K", "4.2K", "8.7K"],
    story: "Yuji é um estudante que entra no mundo do jujutsu após se tornar o receptáculo de Sukuna. Sua força excepcional é acompanhada por um profundo senso de justiça e compaixão."
  },
  {
    slug: "megumi",
    name: "Megumi Fushiguro",
    handle: "@dez-sombras",
    avatar: "/images/megumi.jpg",
    cover: "/images/megumi3.jpg",
    summary: "A Técnica das Dez Sombras",
    tags: ["Feiticeiro grau 2", "Dez Sombras", "Clã Zenin"],
    bio: "Eu salvo pessoas de forma desigual — seguindo a minha própria consciência.",
    stats: ["13.4K", "3.9K", "7.2K"],
    story: "Reservado e estratégico, Megumi luta com os shikigamis da Técnica das Dez Sombras. Por trás da postura séria existe alguém profundamente leal aos amigos."
  },
  {
    slug: "nobara",
    name: "Nobara Kugisaki",
    handle: "@ressonancia",
    avatar: "/images/nobara.jpg",
    cover: "/images/nobara3.jpg",
    summary: "Autenticidade e determinação",
    tags: ["Primeiro ano", "Ressonância", "Autêntica"],
    bio: "Eu amo a versão de mim que é forte e também a versão que gosta de se arrumar.",
    stats: ["12.9K", "4.1K", "7.8K"],
    story: "Nobara une confiança, humor e uma vontade feroz de viver segundo seus próprios valores. Sua técnica usa martelo, pregos e ressonância."
  },
  {
    slug: "gojo",
    name: "Satoru Gojo",
    handle: "@o-mais-forte",
    avatar: "/images/gojo.jpg",
    cover: "/images/gojo.jpg",
    summary: "O feiticeiro mais forte",
    tags: ["Classe especial", "Seis Olhos", "Ilimitado"],
    bio: "Vou criar uma nova geração capaz de transformar o mundo jujutsu.",
    stats: ["99.9K", "31K", "52K"],
    story: "Professor na Escola Jujutsu de Tóquio, Gojo combina poder extraordinário e uma personalidade descontraída. Seu objetivo é transformar o mundo por meio dos alunos."
  },
  {
    slug: "geto",
    name: "Suguru Geto",
    handle: "@manipulacao-de-maldicoes",
    avatar: null,
    cover: null,
    summary: "Convicções e caminhos opostos",
    tags: ["Classe especial", "Maldições", "Idealista"],
    bio: "Convicções profundas podem colocar grandes amigos em caminhos opostos.",
    stats: ["88.4K", "24K", "41K"],
    story: "Antigo colega de Satoru Gojo, Geto foi um dos feiticeiros mais talentosos de sua geração. Sua trajetória dá profundidade emocional aos conflitos do mundo jujutsu."
  }
];

export function getCharacter(slug) {
  return characters.find((character) => character.slug === slug);
}
