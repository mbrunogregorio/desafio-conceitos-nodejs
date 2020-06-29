const express = require("express");
const cors = require("cors");

const { uuid, isUuid } = require('uuidv4');

const app = express();


/**
 *  Middlewares 
 */

function logRequests(request, response, next) {
  const { method, url } = request;

  const logLabel = `[${method.toUpperCase()}] ${url}`;

  console.time(logLabel);

  next();

  console.timeEnd(logLabel);
}

function validateRepositoryId(request, response, next) {
  const { id } = request.params;

  if (!isUuid(id)) {
    return response.status(400).json({ error: 'Invalid repository Id' });
  }
  return next();
}


function checkRepositoryInArray(request, response, next) {
  const { id } = request.params;

  const repositoryIndex = repositories.findIndex(repository => repository.id === id);
  //console.log(repositoryIndex);
  if (repositoryIndex < 0) {
    return response.status(400).json({ error: 'Repository not found' });
  }

  request.repositoryIndex = repositoryIndex;
  return next();
}

app.use(express.json());
app.use(cors());

app.use(logRequests)
app.use('/repositories/:id', validateRepositoryId, checkRepositoryInArray);

const repositories = [];

app.get("/repositories", (request, response) => {
  const { title } = request.query;

  const results = title
    ? repositories.filter(repository => repository.title.includes(title))
    : repositories;

  return response.json(results);
});

app.post("/repositories", (request, response) => {
  const { title, url, techs } = request.body;
    const repository = { id: uuid(), 'title': title, 'url': url, 'techs': techs, 'likes': 0 };
    repositories.push(repository);

    return response.json(repository);
});

app.put("/repositories/:id", (request, response) => {
  const { id } = request.params;
  const { repositoryIndex } = request;

  //preservar a quantidade original de likes quando editar
  const { likes } = repositories[repositoryIndex];
  const { title, url, techs } = request.body;

  
  const repository = {
    id,
    title,
    url,
    techs,
    likes,
  };

  repositories[repositoryIndex] = repository;
  return response.json(repositories[repositoryIndex]);
});

app.delete("/repositories/:id", (request, response) => {
  const { repositoryIndex } = request;

  repositories.splice(repositoryIndex, 1);

  return response.status(204).send();
});

app.post("/repositories/:id/like", (request, response) => {
  const { repositoryIndex } = request;

  const {
    id,
    title,
    url,
    techs,
    likes
  } = repositories[repositoryIndex];

  const nLikes = likes+1;

  repositories[repositoryIndex] = {
    id,
    title,
    url,
    techs,
    likes: nLikes,
  };
  return response.json(repositories[repositoryIndex]);
});

module.exports = app;
