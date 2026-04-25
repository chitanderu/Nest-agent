export type Word = {
  id: string; // 单词ID
  word: string; // 单词
  phonetic?: string; // 音标
  definition?: string; // 定义
  translation?: string; // 翻译
  pos?: string; // 词性
  collins?: string; // 柯林斯
  oxford?: string; // 牛津
  tag?: string; // 标签
  bnc?: string; // BNC 英国国家语料库
  frq?: string; // FRQ 频率
  exchange?: string; // 同义词
  gk?: boolean; // 高考
  zk?: boolean; // 中考
  gre?: boolean; // GRE
  toefl?: boolean; // TOEFL
  ielts?: boolean; // IELTS
  cet6?: boolean; // 大学英语六级
  cet4?: boolean; // 大学英语四级
  ky?: boolean; // 考研
  createdAt: string; // 创建时间, ISO 日期字符串
  updatedAt: string; // 更新时间, ISO 日期字符串
};

export type WordList = {
  list: Word[];
  total: number;
};

export interface WordQuery {
  page: number;
  pageSize: number;
  word?: string;
  gk?: boolean;
  zk?: boolean;
  gre?: boolean;
  toefl?: boolean;
  ielts?: boolean;
  cet6?: boolean;
  cet4?: boolean;
  ky?: boolean;
}
