# 工程图学 AI 答案生成器

这是一个用于工程图学课程的 Web MVP：学生上传题目图片，手动选择题型，系统生成 SVG 形式的工程图答案示例。

当前支持：

- 给出两个视图画第三个
- 标注尺寸
- 上传题目图片预览
- 生成 SVG 示例答案
- 下载 SVG
- 可部署为多人、多设备访问的网站

> 注意：第一版先跑通网站流程，生成的是规范 SVG 示例模板。复杂工程图的真实自动求解需要继续接入 OpenCV 图元识别、AI 视觉理解、人工校正和几何求解器。

## 本地运行

需要 Node.js 20+。

```bash
npm install
npm run dev
```

打开：

```text
http://localhost:3000
```

如果希望同一个局域网内手机/平板访问，请查看电脑局域网 IP，例如 `192.168.1.10`，然后在其他设备打开：

```text
http://192.168.1.10:3000
```

## Docker 运行

```bash
docker compose up --build
```

打开：

```text
http://localhost:3000
```

## 部署到 Vercel

1. 打开 Vercel。
2. 选择 Import Git Repository。
3. 选择这个仓库 `Bingmark/draw`。
4. Framework Preset 选择 Next.js。
5. 点击 Deploy。

部署完成后，任何人都可以通过 Vercel 提供的网址访问。

## 项目结构

```text
app/
  api/solve/route.ts   # 后端 API：生成 SVG 示例答案
  globals.css          # 页面样式
  layout.tsx           # Next.js 根布局
  page.tsx             # 主页面
Dockerfile
README.md
```

## 后续开发建议

### 第 1 阶段：完善网站交互

- 图片旋转
- 图片裁剪
- 框选单道题区域
- 保存历史记录
- 下载 PNG/PDF

### 第 2 阶段：图像识别

- OpenCV 线段检测
- 圆/圆弧检测
- 中心线识别
- 虚线识别
- 水印和手写痕迹过滤

### 第 3 阶段：几何求解

- 从两个视图恢复目标视图
- 处理长方体、台阶体、圆柱、通孔、半圆槽
- 输出可见线、虚线、中心线

### 第 4 阶段：尺寸标注

- 总长、总宽、总高
- 孔径 `Φ`
- 半径 `R`
- 中心距
- 台阶尺寸

## 为什么使用 SVG？

工程图学要求线条清晰和几何精确。SVG 是矢量格式，可以精确控制：

- 粗实线
- 细实线
- 虚线
- 中心线
- 尺寸线
- 文字标注

相比直接生成普通图片，SVG 更适合作为工程图答案格式。
