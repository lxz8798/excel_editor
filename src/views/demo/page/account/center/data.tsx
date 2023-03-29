export interface ListItem {
  title: string;
  icon: string;
  color?: string;
}

export interface TabItem {
  key: string;
  name: string;
  component: string;
}

export const tags: string[] = [
  '石油工程',
  '很有想法的',
  '专注设计',
  '海纳百川',
];

export const teams: ListItem[] = [
  {
    icon: 'material-symbols:oil-barrel-outline',
    title: '石油工程开发团队',
    color: '#ff4000',
  },
  {
    icon: 'material-symbols:oil-barrel-outline',
    title: '石油工程算法团队',
    color: '#7c51b8',
  },
  {
    icon: 'ic:twotone-architecture',
    title: '建筑工程团队',
    color: '#00adf7',
  },
  {
    icon: 'game-icons:minerals',
    title: '矿业工程团队',
    color: '#00adf7',
  },
  {
    icon: 'map:doctor',
    title: '医学工程团队',
    color: '#7c51b8',
  },
  // {
  //   icon: 'jam:codepen-circle',
  //   title: '程序员日常',
  //   color: '#ff4000',
  // },
];

export const details: ListItem[] = [
  {
    icon: 'ic:outline-contacts',
    title: '智能封堵攻关',
  },
  {
    icon: 'grommet-icons:cluster',
    title: '封堵学',
  },
  {
    icon: 'bx:bx-home-circle',
    title: '四川成都',
  },
];

export const achieveList: TabItem[] = [
  // {
  //   key: '1',
  //   name: '文章',
  //   component: 'Article',
  // },
  {
    key: '2',
    name: '我的项目',
    component: 'Application',
  },
  {
    key: '3',
    name: '全部项目',
    component: 'Project',
  },
];

export const actions: any[] = [
  { icon: 'clarity:star-line', text: '156', color: '#018ffb' },
  { icon: 'bx:bxs-like', text: '156', color: '#459ae8' },
  { icon: 'bx:bxs-message-dots', text: '2', color: '#42d27d' },
];

export const articleList = (() => {
  const result: any[] = [];
  // for (let i = 0; i < 4; i++) {
  //   result.push({
  //     title: '',
  //     description: ['Test', '设计语言', 'Typescript'],
  //     content: '基于Vue3, TypeScript, Ant Design实现的一套完整的管理系统。',
  //     time: '2020-11-14 11:20',
  //   });
  // }
  result.push(
    {
      title: '公司拥有技术人员多达2000余人公司拥有技术人员多达2000余人',
      description: ['北京力会澜博能源技术有限公司', '2000余人公司'],
      content: `剥茧算法作为一种基于概率学原理的大数据分析手段，利用工程原生数据，建立“层”、“维”空间结构，以数据模型代替解析模型，构建多因素影响数学关系构建，完成无人为干预环境中主控因素筛选，实现工程因素复杂作用关系“抽丝剥茧”式数据化解构与表征。相对常规算法，剥茧算法具有受工程因素人为误差干扰小、复杂多因素环境适应性强、数据模型具备开源性优化能力等优势。剥茧算法最早于2004年，由团队为解决低密度绒囊钻井流体配方优化与成本控制而提出。至2008年，剥茧算法应用目标从绒囊钻井流体单一体系扩展至绒囊堵水流体、绒囊修井流体等多类型体系，计算目标也从单一密度参数延伸至封堵能力、伤害能力等多目标参数，实现“点”到“线”的升级。2012年，剥茧算法从绒囊系列流体专用辅助算法脱离，发展成为独立的大数据处理工具，并先后完成煤层气产量诊断（2012）、油井压裂产量预测（2012）、破碎性储层漏失分析（2013）、破碎性储层伤害评价（2017）、致密气选择性控水需求诊断（2019），低压气井修井漏失对策研究（2019）及超深井井壁失稳主控因素研究等（2020）领域，实现了“线”到“面”的跨越。依托剥茧算法，团队已先后完成多层合采产量模拟系统、控缝高压裂模拟等物理模拟设备，以及储层敏感性诊断软件、低压气井漏失程度预测软件等数据终端的开发和优化，有效改善了工程实际与室内物理模拟、数值分析等传统方法的对接准确性。后续，团队将充分利用大数据剥茧算法实践中心的平台优势，继续深化与各科研高校、研究院所等单位合作关系，充分利用团队现场防漏堵漏与储层保护系列技术应用数据，实现工程需求诊断数据化、专项技术研发信息化、现场工程实践智能化的战略目标。`,
      time: '2020-11-14 11:20',
    },
    {
      title: '齐备的大型精密机器800余套',
      description: ['客户背景', '解决方案', '客户反馈'],
      content: `
        某橡胶公司生产的鞋底放置2个月后，出现白色喷霜现象，由于不清楚喷霜异物成分，无法解决问题，导致市场销售面临严重危机<br />
        1、与客户沟通后，推测是鞋底配方问题;<br />
        2、确定具体原因，制定分析方案，对异物提取测试;<br />
        3、依据分析结果及样品性能要求，给出调整方案,提高了胶料对助剂的溶解度。<br />
      `,
      time: '2020-11-14 11:20',
    },
  );
  return result;
})();

export const applicationList = (() => {
  const result: any[] = [];
  for (let i = 0; i < 8; i++) {
    result.push({
      title: '表单管理',
      icon: 'emojione-monotone:letter-a',
      color: '#1890ff',
      active: '100',
      new: '1,799',
      download: 'bx:bx-download',
    });
  }
  return result;
})();

export const projectList = (() => {
  const result: any[] = [];
  for (let i = 0; i < 8; i++) {
    result.push({
      title: 'Test Admin',
      content: '基于Vue3, TypeScript, Ant Design实现的一套完整的管理系统。',
    });
  }
  return result;
})();
