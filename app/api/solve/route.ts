import { NextRequest, NextResponse } from 'next/server';

type SolveRequest = {
  problemType?: 'third-view' | 'dimensioning';
  knownViews?: string[];
  targetView?: string;
  notes?: string;
};

function line(x1: number, y1: number, x2: number, y2: number, cls = 'visible') {
  return `<line class="${cls}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" />`;
}

function rect(x: number, y: number, w: number, h: number, cls = 'visible') {
  return `<rect class="${cls}" x="${x}" y="${y}" width="${w}" height="${h}" fill="none" />`;
}

function circle(cx: number, cy: number, r: number, cls = 'visible') {
  return `<circle class="${cls}" cx="${cx}" cy="${cy}" r="${r}" fill="none" />`;
}

function text(x: number, y: number, value: string, cls = 'label') {
  return `<text class="${cls}" x="${x}" y="${y}">${value}</text>`;
}

function arrowMarker() {
  return `
    <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#111827" />
    </marker>`;
}

function styles() {
  return `
    <style>
      svg { background: #fff; font-family: Arial, 'Noto Sans SC', sans-serif; }
      .sheet { fill: #fff; stroke: #d1d5db; stroke-width: 1; }
      .visible { stroke: #111827; stroke-width: 3; vector-effect: non-scaling-stroke; }
      .thin { stroke: #111827; stroke-width: 1.2; vector-effect: non-scaling-stroke; }
      .hidden { stroke: #111827; stroke-width: 1.5; stroke-dasharray: 8 6; vector-effect: non-scaling-stroke; }
      .center { stroke: #2563eb; stroke-width: 1.3; stroke-dasharray: 18 5 4 5; vector-effect: non-scaling-stroke; }
      .projection { stroke: #94a3b8; stroke-width: 1; stroke-dasharray: 5 5; vector-effect: non-scaling-stroke; }
      .dimension { stroke: #111827; stroke-width: 1.2; marker-start: url(#arrow); marker-end: url(#arrow); vector-effect: non-scaling-stroke; }
      .extension { stroke: #111827; stroke-width: 1; vector-effect: non-scaling-stroke; }
      .label { fill: #111827; font-size: 17px; font-weight: 700; }
      .small { fill: #475569; font-size: 13px; }
      .title { fill: #111827; font-size: 22px; font-weight: 800; }
    </style>`;
}

function createThirdViewSvg(targetView = '左视图') {
  const parts = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="980" height="640" viewBox="0 0 980 640" role="img" aria-label="两个视图补第三视图示例答案">`,
    `<defs>${arrowMarker()}</defs>`,
    styles(),
    `<rect class="sheet" x="16" y="16" width="948" height="608" rx="12" />`,
    text(40, 58, '示例答案：已知两个视图，补第三视图', 'title'),
    text(40, 86, '当前版本先生成可编辑 SVG 示例；后续可接入 OpenCV/AI 识图与精确几何求解。', 'small'),

    text(105, 130, '主视图', 'label'),
    rect(70, 160, 230, 150),
    rect(125, 105, 88, 55),
    rect(195, 205, 70, 105, 'thin'),
    line(185, 105, 185, 310, 'center'),
    line(70, 235, 300, 235, 'center'),
    line(122, 160, 82, 310),
    line(248, 160, 290, 310),
    line(136, 188, 250, 188, 'hidden'),
    line(136, 278, 250, 278, 'hidden'),

    text(104, 388, '俯视图', 'label'),
    circle(185, 480, 95),
    circle(185, 480, 42),
    rect(110, 405, 150, 150, 'thin'),
    line(185, 360, 185, 600, 'center'),
    line(65, 480, 305, 480, 'center'),
    line(108, 438, 262, 438, 'hidden'),
    line(108, 522, 262, 522, 'hidden'),

    line(330, 160, 560, 160, 'projection'),
    line(330, 310, 560, 310, 'projection'),
    line(330, 405, 560, 405, 'projection'),
    line(330, 555, 560, 555, 'projection'),

    text(646, 130, targetView || '左视图', 'label'),
    rect(610, 160, 210, 150),
    rect(680, 105, 82, 55),
    line(610, 235, 820, 235, 'center'),
    line(715, 105, 715, 310, 'center'),
    line(610, 310, 648, 230),
    line(820, 310, 778, 230),
    rect(666, 190, 96, 90, 'thin'),
    line(650, 188, 780, 188, 'hidden'),
    line(650, 278, 780, 278, 'hidden'),
    circle(715, 235, 38, 'hidden'),

    text(604, 370, '生成说明', 'label'),
    text(604, 404, '1. 根据两个已知视图提取轮廓高度、宽度与深度。', 'small'),
    text(604, 430, '2. 将对应投影关系映射到目标视图。', 'small'),
    text(604, 456, '3. 可见轮廓用粗实线，孔/遮挡边用虚线，轴线用中心线。', 'small'),
    text(604, 482, '4. 真实识图模块完成后会替换此示例模板。', 'small'),
    `</svg>`
  ];

  return parts.join('');
}

function createDimensioningSvg() {
  const parts = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="980" height="640" viewBox="0 0 980 640" role="img" aria-label="尺寸标注示例答案">`,
    `<defs>${arrowMarker()}</defs>`,
    styles(),
    `<rect class="sheet" x="16" y="16" width="948" height="608" rx="12" />`,
    text(40, 58, '示例答案：尺寸标注', 'title'),
    text(40, 86, '标注规则示例：总尺寸、孔径、中心距、圆角半径、台阶尺寸。', 'small'),

    rect(250, 210, 460, 170),
    rect(385, 145, 190, 65),
    circle(480, 295, 50),
    circle(480, 295, 23),
    line(250, 295, 710, 295, 'center'),
    line(480, 120, 480, 405, 'center'),
    rect(250, 250, 80, 130, 'thin'),
    rect(630, 250, 80, 130, 'thin'),

    line(250, 430, 710, 430, 'dimension'),
    line(250, 392, 250, 452, 'extension'),
    line(710, 392, 710, 452, 'extension'),
    text(455, 458, '100', 'label'),

    line(200, 210, 200, 380, 'dimension'),
    line(222, 210, 180, 210, 'extension'),
    line(222, 380, 180, 380, 'extension'),
    text(150, 302, '40', 'label'),

    line(385, 105, 575, 105, 'dimension'),
    line(385, 132, 385, 90, 'extension'),
    line(575, 132, 575, 90, 'extension'),
    text(456, 94, '50', 'label'),

    line(405, 295, 555, 295, 'dimension'),
    text(498, 284, 'Φ24', 'label'),
    line(480, 245, 480, 345, 'center'),

    line(330, 480, 630, 480, 'dimension'),
    line(330, 392, 330, 502, 'extension'),
    line(630, 392, 630, 502, 'extension'),
    text(455, 508, '中心距 70', 'label'),

    line(710, 210, 760, 160, 'thin'),
    text(766, 160, 'R10', 'label'),

    text(92, 545, '注意：第一版生成的是规范 SVG 示例；上传真实题后，可先用它完成网站流程测试。', 'small'),
    text(92, 572, '下一步可加入图片裁剪、线段/圆检测、人工校正和真实尺寸录入。', 'small'),
    `</svg>`
  ];

  return parts.join('');
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as SolveRequest;
  const problemType = body.problemType ?? 'third-view';
  const svg = problemType === 'dimensioning' ? createDimensioningSvg() : createThirdViewSvg(body.targetView);

  return NextResponse.json({
    ok: true,
    svg,
    steps:
      problemType === 'dimensioning'
        ? [
            '识别或确认主要轮廓、圆孔、圆角和对称中心线。',
            '优先标注总体尺寸，再标注定位尺寸，最后标注局部结构尺寸。',
            '圆孔使用 Φ，圆角使用 R，尺寸线与轮廓线保持间距。'
          ]
        : [
            '确认两个已知视图以及需要补画的目标视图。',
            '从已知视图提取长、宽、高方向的投影对应关系。',
            '生成目标视图中的可见线、虚线和中心线。',
            '输出可缩放的 SVG 答案，便于后续下载或修改。'
          ]
  });
}
