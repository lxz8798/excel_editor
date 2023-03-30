export const cardList = (() => {
  const result: any[] = [];
  for (let i = 0; i < 12; i++) {
    result.push({
      title: '工作管理',
      icon: 'logos:vue',
      color: '#1890ff',
      active: '100',
      new: '1,799',
      download: 'bx:bx-download',
    });
  }
  return result;
})();
