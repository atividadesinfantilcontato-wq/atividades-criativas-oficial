import { Product, Category, Review, SiteConfig } from './types';

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'coord-motora', name: 'Coordenação Motora', iconName: 'Activity', count: 32, color: 'bg-indigo-100 hover:bg-indigo-200 text-indigo-600', textColor: 'text-indigo-600' },
  { id: 'alfabetizacao', name: 'Alfabetização', iconName: 'BookOpen', count: 54, color: 'bg-emerald-100 hover:bg-emerald-200 text-emerald-600', textColor: 'text-emerald-600' },
  { id: 'matematica', name: 'Matemática', iconName: 'Binary', count: 38, color: 'bg-blue-100 hover:bg-blue-200 text-blue-600', textColor: 'text-blue-600' },
  { id: 'tampinhas', name: 'Atividades com Tampinhas', iconName: 'Disc', count: 28, color: 'bg-orange-100 hover:bg-orange-200 text-orange-600', textColor: 'text-orange-600' },
  { id: 'bonecos', name: 'Bonecos Articulados', iconName: 'Smile', count: 16, color: 'bg-pink-100 hover:bg-pink-200 text-pink-600', textColor: 'text-pink-600' },
  { id: 'sensoriais', name: 'Atividades Sensoriais', iconName: 'Palette', count: 22, color: 'bg-teal-100 hover:bg-teal-200 text-teal-600', textColor: 'text-teal-600' },
  { id: 'cores-formas', name: 'Cores e Formas', iconName: 'Compass', count: 18, color: 'bg-amber-100 hover:bg-amber-200 text-amber-600', textColor: 'text-amber-600' },
  { id: 'datas', name: 'Datas Comemorativas', iconName: 'CalendarRange', count: 45, color: 'bg-violet-100 hover:bg-violet-200 text-violet-600', textColor: 'text-violet-600' },
  { id: 'jogos', name: 'Jogos Pedagógicos', iconName: 'Gamepad2', count: 26, color: 'bg-green-100 hover:bg-green-200 text-green-600', textColor: 'text-green-600' },
  { id: 'kits', name: 'Kits Completos', iconName: 'Package', count: 12, color: 'bg-rose-100 hover:bg-rose-200 text-rose-600', textColor: 'text-rose-600' },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'boneco-articulado-menino',
    name: 'Boneco Articulado Menino para Imprimir',
    category: 'Bonecos Articulados',
    tag: 'MAIS VENDIDO',
    tagColor: 'red',
    ageRange: '3 a 6 anos',
    pages: 19,
    format: 'PDF pronto para imprimir',
    printSize: 'A4',
    price: 19.90,
    promoPrice: 14.90,
    imageUrl: 'boneco-menino',
    galleryUrls: ['boneco-menino', 'boneco-menino-g1', 'boneco-menino-g2'],
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Standard demo link
    hotmartUrl: 'https://pay.hotmart.com/E12345678X?checkoutMode=10',
    shortDescription: 'Um boneco menino super divertido para imprimir, colorir, recortar e montar, trabalhando a coordenação motora fina.',
    description: 'Estimule a criatividade e a coordenação motora fina das crianças com o nosso Boneco Articulado Menino. Este material foi desenhado com contornos nítidos e fáceis de cortar, perfeito para as pequenas mãos na fase da Educação Infantil. Além da montagem do boneco em si, o arquivo acompanha uma série de roupinhas e acessórios coloridos e em preto e branco para trocar, permitindo explorar as estações do ano, cores e vestuário.',
    whatYouWillReceive: [
      '1 Boneco menino em versão colorida pronto para montar',
      '1 Boneco menino em versão preto e branco para colorir e montar',
      '8 Opções de roupinhas coloridas (inverno, verão, esporte e escolar)',
      '8 Opções de roupinhas em preto e branco para colorir',
      'Manual passo a passo com fotos ilustrativas para montagem fácil'
    ],
    objectives: [
      'Desenvolver a coordenação motora fina por meio do recorte e colagem',
      'Estimular a percepção de esquema corporal e as partes do corpo humano',
      'Promover a criatividade na combinação de cores e vestimentas',
      'Trabalhar paciência e concentração na execução das etapas'
    ],
    howToUse: [
      'Imprima as páginas de sua escolha (coloridas ou P&B para pintar)',
      'Recomendamos imprimir em papel de maior gramatura (120g a 180g) para maior durabilidade',
      'Pinte o boneco e as roupinhas caso tenha optado pela versão preto e branco',
      'Recorte as peças cuidadosamente nas linhas indicadas',
      'Fure os pontos marcados nas articulações com a ponta de um lápis ou furador',
      'Utilize bailarinas de metal (colchetes de pressão) ou pequenos barbantes para articular os braços e pernas'
    ],
    materialsNeeded: [
      'Papel tamanho A4 (comum ou gramatura superior como 120g/180g)',
      'Tesoura escolar sem ponta',
      'Cola bastão ou líquida para os detalhes',
      'Lápis de cor, giz de cera ou canetinha',
      'Bailarinas de metal número 3 ou 4 (colchetes de latão)'
    ],
    howToPrint: 'Imprima em tamanho real (100% de escala) em folha sulfite comum ou papel do tipo Opalina / Couche fosco 150g para obter um resultado firme e premium.'
  },
  {
    id: 'boneca-articulada-menina',
    name: 'Boneca Articulada Menina para Imprimir',
    category: 'Bonecos Articulados',
    tag: 'MAIS VENDIDO',
    tagColor: 'red',
    ageRange: '3 a 6 anos',
    pages: 18,
    format: 'PDF pronto para imprimir',
    printSize: 'A4',
    price: 19.90,
    promoPrice: 14.90,
    imageUrl: 'boneca-menina',
    galleryUrls: ['boneca-menina', 'boneca-menina-g1', 'boneca-menina-g2'],
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    hotmartUrl: 'https://pay.hotmart.com/A87654321B?checkoutMode=10',
    shortDescription: 'Uma boneca menina articulada maravilhosa para colorir, recortar e montar, desenvolvendo coordenação e percepção corporal.',
    description: 'Divertida boneca articulada feminina projetada para auxiliar pais e educadores no desenvolvimento de habilidades cognitivas e psicomotoras. O material conta com diferentes estilos de cabelos, sapatos e vestidos variados. Perfeito para atividades interativas em sala de aula ou dinâmicas divertidas em família.',
    whatYouWillReceive: [
      '1 Boneca menina em versão colorida ultra nítida',
      '1 Boneca menina em versão preto e branco para pintura livre',
      '10 Conjuntos de vestidos e acessórios coloridos',
      '10 Conjuntos de vestidos em preto e branco para customização',
      'Guia rápido com orientações pedagógicas exclusivas'
    ],
    objectives: [
      'Fortalecer a musculatura das mãos e precisão no recorte',
      'Reconhecer diferentes peças de vestuário e autocuidado',
      'Trabalhar identidades, semelhanças e diferenças físicas',
      'Estimular o faz de conta e a contação de histórias'
    ],
    howToUse: [
      'Baixe o arquivo PDF e faça a impressão no papel de sua preferência',
      'Colorir bem forte as partes do corpo e roupas da boneca caso use P&B',
      'Fixar papel cartão ou papelão fino no verso se quiser que ela fique ainda mais rígida',
      'Recortar nas linhas demarcadas com tesoura escolar de boa qualidade',
      'Unir as articulações com colchetes nº 3 ou mini prendedores'
    ],
    materialsNeeded: [
      'Folhas A4 (sugerimos gramatura 180g)',
      'Tesoura sem ponta',
      'Lápis de cor ou giz',
      'Colchetes de latão (bailarinas de papel)'
    ],
    howToPrint: 'Para impressão doméstica, utilize a configuração de alta qualidade. Se preferir, leve em uma gráfica rápida e peça para imprimir em papel Couché 220g.'
  },
  {
    id: 'tampinhas-cores-formas',
    name: 'Atividades com Tampinhas: Cores e Formas',
    category: 'Atividades com Tampinhas',
    tag: 'NOVIDADE',
    tagColor: 'green',
    ageRange: '2 a 6 anos',
    pages: 22,
    format: 'PDF pronto para imprimir',
    printSize: 'A4',
    price: 24.90,
    promoPrice: 16.90,
    imageUrl: 'tampinhas-cores',
    galleryUrls: ['tampinhas-cores', 'tampinhas-cores-g1'],
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    hotmartUrl: 'https://pay.hotmart.com/C11223344D?checkoutMode=10',
    shortDescription: 'Cards didáticos para pareamento com tampinhas de garrafa pet de cores e formas variadas. Aprendizado prático e sensorial.',
    description: 'As atividades com tampinhas de garrafa são campeãs de engajamento na Educação Infantil! Este arquivo digital contém pranchas pedagógicas vibrantes onde as crianças devem associar tampinhas plásticas de acordo com as cores, padrões lógicos ou formas geométricas ilustradas. Uma forma barata, ecológica e altamente eficaz de desenvolver a atenção, discriminação visual e pinça fina.',
    whatYouWillReceive: [
      '12 Pranchas temáticas coloridas de pareamento (animais, balões, centopeias)',
      '6 Pranchas de sequenciamento lógico de cores',
      '4 Pranchas de formas geométricas elementares',
      'Guia com 5 sugestões extras de jogos utilizando o mesmo material'
    ],
    objectives: [
      'Estimular a coordenação de pinça fina (pegar e posicionar tampinhas)',
      'Reconhecer e diferenciar as cores primárias e secundárias',
      'Identificar formas geométricas fundamentais (círculo, quadrado, triângulo, retângulo)',
      'Trabalhar padrões lógicos e raciocínio espacial'
    ],
    howToUse: [
      'Imprima as pranchas em papel resistente',
      'Sugerimos plastificar as folhas para que fiquem rígidas e possam ser usadas centenas de vezes',
      'Separe tampinhas plásticas de refrigerante/água de cores variadas (azul, vermelho, verde, amarelo, laranja, branco)',
      'Apresente os desafios gradualmente à criança, começando pelo pareamento simples de cores'
    ],
    materialsNeeded: [
      'Folhas A4 coloridas impressas',
      'Tampinhas de garrafa PET de várias cores',
      'Plástico para plastificação a quente (opcional, mas altamente recomendado)'
    ],
    howToPrint: 'Impressão colorida padrão em folha sulfite. Se possível, plastifique com BOPP ou Polaseal para transformar o recurso em um material pedagógico permanente para sua sala de aula.'
  },
  {
    id: 'alfabetizacao-letras-sons',
    name: 'Alfabetização Divertida: Letras e Sons',
    category: 'Alfabetização',
    tag: 'NOVIDADE',
    tagColor: 'green',
    ageRange: '2 a 6 anos',
    pages: 20,
    format: 'PDF pronto para imprimir',
    printSize: 'A4',
    price: 24.90,
    promoPrice: 16.90,
    imageUrl: 'alfabetizacao-letras',
    galleryUrls: ['alfabetizacao-letras', 'alfabetizacao-letras-g1'],
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    hotmartUrl: 'https://pay.hotmart.com/M55667788N?checkoutMode=10',
    shortDescription: 'Cards interativos focados no som das letras (consciência fonológica) e associação com figuras ilustradas para início da leitura.',
    description: 'A alfabetização não precisa ser mecânica. Com este conjunto de cards interativos, a criança aprende a identificar o som inicial de cada letra de forma lúdica. Cada página traz figuras de animais e objetos cotidianos estimulando a Consciência Fonológica, que é a base indispensável para uma alfabetização bem-sucedida e autônoma.',
    whatYouWillReceive: [
      '26 Cards de letras do alfabeto (A-Z) com ilustração guia de som',
      '5 Pranchas especiais de pareamento de vogais',
      '1 Jogo da memória do alfabeto para recortar',
      'Instruções didáticas com foco no método fônico'
    ],
    objectives: [
      'Desenvolver a consciência fonológica (identificar o fonema inicial)',
      'Associar a grafia da letra (grafema) ao seu som correspondente',
      'Enriquecer o vocabulário e repertório sonoro',
      'Estimular o gosto pela leitura desde a primeira infância'
    ],
    howToUse: [
      'Imprima os cards e faça o recorte nas linhas pontilhadas',
      'Mostre o card à criança, faça o som da letra de forma clara (por exemplo, "A letra M faz mmmm de Macaco")',
      'Peça para ela apontar ou marcar com um prendedor de roupas a figura que começa com o mesmo som'
    ],
    materialsNeeded: [
      'Papel sulfite A4 comum',
      'Tesoura para recortar os cards',
      'Prendedores de roupa de madeira ou plástico (para a criança marcar as respostas corretas)'
    ],
    howToPrint: 'Para melhor usabilidade, imprima os cards em papel offset de gramatura 120g ou papel sulfite normal colado em papel cartão.'
  },
  {
    id: 'coordenacao-motora-tracados',
    name: 'Coordenação Motora Fina: Traçados e Linhas',
    category: 'Coordenação Motora',
    tag: 'MAIS PROCURADO',
    tagColor: 'blue',
    ageRange: '2 a 6 anos',
    pages: 20,
    format: 'PDF pronto para imprimir',
    printSize: 'A4',
    price: 19.90,
    promoPrice: 14.90,
    imageUrl: 'coordenacao-tracados',
    galleryUrls: ['coordenacao-tracados', 'coordenacao-tracados-g1'],
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    hotmartUrl: 'https://pay.hotmart.com/F99001122G?checkoutMode=10',
    shortDescription: 'Pranchas interativas de caminhos e pontilhados para treinar o movimento de pinça, firmeza de punho e controle do lápis.',
    description: 'Antes de começar a escrever letras, a criança precisa treinar o tônus muscular e a precisão do punho. Este caderno de traçados oferece linhas retas, curvas, zigue-zagues, espirais e formas lúdicas onde o aluno ajuda os animaizinhos a chegarem ao seu destino. É o recurso ideal para a preparação pré-escrita de maneira super colorida e feliz.',
    whatYouWillReceive: [
      '20 Páginas com dificuldades progressivas de traçado',
      'Ilustrações de alta definição com dinâmicas divertidas (levar a abelha até a flor, o foguete até a lua, etc.)',
      'Espaço livre para treino de formas básicas no final do arquivo',
      'Certificado de campeão dos traçados para incentivar a criança'
    ],
    objectives: [
      'Trabalhar a coordenação visomotora e controle óculo-manual',
      'Fortalecer os músculos da mão para a pega correta do lápis (movimento tripoide)',
      'Desenvolver a orientação espacial e direcionalidade (esquerda para a direita)'
    ],
    howToUse: [
      'Imprima as pranchas em alta definição',
      'Utilize giz de cera grosso para crianças menores e lápis ou canetinha para os maiores',
      'Dica de ouro: insira as folhas dentro de pastas plásticas transparentes (L-folders). Assim, a criança pode riscar com marcador de quadro branco e apagar com uma flanela para treinar infinitas vezes!'
    ],
    materialsNeeded: [
      'Impressões A4',
      'Lápis, canetinha ou marcador de quadro branco',
      'Pastas plásticas transparentes para reuso infinito (opcional)'
    ],
    howToPrint: 'Impressão comum. Se plastificado, pode ser usado com canetinha apagável de lousa, economizando folhas e gerando grande engajamento.'
  },
  {
    id: 'kit-educacao-infantil',
    name: 'Mega Kit Educação Infantil Completo',
    category: 'Kits Completos',
    tag: 'MAIS VENDIDO',
    tagColor: 'yellow',
    ageRange: '2 a 7 anos',
    pages: 120,
    format: 'PDF pronto para imprimir',
    printSize: 'A4',
    price: 49.90,
    promoPrice: 39.90,
    imageUrl: 'kit-mega',
    galleryUrls: ['kit-mega', 'kit-mega-g1', 'kit-mega-g2'],
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    hotmartUrl: 'https://pay.hotmart.com/K33445566L?checkoutMode=10',
    shortDescription: 'O maior e mais completo combo de atividades pedagógicas! Mais de 100 recursos cobrindo todas as áreas da BNCC.',
    description: 'O Mega Kit Educação Infantil foi desenvolvido com muito carinho para ser o melhor amigo de professoras e mamães. Ele une as melhores atividades de alfabetização, matemática, coordenação, cores, lógica e consciência fonológica em um único arquivo PDF super organizado. Economize dezenas de horas de planejamento com um material estruturado, testado e aprovado por centenas de educadoras brasileiras.',
    whatYouWillReceive: [
      'Alfabeto Ilustrado Completo e treino de escrita das letras',
      'Caderno de Coordenação Motora Fina com traçados divertidos',
      'Atividades de Matemática (números, quantidades e formas)',
      'Pranchas de pareamento e raciocínio de Cores e Formas',
      'Coleção de Bonecos Articulados exclusivos para montar',
      'Bônus: Planejamento semanal simplificado alinhado com a BNCC'
    ],
    objectives: [
      'Garantir um aprendizado integrado e multidisciplinar de acordo com as diretrizes nacionais (BNCC)',
      'Apoiar pais no reforço escolar e professores na otimização de materiais pedagógicos',
      'Estimular múltiplos canais de aprendizagem (visual, tátil e auditivo nos vídeos explicativos)'
    ],
    howToUse: [
      'O kit é dividido em seções identificadas no índice interativo',
      'Imprima os blocos conforme o plano de aula semanal ou interesse da criança',
      'Encaderne o material para criar um lindo caderno de atividades personalizado'
    ],
    materialsNeeded: [
      'Papel A4 comum',
      'Pasta fichário ou espiral para encadernação (opcional)',
      'Materiais de colorir diversos (canetinhas, tintas, giz)'
    ],
    howToPrint: 'Recomendamos a impressão frente e verso para as atividades de traçado e pintura comum, economizando papel, e folha única em alta qualidade para as pranchas de jogos e bonecos.'
  },
  {
    id: 'tampinhas-numeros-quantidades',
    name: 'Tampinhas Educativas: Números e Quantidades',
    category: 'Atividades com Tampinhas',
    tag: 'RECOMENDADO',
    tagColor: 'blue',
    ageRange: '3 a 6 anos',
    pages: 15,
    format: 'PDF pronto para imprimir',
    printSize: 'A4',
    price: 21.90,
    promoPrice: 16.90,
    imageUrl: 'tampinhas-numeros',
    galleryUrls: ['tampinhas-numeros'],
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    hotmartUrl: 'https://pay.hotmart.com/N77889900O?checkoutMode=10',
    shortDescription: 'Cards pedagógicos para trabalhar associação de algarismos e quantidades utilizando tampinhas de garrafa. Ideal para iniciação matemática.',
    description: 'Aprender matemática de forma abstrata é muito difícil para as crianças pequenas. Com o Tampinhas Educativas: Números e Quantidades, o raciocínio matemático se torna físico! A criança associa o número desenhado à quantidade real de tampinhas que ela deve empilhar ou organizar no card.',
    whatYouWillReceive: [
      'Cards numerados de 1 a 20 com representação visual clara',
      'Pranchas de somas simples representadas por círculos de tampinhas',
      'Jogos de contagem ativa "Quantos doces há no pote?"',
      'Guia pedagógico de introdução ao número cardinal'
    ],
    objectives: [
      'Compreender o conceito de número e quantidade física',
      'Exercitar a contagem um a um',
      'Introduzir somas e subtrações básicas com manipulação concreta',
      'Estimular a atenção focada e organização espacial'
    ],
    howToUse: [
      'Imprima e recorte os cartões ilustrados',
      'Peça para a criança identificar o número no card e posicionar o número correspondente de tampinhas plásticas sobre as marcas circulares',
      'Excelente para cantinhos de matemática na Educação Infantil ou atividades de mesa'
    ],
    materialsNeeded: [
      'Impressão do arquivo digital',
      '20 a 30 tampinhas plásticas (garrafa PET)',
      'Prendedores de roupa para exercícios de marcação de números'
    ],
    howToPrint: 'Imprimir em cores, recortar os cards individuais. Sugerimos papel de gramatura 120g ou superior.'
  },
  {
    id: 'alfabeto-ilustrado-completo',
    name: 'Alfabeto Ilustrado Completo A-Z',
    category: 'Alfabetização',
    tag: 'RECOMENDADO',
    tagColor: 'blue',
    ageRange: '3 a 7 anos',
    pages: 26,
    format: 'PDF pronto para imprimir',
    printSize: 'A4',
    price: 29.90,
    promoPrice: 19.90,
    imageUrl: 'alfabeto-completo',
    galleryUrls: ['alfabeto-completo'],
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    hotmartUrl: 'https://pay.hotmart.com/A12312312B?checkoutMode=10',
    shortDescription: 'Páginas completas de A a Z com letras bastão grandes, ilustrações coloridas maravilhosas e treino de contorno.',
    description: 'Uma folha inteira dedicada a cada letra do alfabeto! Cada página traz a letra em formato bastão gigante (ótimo para preencher com massinha, tinta guache ou colagem), três ilustrações divertidas de palavras que iniciam com aquela letra, e linhas caligráficas iniciais para treinar a escrita básica.',
    whatYouWillReceive: [
      '26 Páginas exclusivas (uma para cada letra do alfabeto)',
      'Ilustrações lúdicas e infantis de alta qualidade artística',
      'Indicação das setas de direção de escrita correta para cada letra'
    ],
    objectives: [
      'Aprender o traçado correto das letras maiúsculas (bastão)',
      'Desenvolver o reconhecimento da forma visual de cada letra do alfabeto',
      'Associar a letra ao vocabulário básico ilustrado'
    ],
    howToUse: [
      'Imprima a letra do dia para a sua turma ou filho',
      'Antes de usar o lápis, peça para a criança passar o dedinho seguindo as setas direcionais da letra',
      'Utilize tintas, massinhas, papéis picados para preencher a letra gigante lúdica'
    ],
    materialsNeeded: [
      'Papel sulfite comum para impressão',
      'Tinta guache, pincel, cotonetes ou massinha',
      'Lápis de escrever ou lápis de cor'
    ],
    howToPrint: 'Impressão comum colorida em impressora jato de tinta ou laser. Cores muito vivas!'
  },
  {
    id: 'kit-sensorial-completo',
    name: 'Kit Sensorial Completo para Imprimir',
    category: 'Atividades Sensoriais',
    tag: 'RECOMENDADO',
    tagColor: 'blue',
    ageRange: '1 a 5 anos',
    pages: 30,
    format: 'PDF pronto para imprimir',
    printSize: 'A4',
    price: 39.90,
    promoPrice: 29.90,
    imageUrl: 'kit-sensorial',
    galleryUrls: ['kit-sensorial'],
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    hotmartUrl: 'https://pay.hotmart.com/S99887766T?checkoutMode=10',
    shortDescription: 'Cards de texturas, exploração tátil e auditiva, cartelas para pareamento de sensações e dinâmicas interativas.',
    description: 'Estimular os sentidos na infância constrói as conexões neurais responsáveis por pensamentos complexos! Este arquivo digital traz moldes para criar tapetes sensoriais, cartões de texturas (onde você cola algodão, lixa, feijões, feltro nos espaços demarcados), pareamento de expressões faciais e fichas de regulação emocional.',
    whatYouWillReceive: [
      '10 Moldes para cartões de texturas para colagem prática',
      '8 Fichas de Expressões Faciais e Sentimentos',
      '12 Pranchas de pareamento de sombras e cores de alto contraste para bebês',
      'Dicas de montagem de uma caixa sensorial ecológica'
    ],
    objectives: [
      'Promover a integração sensorial de forma organizada e segura',
      'Estimular o vocabulário descritivo (macio, áspero, liso, duro, mole)',
      'Apoiar o desenvolvimento emocional e reconhecimento de sentimentos',
      'Exercitar a motricidade grossa e refinada simultaneamente'
    ],
    howToUse: [
      'Imprima as bases de cartões sensoriais',
      'Cole os materiais indicados (como algodão na nuvem, lixa de unha na base do jacaré, grãos na estrada) para criar o relevo físico',
      'Deixe a criança explorar os cartões de olhos abertos e depois vendados para um desafio extra!'
    ],
    materialsNeeded: [
      'Folhas de alta gramatura para segurar os pesos das colagens',
      'Cola branca forte ou cola quente',
      'Elementos de textura (algodão, barbante, arroz, lixa, tecidos diversos)'
    ],
    howToPrint: 'Recomendamos papel grosso (tipo offset 180g ou papel cartão) para suportar a fixação de elementos de texturas reais.'
  }
];

export const DEMO_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    name: 'Mariana Silva',
    role: 'Professora de Educação Infantil',
    city: 'São Paulo - SP',
    stars: 5,
    comment: 'Os bonecos articulados fizeram o maior sucesso na minha turma! As crianças amaram pintar e recortar. O material tem uma qualidade incrível e é super fácil de montar. Indico muito!',
    productName: 'Boneco Articulado Menino para Imprimir',
    verified: true,
    avatarUrl: 'MS'
  },
  {
    id: 'rev-2',
    name: 'Ana Cláudia Mendes',
    role: 'Mãe e Psicopedagoga',
    city: 'Belo Horizonte - MG',
    stars: 5,
    comment: 'Excelente material pedagógico. Utilizo as atividades com tampinhas nos meus atendimentos e as crianças se mantêm super concentradas. É lúdico, inteligente e o preço é maravilhoso.',
    productName: 'Atividades com Tampinhas: Cores e Formas',
    verified: true,
    avatarUrl: 'AM'
  },
  {
    id: 'rev-3',
    name: 'Cláudia Rocha',
    role: 'Coordenadora Pedagógica',
    city: 'Curitiba - PR',
    stars: 5,
    comment: 'Comprei o Kit de Alfabetização para a nossa escola e os professores ficaram encantados com a clareza e as lindas ilustrações. A entrega pela Hotmart foi imediata e o processo foi muito prático.',
    productName: 'Mega Kit Educação Infantil Completo',
    verified: true,
    avatarUrl: 'CR'
  }
];

export const INITIAL_SITE_CONFIG: SiteConfig = {
  promoText: 'Materiais pedagógicos digitais para aprender, brincar e criar',
  contactEmail: 'contato@atividadescriativasoficial.com.br',
  instagramUrl: 'https://instagram.com/atividadescriativasoficial',
  facebookUrl: 'https://facebook.com/atividadescriativasoficial',
  youtubeChannelUrl: 'https://youtube.com/atividadescriativasoficial',
  bannerTitlePrefix: 'Atividades em PDF prontas para ',
  bannerTitleHighlight: 'imprimir e aplicar!',
  bannerDescription: 'Garanta kits exclusivos para acelerar o aprendizado e a alfabetização do seu pequeno de forma lúdica, prática e 100% livre de telas!',
  whyChooseUsTitle: 'nossas atividades',
  whyChooseUsSubtitle: 'POR QUE ESCOLHER',
  whyChooseUsDescription: 'Nossos materiais foram criados por especialistas em educação infantil para tornar o aprendizado mais leve, divertido e significativo. Cada detalhe é pensado para poupar o tempo do professor e encantar o aluno.',
  whyChooseUsCreativity: 90,
  whyChooseUsLearning: 95,
  whyChooseUsPracticality: 88,
  footerLegalText: 'Atividades Criativas Oficial é um site independente de materiais pedagógicos para impressão.',
  hotmartSectionTitle: 'Sua compra está totalmente segura!',
  hotmartSectionDescription: 'Após a confirmação do pagamento pela Hotmart, você receberá um link exclusivo de download em seu e-mail cadastrado. Tudo de forma rápida, automatizada e segura.',
  
  // Default values for newly added options
  bannerBadge: '⭐ MATERIAL DIDÁTICO DIGITAL EXCLUSIVO',
  bannerButtonText: 'Ver Kits Completos',
  bannerSecondaryButtonText: 'Baixar Atividade Gratuita',
  bannerButtonLink: '#destaque-section',
  bannerSecondaryButtonLink: '#destaque-section',
  bannerBgColor: 'gradient-blue-emerald',
  bannerMainImageUrl: 'banner_main_illustration',
  bannerIsActive: true,
  heroBackgroundImage: '',
  heroCardImage: '',
  hideHeroCardImage: false,
  featuredProductId: 'demo-kit-educacao-infantil',
  bannerImageMode: 'linked',
  
  hotmartSectionButtonText: 'Garantir Meus Kits Agora',
  hotmartSectionButtonLink: '#destaque-section',
  hotmartSectionIsActive: true,
  
  newsletterTitle: 'Quer receber atividades gratuitas toda semana?',
  newsletterDescription: 'Inscreva seu e-mail abaixo e faça parte do nosso clube exclusivo de educadores e pais criativos.',
  newsletterButtonText: 'Quero Receber!',
  newsletterButtonUrl: '#destaque-section',
  newsletterIsActive: true,
  
  footerPolicyLink: '/politicas-de-privacidade',
  footerTermsLink: '/termos-de-uso',
  footerDescription: 'Nossa missão é impulsionar a educação de forma divertida e memorável, entregando recursos lúdicos criados por profissionais.',
  pinterestUrl: 'https://pinterest.com/atividadescriativasoficial',
  whatsappNumber: '+55 11 99999-9999',
  openingHours: 'Segunda a sexta, das 9h às 18h',
  sectionVisibility: { categories: false },

  // Logo and Identity Defaults
  logoUrl: '',
  logoStoragePath: '',
  logoAlt: 'Atividades Criativas Oficial',
  logoDesktopWidth: 220,
  logoTabletWidth: 190,
  logoMobileWidth: 160,
  logoMaxHeight: 70,
  logoAlignment: 'left',
  logoMarginTop: 0,
  logoMarginBottom: 0,
  logoMarginLeft: 0,
  logoMarginRight: 0,
  useDifferentMobileLogo: false,
  mobileLogoUrl: '',
  mobileLogoStoragePath: '',
  faviconUrl: '',
  faviconStoragePath: '',
  bannerImageUrl: '',
  categoryImageUrl: '',
  kitImageUrl: '',
  newsletterImageUrl: '',
  footerImageUrl: '',
  updatedAt: '',

  // Author Section Defaults
  authorSectionEnabled: true,
  authorSectionTitle: 'Quem está por trás da Creative Activities Oficial',
  authorNameTitle: 'Muito prazer, eu sou a Andreia Silva!',
  authorBioText: 'Acredito na educação que transforma. Minha jornada é movida pelo desejo de fazer a diferença, unindo minhas formações em Pedagogia, Educação Física Escolar e Neuropsicopedagogia.\n\nA Creative Activities Oficial é a realização de um grande sonho: tirar os projetos do rascunho e conectar o aprendizado à arte criativa.\n\nMeu maior propósito é ser luz e deixar sementes por onde eu passar, capacitando as crianças a enxergarem o mundo muito além das paredes de uma sala de aula.',
  authorHighlightText: 'Seja muito bem-vindo(a) a este espaço de criatividade e transformação!',
  authorPhotoUrl: '', // Let it start empty so the admin can upload or we fallback beautifully
  authorPhotoStoragePath: '',
  authorButtonText: 'Conhecer os materiais',
  authorButtonAction: 'scroll',

  // Activity Group Defaults
  activityGroupEnabled: true,
  activityGroupTitle: 'Participe do nosso grupo de atividades',
  activityGroupDescription: 'Entre para uma comunidade de pessoas que amam atividades criativas, ideias pedagógicas e materiais para trabalhar com crianças.',
  activityGroupNote: 'Receba novidades, compartilhe ideias e acompanhe conteúdos especiais.',
  activityGroupImageUrl: '',
  activityGroupImageStoragePath: '',
  activityGroupButtonText: 'Entrar no grupo',
  activityGroupButtonUrl: '#',
  activityGroupOpenInNewTab: true
};

