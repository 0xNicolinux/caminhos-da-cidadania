import { Mission } from '../types';

export const FINAL_MISSION: Mission = {
  id: 'final_ocorrencia',
  title: 'A Rede',
  npcName: 'Rosa',
  gridX: 10,
  gridY: 5,
  color: '#ffd166',
  questions: [
    {
      id: 'f_q1',
      category: 'Participação',
      prompt: 'OCORRÊNCIA: um adolescente de 14 anos sumiu da escola, a família está sem renda e uma vizinha idosa percebeu maus-tratos, mas ninguém avisou ninguém. Quem é o vilão?',
      correctAnswer: 'Não há um só vilão: a rede não funcionou de forma integrada',
      wrongAnswers: ['A família, sozinha', 'A polícia, sozinha'],
      explanation: 'O problema era resultado de várias falhas conectadas. Falta de integração, não de um culpado.'
    },
    {
      id: 'f_q2',
      category: 'Proteção',
      prompt: 'Escola e saúde avisam o Conselho Tutelar. O que ele faz?',
      correctAnswer: 'Atende o caso, orienta a família e requisita serviços de saúde, educação e assistência',
      wrongAnswers: ['Julga a família', 'Prende o responsável'],
      explanation: 'Atribuições do Conselho: atender, aconselhar, encaminhar e requisitar serviços.'
    },
    {
      id: 'f_q3',
      category: 'Segurança',
      prompt: 'Para evitar novos casos no bairro, qual resposta segue o PNSP?',
      correctAnswer: 'Mapear riscos com dados, integrar setores e acompanhar com a comunidade',
      wrongAnswers: ['Só aumentar o policiamento', 'Esperar uma nova denúncia'],
      explanation: 'Gestão baseada em evidências, governança federativa, prevenção e acompanhamento participativo.'
    },
    {
      id: 'f_q4',
      category: 'Direitos',
      prompt: 'A vizinha idosa e o jovem também precisam de resposta. O que os Estatutos têm em comum?',
      correctAnswer: 'Protegem direitos e exigem políticas e serviços disponíveis',
      wrongAnswers: ['Valem só para quem tem renda', 'Substituem a segurança pública'],
      explanation: 'Estatutos protegem direitos. Políticas de segurança organizam riscos e ações. As duas coisas se encontram na rede.'
    }
  ]
};
