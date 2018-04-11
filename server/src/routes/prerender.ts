import * as express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
    res.sendFile('index.html', { root: 'client/' });
})

router.get('/about', (req, res) => {
    res.sendFile('about.html', { root: 'client/' });
})

export default router;