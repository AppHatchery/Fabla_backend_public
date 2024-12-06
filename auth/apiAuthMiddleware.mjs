import isValidApiKey from "./keymanager.mjs";

const apiAuthMiddleware = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
        return res.status(401).json({ error: 'API key missing' });
    }

    if (!isValidApiKey(apiKey)) {
        return res.status(401).json({ error: 'Invalid API key' });
    }

    next();
};

export default apiAuthMiddleware;
