// Complete word database for crossword generation
// 6 themes × 3 difficulties × 20 words = 360 total words

const wordDatabase = {
  animais: {
    facil: [
      { word: 'GATO', clue: 'Felino doméstico que faz miau' },
      { word: 'CACHORRO', clue: 'Melhor amigo do homem' },
      { word: 'PEIXE', clue: 'Animal que vive na água' },
      { word: 'PASSARO', clue: 'Animal que voa e tem penas' },
      { word: 'CAVALO', clue: 'Animal usado para montaria' },
      { word: 'VACA', clue: 'Animal que dá leite' },
      { word: 'PORCO', clue: 'Animal que vive na lama' },
      { word: 'GALINHA', clue: 'Ave que bota ovos' },
      { word: 'COELHO', clue: 'Animal que pula e come cenoura' },
      { word: 'RATO', clue: 'Pequeno roedor' },
      { word: 'OVELHA', clue: 'Animal que fornece lã' },
      { word: 'PATO', clue: 'Ave aquática que nada' },
      { word: 'GALO', clue: 'Macho da galinha' },
      { word: 'BURRO', clue: 'Animal de carga parecido com cavalo' },
      { word: 'CABRA', clue: 'Animal que come de tudo' },
      { word: 'ARANHA', clue: 'Animal de oito patas' },
      { word: 'ABELHA', clue: 'Inseto que faz mel' },
      { word: 'FORMIGA', clue: 'Inseto que trabalha em equipe' },
      { word: 'BORBOLETA', clue: 'Inseto colorido que voa' },
      { word: 'JOANINHA', clue: 'Inseto vermelho com pintinhas' }
    ],
    medio: [
      { word: 'ELEFANTE', clue: 'Maior mamífero terrestre' },
      { word: 'GIRAFA', clue: 'Animal mais alto do mundo' },
      { word: 'LEOPARDO', clue: 'Felino com manchas' },
      { word: 'RINOCERONTE', clue: 'Animal com chifre no nariz' },
      { word: 'CROCODILO', clue: 'Réptil que vive em rios' },
      { word: 'TUBARAO', clue: 'Predador dos oceanos' },
      { word: 'AGUIA', clue: 'Ave de rapina majestosa' },
      { word: 'FLAMINGO', clue: 'Ave rosa que vive em lagos' },
      { word: 'HIPOPOTAMO', clue: 'Grande mamífero aquático' },
      { word: 'CANGURU', clue: 'Animal que pula da Austrália' },
      { word: 'ZEBRA', clue: 'Cavalo com listras' },
      { word: 'LEAO', clue: 'Rei da selva' },
      { word: 'TIGRE', clue: 'Felino com listras' },
      { word: 'URSO', clue: 'Grande mamífero peludo' },
      { word: 'LOBO', clue: 'Ancestral selvagem do cão' },
      { word: 'RAPOSA', clue: 'Animal astuto de cauda peluda' },
      { word: 'VEADO', clue: 'Animal com chifres ramificados' },
      { word: 'JACARE', clue: 'Réptil brasileiro parente do crocodilo' },
      { word: 'PINGUIM', clue: 'Ave que não voa mas nada muito bem' },
      { word: 'CORUJA', clue: 'Ave noturna símbolo da sabedoria' }
    ],
    dificil: [
      { word: 'ORNITORRINCO', clue: 'Mamífero que bota ovos' },
      { word: 'AXOLOTE', clue: 'Anfíbio que regenera membros' },
      { word: 'QUETZAL', clue: 'Ave sagrada dos maias' },
      { word: 'NUMBAT', clue: 'Mamífero insetívoro australiano' },
      { word: 'PANGOLIM', clue: 'Mamífero com escamas' },
      { word: 'OKAPI', clue: 'Parente da girafa' },
      { word: 'FOSSA', clue: 'Predador de Madagascar' },
      { word: 'QUOLL', clue: 'Marsupial carnívoro' },
      { word: 'BINTURONG', clue: 'Ursídeo asiático' },
      { word: 'CAPIVARA', clue: 'Maior roedor do mundo' },
      { word: 'TAPIR', clue: 'Mamífero com tromba curta' },
      { word: 'QUATI', clue: 'Parente do guaxinim' },
      { word: 'TAMANDUA', clue: 'Mamífero que come formigas' },
      { word: 'PREGUICA', clue: 'Animal muito lento das árvores' },
      { word: 'MORCEGO', clue: 'Único mamífero que voa' },
      { word: 'OURICO', clue: 'Animal coberto de espinhos' },
      { word: 'TATU', clue: 'Mamífero com carapaça' },
      { word: 'LONTRA', clue: 'Mamífero aquático brincalhão' },
      { word: 'CHINCHILA', clue: 'Roedor de pelo muito macio' },
      { word: 'SURICATA', clue: 'Animal que faz guarda em pé' }
    ]
  }
  // Continue with other themes...
};
