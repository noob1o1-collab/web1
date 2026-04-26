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

    if (req.method === 'POST' && isMovies) {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            try {
                const movies = readMovies();
                const data = JSON.parse(body);

                const newMovie = {
                    id: movies.length ? Math.max(...movies.map(m => m.id)) + 1 : 1,
                    ...data
                };

                movies.push(newMovie);
                saveMovies(movies);

                res.writeHead(201);
                return res.end(JSON.stringify(newMovie));
            } catch {
                res.writeHead(400);
                return res.end(JSON.stringify({ error: 'Invalid JSON' }));
            }
        });

        return;
    }

    if (req.method === 'PUT' && isMovies && id) {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            try {
                const movies = readMovies();
                const data = JSON.parse(body);

                const index = movies.findIndex(m => m.id === id);

                if (index === -1) {
                    res.writeHead(404);
                    return res.end(JSON.stringify({ error: 'Not Found' }));
                }

                movies[index] = { ...movies[index], ...data, id };
                saveMovies(movies);

                res.writeHead(200);
                return res.end(JSON.stringify(movies[index]));
            } catch {
                res.writeHead(400);
                return res.end(JSON.stringify({ error: 'Invalid JSON' }));
            }
        });

        return;
    }

    if (req.method === 'DELETE' && isMovies && id) {
        const movies = readMovies();
        const index = movies.findIndex(m => m.id === id);

        if (index === -1) {
            res.writeHead(404);
            return res.end(JSON.stringify({ error: 'Not Found' }));
        }

        const deleted = movies.splice(index, 1)[0];
        saveMovies(movies);

        res.writeHead(200);
        return res.end(JSON.stringify(deleted));
    }

    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Route Not Found' }));
});

server.listen(3000, () => {
    console.log('Server started on port 3000');
});