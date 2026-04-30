import type { Router } from 'express';
import { Router as createRouter } from 'express';
import type { DefectRepo } from '../repo/defectRepo.js';
import { generateMockDefect } from '../services/algorithmService.js';

export const createStreamRouter = (repo: DefectRepo): Router => {
  const router = createRouter();

  router.get('/stream', (req, res) => {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    });

    const sendDefect = async () => {
      const defect = await repo.addDefect(generateMockDefect());
      res.write(`event: defect\n`);
      res.write(`data: ${JSON.stringify(defect)}\n\n`);
    };

    res.write(`event: ready\n`);
    res.write(`data: {"message":"检测车流已连接"}\n\n`);
    const timer = setInterval(() => {
      void sendDefect();
    }, 6000);

    req.on('close', () => {
      clearInterval(timer);
      res.end();
    });
  });

  return router;
};
