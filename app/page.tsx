'use client';

import { ChangeEvent, useMemo, useState } from 'react';

type ProblemType = 'third-view' | 'dimensioning';

type SolveResponse = {
  ok: boolean;
  svg: string;
  steps: string[];
};

const viewOptions = ['主视图', '俯视图', '左视图'];

export default function Home() {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [problemType, setProblemType] = useState<ProblemType>('third-view');
  const [knownViewA, setKnownViewA] = useState('主视图');
  const [knownViewB, setKnownViewB] = useState('俯视图');
  const [targetView, setTargetView] = useState('左视图');
  const [notes, setNotes] = useState('');
  const [result, setResult] = useState<SolveResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const knownViews = useMemo(() => [knownViewA, knownViewB], [knownViewA, knownViewB]);

  function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('请上传图片文件。');
      return;
    }
    setFileName(file.name);
    setResult(null);
    setError('');
    const reader = new FileReader();
    reader.onload = () => setImageUrl(String(reader.result));
    reader.readAsDataURL(file);
  }

  async function solve() {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemType, knownViews, targetView, notes })
      });
      if (!response.ok) throw new Error('生成失败，请稍后重试。');
      const data = (await response.json()) as SolveResponse;
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败，请稍后重试。');
    } finally {
      setLoading(false);
    }
  }

  function downloadSvg() {
    if (!result?.svg) return;
    const blob = new Blob([result.svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = problemType === 'dimensioning' ? 'dimension-answer.svg' : 'third-view-answer.svg';
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="page">
      <section className="hero">
        <div className="hero-card">
          <div className="badge-row">
            <span className="badge">工程图学</span>
            <span className="badge">SVG 答案</span>
            <span className="badge">手机/电脑可访问</span>
          </div>
          <h1>工程图学 AI 答案生成器</h1>
          <p>
            上传题目图片，手动选择“两个视图补第三视图”或“标注尺寸”。第一版先跑通网站流程并生成规范 SVG 示例，后续可以接入 OpenCV、视觉模型和几何求解器来提高真实题目准确率。
          </p>
          <div className="hero-actions">
            <a className="primary" href="#workspace">开始生成</a>
            <button className="secondary" onClick={solve} disabled={loading}>
              {loading ? '生成中…' : '生成示例答案'}
            </button>
          </div>
        </div>

        <aside className="hero-side panel">
          <h2>当前 MVP 功能</h2>
          <div className="stats">
            <div className="stat">
              <strong>2</strong>
              <span>支持题型：补第三视图、尺寸标注</span>
            </div>
            <div className="stat">
              <strong>SVG</strong>
              <span>输出矢量工程图，可下载、可缩放</span>
            </div>
            <div className="stat">
              <strong>Web</strong>
              <span>部署后不同设备打开网址即可使用</span>
            </div>
          </div>
        </aside>
      </section>

      <section className="workspace" id="workspace">
        <aside className="panel">
          <h2>题目设置</h2>
          <div className="form-grid">
            <label className="upload-box">
              <strong>上传题目图片</strong>
              <span>{fileName || '支持手机拍照图、截图、扫描图'}</span>
              <input type="file" accept="image/*" onChange={handleFile} />
            </label>

            <div className="field">
              <label htmlFor="problemType">题型</label>
              <select id="problemType" value={problemType} onChange={(e) => setProblemType(e.target.value as ProblemType)}>
                <option value="third-view">给出两个视图画第三个</option>
                <option value="dimensioning">标注尺寸</option>
              </select>
            </div>

            {problemType === 'third-view' && (
              <>
                <div className="field">
                  <label htmlFor="knownA">已知视图 1</label>
                  <select id="knownA" value={knownViewA} onChange={(e) => setKnownViewA(e.target.value)}>
                    {viewOptions.map((view) => (
                      <option key={view}>{view}</option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label htmlFor="knownB">已知视图 2</label>
                  <select id="knownB" value={knownViewB} onChange={(e) => setKnownViewB(e.target.value)}>
                    {viewOptions.map((view) => (
                      <option key={view}>{view}</option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label htmlFor="targetView">需要生成</label>
                  <select id="targetView" value={targetView} onChange={(e) => setTargetView(e.target.value)}>
                    {viewOptions.map((view) => (
                      <option key={view}>{view}</option>
                    ))}
                  </select>
                  <small>建议选择和两个已知视图不同的目标视图。</small>
                </div>
              </>
            )}

            <div className="field">
              <label htmlFor="notes">补充要求 / 尺寸信息</label>
              <textarea
                id="notes"
                placeholder="例如：题目要求补左视图；孔径为 Φ20；需要标注总长、总宽、中心距等。"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <button className="primary" onClick={solve} disabled={loading}>
              {loading ? '正在生成…' : '生成答案 SVG'}
            </button>
            {result?.svg && (
              <button className="ghost" onClick={downloadSvg}>
                下载 SVG
              </button>
            )}
            {error && <div className="notice">{error}</div>}
          </div>
        </aside>

        <section className="panel">
          <div className="result-grid">
            <div>
              <h2>题目图片</h2>
              <div className="preview">
                {imageUrl ? <img src={imageUrl} alt="上传的工程图学题目" /> : <div className="empty-state">请先上传题目图片。后续版本会加入裁剪、旋转矫正和图元识别。</div>}
              </div>
            </div>

            <div>
              <h2>解题步骤</h2>
              <div className="steps">
                {(result?.steps ?? ['上传图片并选择题型。', '确认已知视图和目标视图。', '点击生成，查看 SVG 答案。']).map((step, index) => (
                  <div className="step" key={step}>
                    <strong>步骤 {index + 1}</strong>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
              <div className="notice">
                工程图学答案要求精确，第一版不会假装完全自动识别所有复杂题。建议逐步加入人工校正、真实尺寸输入和几何求解模块。
              </div>
            </div>
          </div>

          <h2 style={{ marginTop: 22 }}>生成结果</h2>
          <div className="svg-box">
            {result?.svg ? <div dangerouslySetInnerHTML={{ __html: result.svg }} /> : <div className="empty-state">点击“生成答案 SVG”后，这里会显示标准工程图示例答案。</div>}
          </div>
        </section>
      </section>

      <p className="footer-note">下一步建议：部署到 Vercel，让其他同学通过网址访问；再逐步开发真实图片识别和几何求解。</p>
    </main>
  );
}
