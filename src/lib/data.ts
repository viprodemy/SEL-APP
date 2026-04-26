
import type { Emotion, Reward, StudentCheckIn, PowerCard } from '@/types';
import { Flower2, Gem, Shield, Sun, Waves } from 'lucide-react';

export const emotions: Emotion[] = [
  { id: 'happy', name: { en: 'Happy', ms: 'Gembira', zh: '开心' }, emoji: '😄', category: 'Positive' },
  { id: 'sad', name: { en: 'Sad', ms: 'Sedih', zh: '伤心' }, emoji: '😢', category: 'Negative' },
  { id: 'angry', name: { en: 'Angry', ms: 'Marah', zh: '生气' }, emoji: '😠', category: 'Negative' },
  { id: 'scared', name: { en: 'Scared / Nervous', ms: 'Takut / Cemas', zh: '害怕 / 紧张' }, emoji: '😰', category: 'Negative' },
  { id: 'stressed', name: { en: 'Stressed', ms: 'Stres / Tertekan', zh: '压力很大' }, emoji: '😖', category: 'Negative' },
  { id: 'worried', name: { en: 'Worried', ms: 'Risau', zh: '担心' }, emoji: '😟', category: 'Negative' },
  { id: 'tired', name: { en: 'Tired', ms: 'Letih / Penat', zh: '累' }, emoji: '😫', category: 'Neutral' },
  { id: 'disappointed', name: { en: 'Disappointed', ms: 'Kecewa', zh: '失望' }, emoji: '😞', category: 'Negative' },
  { id: 'lonely', name: { en: 'Lonely', ms: 'Sunyi', zh: '孤单' }, emoji: '🥺', category: 'Negative' },
  { id: 'wronged', name: { en: 'Wronged', ms: 'Rasa Dianiaya', zh: '委屈' }, emoji: '😔', category: 'Negative' },
  { id: 'guilty', name: { en: 'Guilty', ms: 'Rasa Bersalah', zh: '内疚' }, emoji: '😥', category: 'Negative' },
  { id: 'bored', name: { en: 'Bored', ms: 'Bosan', zh: '无聊' }, emoji: '🥱', category: 'Neutral' },
  { id: 'proud', name: { en: 'Proud', ms: 'Bangga', zh: '自豪' }, emoji: '😊', category: 'Positive' },
  { id: 'not_sure', name: { en: "I'm not sure", ms: 'Saya tak pasti', zh: '我不知道' }, emoji: '🤔', category: 'Neutral' },
];

export const rewards: Reward[] = [
    {
      id: 'explorer',
      streak: 3,
      name: { en: 'Emotion Explorer', ms: 'Penjelajah Emosi', zh: '情绪探险家' },
      description: { en: "You're learning to notice your feelings.", ms: 'Kamu sedang belajar mengenal emosi kamu.', zh: '你正在学习认识自己的情绪。' },
      icon: Flower2,
    },
    {
      id: 'calm_hero_1',
      streak: 7,
      name: { en: 'Calm Hero Level 1', ms: 'Wira Tenang Tahap 1', zh: '冷静小英雄一级' },
      description: { en: 'You practiced calmness for a week.', ms: 'Kamu sudah berlatih tenang selama seminggu.', zh: '你已经坚持一周练习冷静与觉察。' },
      icon: Waves,
    },
    {
      id: 'positive_thinker',
      streak: 14,
      name: { en: 'Positive Thinker', ms: 'Pemikir Positif', zh: '正向思考者' },
      description: { en: 'You found bright sides in hard moments.', ms: 'Kamu dapat lihat sisi positif dalam situasi sukar.', zh: '你在困难中找到了光明的一面。' },
      icon: Sun,
    },
    {
      id: 'self_leader',
      streak: 21,
      name: { en: 'Self-Leader', ms: 'Pemimpin Diri', zh: '自我领导者' },
      description: { en: 'You lead yourself with heart and mind.', ms: 'Kamu memimpin diri dengan hati dan fikiran.', zh: '你正在用心与理智领导自己。' },
      icon: Gem,
    },
    {
      id: 'psl_champion',
      streak: 30,
      name: { en: 'PSL Champion', ms: 'Juara PSL', zh: 'PSL 冠军' },
      description: { en: 'Unlocks new avatar costumes & affirmations.', ms: 'Buka avatar baharu & ayat afirmasi khas.', zh: '解锁新头像与专属肯定语句。' },
      icon: Shield,
    },
  ];

export const powerCards: { [key: string]: PowerCard[] } = {
  happy: [
    { en: 'I am grateful for the joy in my heart.', zh: '我感恩自己心中的喜悦。' },
    { en: 'I spread my happiness to others.', zh: '我的快乐能感染身边的人。' },
    { en: 'Today is full of good energy.', zh: '今天充满好能量。' },
    { en: 'My smile makes the world brighter.', zh: '我的笑容让世界更美好。' },
    { en: 'I deserve to be happy every day.', zh: '我值得每天都开心。' },
  ],
  sad: [
    { en: 'It’s okay to feel sad, my heart is healing.', zh: '伤心没关系，我的心正在慢慢痊愈。' },
    { en: 'I allow my tears to help me grow stronger.', zh: '眼泪让我变得更坚强。' },
    { en: 'Every emotion is a teacher.', zh: '每一种情绪都是老师。' },
    { en: 'I am safe to express my feelings.', zh: '我可以安全地表达感受。' },
    { en: 'After rain, the rainbow will appear.', zh: '雨后会有彩虹。' },
  ],
  angry: [
    { en: 'I can calm my mind and choose peace.', zh: '我能让心平静，选择平和。' },
    { en: 'I am in control of my actions.', zh: '我能控制自己的行为。' },
    { en: 'My breath helps me release anger.', zh: '深呼吸帮助我释放愤怒。' },
    { en: 'I choose understanding over shouting.', zh: '我选择理解而不是吼叫。' },
    { en: 'I can turn anger into courage.', zh: '我能把生气转化为勇气。' },
  ],
  scared: [
    { en: 'I am safe and protected.', zh: '我是安全的，被保护着。' },
    { en: 'I can face new things bravely.', zh: '我能勇敢面对新的事物。' },
    { en: 'My courage grows each time I try.', zh: '每一次尝试都让我更勇敢。' },
    { en: 'It’s okay to be nervous — it means I care.', zh: '紧张没关系，这代表我在乎。' },
    { en: 'I trust myself to handle challenges.', zh: '我相信自己能应对挑战。' },
  ],
  stressed: [
    { en: 'I can take one step at a time.', zh: '我可以一步一步来。' },
    { en: 'I am doing my best, and that’s enough.', zh: '我已经尽力了，这就够好。' },
    { en: 'I allow myself to rest and recharge.', zh: '我允许自己休息、充电。' },
    { en: 'I can handle things calmly.', zh: '我能冷静地处理事情。' },
    { en: 'I release what I cannot control.', zh: '我放下那些我无法控制的事。' },
  ],
  worried: [
    { en: 'I choose faith over fear.', zh: '我选择信任而不是害怕。' },
    { en: 'Everything will work out in time.', zh: '一切都会在时间中变好。' },
    { en: 'I focus on what I can do now.', zh: '我专注在现在能做的事。' },
    { en: 'My calm heart brings clear answers.', zh: '平静的心会带来答案。' },
    { en: 'I am surrounded by support and love.', zh: '我被爱与支持包围着。' },
  ],
  tired: [
    { en: 'Rest is part of my success.', zh: '休息也是成功的一部分。' },
    { en: 'I allow myself to slow down.', zh: '我允许自己慢下来。' },
    { en: 'I am proud of what I’ve done today.', zh: '我为今天的努力感到骄傲。' },
    { en: 'My body deserves care and love.', zh: '我的身体值得被照顾和爱护。' },
    { en: 'I can begin again tomorrow.', zh: '明天我可以重新开始。' },
  ],
  disappointed: [
    { en: 'I learn from this and move forward.', zh: '我从中学习并继续前进。' },
    { en: 'Not getting what I want can lead to something better.', zh: '得不到想要的，也许有更好的在前方。' },
    { en: 'I still believe in myself.', zh: '我依然相信自己。' },
    { en: 'Every ending brings a new start.', zh: '每一个结束都是新的开始。' },
    { en: 'I am growing stronger through this.', zh: '我正因这次经历变得更强。' },
  ],
  lonely: [
    { en: 'I am never truly alone — love is around me.', zh: '我并不孤单，爱就在我身边。' },
    { en: 'I can reach out and connect with others.', zh: '我可以主动与他人连接。' },
    { en: 'My presence matters.', zh: '我的存在是有意义的。' },
    { en: 'I am learning to enjoy my own company.', zh: '我学会享受与自己相处。' },
    { en: 'I am loved and valued.', zh: '我是被爱与珍惜的。' },
  ],
  wronged: [
    { en: 'My feelings are valid.', zh: '我的感受是值得被理解的。' },
    { en: 'I can speak my truth calmly.', zh: '我能平静地表达自己。' },
    { en: 'I deserve to be understood.', zh: '我值得被倾听与理解。' },
    { en: 'I release pain and choose peace.', zh: '我释放委屈，选择平和。' },
    { en: 'I am proud of myself for staying kind.', zh: '我为自己保持善良而骄傲。' },
  ],
  guilty: [
    { en: 'I forgive myself and learn from this.', zh: '我原谅自己，并从中学习。' },
    { en: 'Everyone makes mistakes — that’s how we grow.', zh: '每个人都会犯错，那是成长的一部分。' },
    { en: 'I can make things right with love and honesty.', zh: '我可以用爱与真诚来弥补。' },
    { en: 'I am worthy of forgiveness and peace.', zh: '我值得被原谅，也值得平静。' },
    { en: 'I choose to move forward with kindness to myself.', zh: '我选择带着善意继续前进。' },
  ],
  bored: [
    { en: "It's okay not to know everything.", zh: '不知道没关系。' },
    { en: 'I trust myself to find answers in time.', zh: '我相信自己会找到答案。' },
    { en: 'Every question helps me grow wiser.', zh: '每一个疑问都让我成长。' },
    { en: 'Uncertainty can lead to discovery.', zh: '不确定也可能带来发现。' },
    { en: 'I am open to learning new things.', zh: '我愿意学习新的事物。' },
  ],
  proud: [
    { en: 'I am grateful for the joy in my heart.', zh: '我感恩自己心中的喜悦。' },
    { en: 'I spread my happiness to others.', zh: '我的快乐能感染身边的人。' },
    { en: 'Today is full of good energy.', zh: '今天充满好能量。' },
    { en: 'My smile makes the world brighter.', zh: '我的笑容让世界更美好。' },
    { en: 'I deserve to be happy every day.', zh: '我值得每天都开心。' },
  ],
  not_sure: [
    { en: 'It’s okay not to know everything.', zh: '不知道没关系。' },
    { en: 'I trust myself to find answers in time.', zh: '我相信自己会找到答案。' },
    { en: 'Every question helps me grow wiser.', zh: '每一个疑问都让我成长。' },
    { en: 'Uncertainty can lead to discovery.', zh: '不确定也可能带来发现。' },
    { en: 'I am open to learning new things.', zh: '我愿意学习新的事物。' },
  ]
};
