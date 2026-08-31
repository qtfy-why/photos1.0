# Project-Brief.md
> 项目：个人摄影集网站
> 技术栈：GitHub + Vercel + Cloudinary + Vercel-Postgres + 阿里云域名
> 当前进度：源码全部完成，未部署，下一步：上传GitHub、Vercel上线

## 一、功能
1. 游客瀑布流浏览相册，点击图片全屏预览
2. 管理员账号密码登录，localStorage保存登录态
3. 图片上传-->Cloudinary，元数据存入Postgres
4. 删除：同时删云端图片+数据库记录
5. 阿里云域名绑定Vercel，海外托管无需ICP备案

## 二、目录结构
photo-gallery/
├── api/
├── public/
├── package.json
└── vercel.json

## 三、数据库初始化SQL
CREATE TABLE photos(
    id SERIAL PRIMARY KEY,
    title TEXT,
    url TEXT,
    time TEXT
);

## 四、Vercel环境变量
ADMIN_USER=admin
ADMIN_PASS=123456
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx

POSTGRES_URL自动注入，无需手动添加

## 五、GitHub上传步骤
1.新建仓库photo-gallery，Public，不勾选README
2.拖拽上传api、public、package.json、vercel.json
3.Commit changes提交

## 六、部署检查清单
- [ ]注册账号 GitHub/Vercel/Cloudinary
- [ ]复制Cloudinary密钥
- [ ]本地建好全部源码文件
- [ ]上传GitHub
- [ ]Vercel导入仓库，新建Postgres数据库
- [ ]填入环境变量
- [ ]执行建表SQL
- [ ]部署测试
- [ ]阿里云域名、配置CNAME解析

## 七、避坑清单
1.密钥禁止上传GitHub
2.文件夹名称全部小写
3.单张图片上限10MB
4.Cloudinary免费5GB存储空间
5.Vercel海外托管，域名不用备案
