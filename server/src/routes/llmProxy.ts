import type { Router } from 'express';
import { Router as createRouter } from 'express';
import type { DefectRepo } from '../repo/defectRepo.js';

const writeChunk = (res: { write: (chunk: string) => void }, chunk: string) => {
  res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
};

const mockSuggestion = (component: string, defectType: string, confidence: number) => [
  `部件 ${component} 存在 ${defectType} 疑似风险，`,
  `算法置信度 ${confidence.toFixed(1)}%，建议先核对红框区域与相邻支撑件。`,
  '若复核确认，应纳入缺陷台账并优先安排现场复测。',
];

export const createLLMRouter = (repo: DefectRepo): Router => {
  const router = createRouter();

  router.get('/llm/suggest', async (req, res) => {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    });

    const defect = await repo.getDefect(String(req.query.defectId ?? ''));
    if (!defect) {
      writeChunk(res, '未找到缺陷记录，请重新选择候选缺陷。');
      res.write('event: done\ndata: {}\n\n');
      res.end();
      return;
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      for (const chunk of mockSuggestion(defect.component, defect.defectType, defect.confidence)) {
        writeChunk(res, chunk);
      }
      res.write('event: done\ndata: {}\n\n');
      res.end();
      return;
    }

    try {
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: '你是铁路接触网缺陷复核助手，给出 100 字以内的复核建议。',
            },
            {
              role: 'user',
              content: `部件：${defect.component}，缺陷：${defect.defectType}，置信度：${defect.confidence}%，给出复核建议。`,
            },
          ],
          stream: true,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`DeepSeek request failed: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          break;
        }
        res.write(decoder.decode(value, { stream: true }));
      }
      res.write('event: done\ndata: {}\n\n');
      res.end();
    } catch {
      for (const chunk of mockSuggestion(defect.component, defect.defectType, defect.confidence)) {
        writeChunk(res, chunk);
      }
      res.write('event: done\ndata: {}\n\n');
      res.end();
    }
  });

  return router;
};
