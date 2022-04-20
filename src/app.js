const express = require('express');
const db = require('./db');

const app = express();

app.use(express.json());

app.post('/things', (req, res) => {
  const { name } = req.body;

  if (!name) return res.status(422).send({ error: 'name is empty' });

  if (name.length > 100) {
    return res
      .status(422)
      .send({ error: 'name should contain less than 100 characters' });
  }

  db.promise()
    .query('INSERT INTO things (name) VALUES (?)', [name])
    .then(([{ insertId }]) => {
      res.status(201).send({ name, id: insertId });
    });
});

app.get('/things', (req, res) => {
  db.promise()
    .query('SELECT * FROM things')
    .then(([data]) => {
      res.send(data);
    });
});

app.get('/things/:id', (req, res) => {
  const { id } = req.params;
  db.promise()
    .query('SELECT * FROM things WHERE id = ?', [id])
    .then(([[data]]) => {
      if (data) res.send(data);
      else res.sendStatus(404);
    });
});

module.exports.app = app;
