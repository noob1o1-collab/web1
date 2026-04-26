const http = require('http');
const { URL } = require('url');
const { readMovies, saveMovies } = require('./movies');

const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathParts = url.pathname.split('/').filter(Boolean);

    const isMovies = pathParts[0] === 'movies';
    const id = pathParts[1] ? Number(pathParts[1]) : null;

    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'GET' && isMovies && !id) {
        const movies = readMovies();
        res.writeHead(200);
        return res.end(JSON.stringify(movies));
    }

    if (req.method === 'GET' && isMovies && id) {
        const movies = readMovies();
        const movie = movies.find(m => m.id === id);

        if (!movie) {
            res.writeHead(404);
            return res.end(JSON.stringify({ error: 'Not Found' }));
        }

        res.writeHead(200);
        return res.end(JSON.stringify(movie));
    }

    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Route Not Found' }));
});

server.listen(3000, () => {
    console.log('Server started on port 3000');
});