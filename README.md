v1.2.0 更新内容
根据客户反馈，在现有基础上糅合所有功能，不需要太多的管理，此分支将把所有的功能融合进页面上，取消项目管理，团队管理等模块。

v1.3.0 更新内容
1. 在个人中心，鼠标滑动到卡片上就会显示最近的操作历史
2. 修复个人中心邀请成员获得项目ID逻辑错误
3. 直接点击项目可以跳转到所有的表单页面
4. 在表单页面，取消了必须上传，只要遵从EXCEL的约定就可以正常操作
5. 更新了计算结果功能，该功能每天23:59:59分会自动去读取服务器：222.186.169.54:8000的E:/report-run/result-file文件夹，这个文件夹是固定且不会更改的，只要文件夹里面有文件，就会在每天凌晨自己读取计算，需要保证EXCEL文件名的格示为：项目名称_日期，如：超低密度支撑研制剂_2023-05-11
6. 鼠标右键添加了手动去计算的功能，只要文件夹下有该项目的结果，就可以自己生成计算结果
7. 鼠标添加了结束项目的功能
8. 更新了计算结果的历史记录，谁上传的或者自己计算的都会有显示. 还有一些不影响主要流程的细节

v1.3.1 更新内容
1. 新增原始数据上传功能
2. 根据20230728需求，调整上传功能为项目分类归档的结构
3. 根据20230728需求，调整菜单结构
4. 把原始数据录入中的基础表单手动移植到数据处理过程

v1.3.2 更新内容
新增
1. 文件检索从前端检索改成后端检索，可以搜索全局
2. 文件上传页面增加向上查找功能（区分项目），可以看到其他用户上传的目录，可以下载文件
3. 创建内容的同时可以勾选是否为项目
4. 页面引导功能
5. 操作视频
调整：
1. 解决项目管理分页和显示不正确的问题
2. 解决鼠标右键删除项目、菜单逻辑有冲突和错误的问题
