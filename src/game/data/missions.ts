import { Mission, GamePath } from '../types';

export const PROTECTION_MISSIONS: Mission[] = [
  {
    id: 'prot_1',
    title: 'Quem é essa criança?',
    npcName: 'Marta',
    gridX: 3,
    gridY: 4,
    color: '#e76f51',
    questions: [
      {
        id: 'p1_q1',
        category: 'Direitos',
        prompt: 'Marta, professora: "Todo mundo fala em ESTATUTO por aqui. O que é um estatuto?"',
        correctAnswer: 'Uma lei que reúne os direitos e as regras de proteção de um grupo específico',
        wrongAnswers: ['Um regimento interno só da escola', 'Uma punição aplicada a quem erra'],
        explanation: 'Estatuto é uma lei que organiza direitos e deveres de um grupo, como crianças, jovens ou idosos.'
      },
      {
        id: 'p1_q2',
        category: 'Proteção',
        prompt: 'Léo tem 9 anos e Bia tem 15. Pelo ECA, quem é criança e quem é adolescente?',
        correctAnswer: 'Criança: até 12 anos incompletos. Adolescente: de 12 a 18 anos',
        wrongAnswers: ['Criança: até 14 anos. Adolescente: de 15 a 21', 'Só é adolescente quem já trabalha'],
        explanation: 'O ECA (Lei 8.069/1990) define assim no artigo 2º.'
      },
      {
        id: 'p1_q3',
        category: 'Direitos',
        prompt: 'Um vizinho diz: "Criança tem que obedecer e pronto." Qual característica do ECA mostra o contrário?',
        correctAnswer: 'Proteção integral: crianças e adolescentes são sujeitos de direitos, com prioridade absoluta',
        wrongAnswers: ['O ECA vale só para quem está na escola', 'O ECA dá direitos, mas não cobra nada da família nem do Estado'],
        explanation: 'Família, sociedade e Estado têm o dever de garantir esses direitos com prioridade absoluta.'
      }
    ]
  },
  {
    id: 'prot_2',
    title: 'A porta azul',
    npcName: 'Seu Raul',
    gridX: 3,
    gridY: 7,
    color: '#264653',
    questions: [
      {
        id: 'p2_q1',
        category: 'Proteção',
        prompt: 'Seu Raul, na porta azul: "Como o Conselho Tutelar é formedo?"',
        correctAnswer: 'Órgão permanente e autônomo, em cada município, com 5 conselheiros escolhidos pela comunidade',
        wrongAnswers: ['Uma delegacia formada só por policiais', 'Um grupo nomeado pelo prefeito, sem voto'],
        explanation: 'O Conselho Tutelar é municipal, permanente e autônomo, e seus membros são escolhidos pela comunidade local.'
      },
      {
        id: 'p2_q2',
        category: 'Proteção',
        prompt: 'Chega o caso de uma menina fora da escola e com sinais de negligência. Qual é a atribuição do Conselho?',
        correctAnswer: 'Atender o caso, orientar a família e requisitar serviços de saúde, educação ou assistência',
        wrongAnswers: ['Julgar a família e decidir a pena', 'Prender o responsável'],
        explanation: 'O Conselho não julga nem prende: atende, aconselha, encaminha e requisita serviços. Quem julga é a Justiça.'
      }
    ]
  },
  {
    id: 'prot_3',
    title: 'A cidade dos jovens',
    npcName: 'Júlia',
    gridX: 17,
    gridY: 4,
    color: '#9b5de5',
    questions: [
      {
        id: 'p3_q1',
        category: 'Direitos',
        prompt: 'Júlia, 22 anos: "O Estatuto da Juventude vale para quem?"',
        correctAnswer: 'Pessoas de 15 a 29 anos (Lei 12.852/2013)',
        wrongAnswers: ['Só para quem tem de 12 a 18 anos', 'Para qualquer pessoa, sem limite de idade'],
        explanation: 'O Estatuto da Juventude é voltado a jovens de 15 a 29 anos.'
      },
      {
        id: 'p3_q2',
        category: 'Participação',
        prompt: 'Júlia quer que os jovens opinem nas políticas da cidade. Por que o Estatuto é importante aqui?',
        correctAnswer: 'Garante direitos como participação, educação, trabalho e cultura e exige políticas disponíveis aos jovens',
        wrongAnswers: ['Não é importante: política é coisa de adulto', 'Só garante o direito ao lazer'],
        explanation: 'Sua importância está em tornar esses direitos concretos, com políticas e serviços realmente disponíveis.'
      }
    ]
  },
  {
    id: 'prot_4',
    title: 'Dona Lúcia',
    npcName: 'Dona Lúcia',
    gridX: 10,
    gridY: 4,
    color: '#bc6c25',
    questions: [
      {
        id: 'p4_q1',
        category: 'Direitos',
        prompt: 'Dona Lúcia tem 68 anos. O Estatuto da Pessoa Idosa vale para quem?',
        correctAnswer: 'Pessoas com 60 anos ou mais (Lei 10.741/2003)',
        wrongAnswers: ['Só para quem tem 75 anos ou mais', 'Só para aposentados'],
        explanation: 'O Estatuto da Pessoa Idosa vale a partir dos 60 anos.'
      },
      {
        id: 'p4_q2',
        category: 'Direitos',
        prompt: 'Ela espera horas na fila do posto. O que o Estatuto garante sobre serviços disponíveis?',
        correctAnswer: 'Atendimento prioritário e acesso a serviços, como saúde pelo SUS e transporte',
        wrongAnswers: ['Nada: a fila vale igual para todos', 'Apenas atendimento em casa'],
        explanation: 'O Estatuto é importante porque protege a dignidade na velhice e torna dever do Estado e da sociedade oferecer políticas e serviços.'
      }
    ]
  }
];

export const SECURITY_MISSIONS: Mission[] = [
  {
    id: 'sec_1',
    title: 'O bairro esquecido',
    npcName: 'Carlos',
    gridX: 3,
    gridY: 7,
    color: '#2a9d8f',
    questions: [
      {
        id: 's1_q1',
        category: 'Prevenção',
        prompt: 'Carlos, agente comunitário: "No bairro Alto não há iluminação, a escola é longe e muitas famílias estão sem renda. Esse grupo está mais exposto à violência e à exclusão." O que você identifica?',
        correctAnswer: 'Vulnerabilidade',
        wrongAnswers: ['Participação social', 'Governança federativa'],
        explanation: 'Vulnerabilidade é a maior exposição a riscos por condições sociais, econômicas ou de acesso a direitos.'
      },
      {
        id: 's1_q2',
        category: 'Prevenção',
        prompt: 'Por que mapear fatores de risco como esses?',
        correctAnswer: 'Para prevenir a violência antes que ela aconteça',
        wrongAnswers: ['Para punir os moradores', 'Para esconder os dados da comunidade'],
        explanation: 'Conhecer os fatores de risco permite agir cedo, com prevenção.'
      }
    ]
  },
  {
    id: 'sec_2',
    title: 'A casa do fim da rua',
    npcName: 'Ana',
    gridX: 18,
    gridY: 5,
    color: '#e63946',
    questions: [
      {
        id: 's2_q1',
        category: 'Segurança',
        prompt: 'Ana, vizinha: "Uma criança vive trancada, apanha e passa fome." Isso é...',
        correctAnswer: 'Maus-tratos',
        wrongAnswers: ['Discriminação', 'Participação social'],
        explanation: 'Maus-tratos são ações ou omissões que causam dano físico ou psicológico, incluindo a negligência.'
      },
      {
        id: 's2_q2',
        category: 'Segurança',
        prompt: 'Segunda denúncia: uma moça foi barrada em uma loja por causa da cor da pele. Isso é...',
        correctAnswer: 'Discriminação',
        wrongAnswers: ['Maus-tratos', 'Governança federativa'],
        explanation: 'Discriminação é o tratamento desigual e injusto por raça, gênero, idade, origem ou outra característica.'
      },
      {
        id: 's2_q3',
        category: 'Prevenção',
        prompt: 'Terceira: uma família perdeu a casa na enchente e ficou sem renda. Que fator de risco predomina?',
        correctAnswer: 'Vulnerabilidade',
        wrongAnswers: ['Maus-tratos', 'Discriminação'],
        explanation: 'Aqui falta proteção social e acesso a direitos: é vulnerabilidade.'
      }
    ]
  },
  {
    id: 'sec_3',
    title: 'A reunião',
    npcName: 'Profª Helena',
    gridX: 10,
    gridY: 7,
    color: '#f77f00',
    questions: [
      {
        id: 's3_q1',
        category: 'Segurança',
        prompt: 'Helena abre a reunião: "O que são políticas de segurança pública?"',
        correctAnswer: 'Conjunto de ações de prevenção, proteção e resposta que integram vários setores',
        wrongAnswers: ['Apenas o aumento de viaturas', 'Apenas a punição de quem comete crimes'],
        explanation: 'Política de segurança vai além da polícia: envolve prevenção, saúde, educação, assistência e outros atores.'
      },
      {
        id: 's3_q2',
        category: 'Participação',
        prompt: 'Alguém diz: "Segurança é coisa só da polícia." O que diz a Constituição (art. 144)?',
        correctAnswer: 'É dever do Estado, direito e responsabilidade de todos',
        wrongAnswers: ['É responsabilidade só da polícia', 'É problema apenas de cada família'],
        explanation: 'A segurança pública é dever do Estado, mas também direito e responsabilidade de todos.'
      },
      {
        id: 's3_q3',
        category: 'Participação',
        prompt: 'Qual ação é participação social em segurança pública?',
        correctAnswer: 'Participar de conselhos, conferências e reuniões comunitárias',
        wrongAnswers: ['Fazer justiça com as próprias mãos', 'Ficar calado sobre os problemas do bairro'],
        explanation: 'A comunidade participa opinando, propondo e acompanhando as ações.'
      }
    ]
  },
  {
    id: 'sec_4',
    title: 'O Plano',
    npcName: 'Cap. Duarte',
    gridX: 17,
    gridY: 7,
    color: '#457b9d',
    questions: [
      {
        id: 's4_q1',
        category: 'Segurança',
        prompt: 'No painel há peças do PNSP. Qual NÃO é pressuposto básico do Plano?',
        correctAnswer: 'Foco exclusivo em repressão, sem prevenção',
        wrongAnswers: ['Gestão baseada em evidências', 'Governança federativa'],
        explanation: 'Os pressupostos são: vigência decenal, gestão baseada em evidências, governança federativa, prevenção e redução da letalidade e acompanhamento participativo.'
      },
      {
        id: 's4_q2',
        category: 'Prevenção',
        prompt: 'O PNSP tem vigência decenal. Isso significa...',
        correctAnswer: 'Planejamento para 10 anos, com acompanhamento participativo',
        wrongAnswers: ['Vale por apenas 1 ano', 'Muda a cada eleição'],
        explanation: 'Vigência decenal dá continuidade às ações, para além de um mandato.'
      }
    ]
  }
];

export function getMissionsForPath(path: GamePath): Mission[] {
  return path === 'protection' ? PROTECTION_MISSIONS : SECURITY_MISSIONS;
}
