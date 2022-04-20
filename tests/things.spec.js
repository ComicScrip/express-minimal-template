const request = require('supertest');
const { app } = require('../src/app');
const db = require('../src/db');

describe('things', () => {
  let res;
  beforeEach(() => {
    return db.promise().query('TRUNCATE table things');
  });
  describe('GET /things', () => {
    beforeEach(async () => {
      await db
        .promise()
        .query("INSERT INTO things (name) VALUES ('laptop'), ('socks')");
      res = await request(app).get('/things');
    });

    it('should return a 200 status code', async () => {
      expect(res.statusCode).toBe(200);
    });

    it('should return all things in DB', async () => {
      expect(res.body.length).toBe(2);
    });

    it('should return objects with correct properties', async () => {
      res.body.forEach((item) => {
        expect(item.id).toBeDefined();
        expect(item.name).toBeDefined();
      });
    });
  });

  describe('GET /things/:id', () => {
    describe('with an existing thing in DB', () => {
      let thing;
      beforeEach(async () => {
        thing = { name: 'laptop' };

        const [{ insertId }] = await db
          .promise()
          .query(`INSERT INTO things (name) VALUES ('${thing.name}')`);

        thing.id = insertId;

        res = await request(app).get(`/things/${thing.id}`);
      });

      it('should return a 200 status code', async () => {
        expect(res.statusCode).toBe(200);
      });

      it('should return the thing with correct properties', async () => {
        expect(res.body.id).toBe(thing.id);
        expect(res.body.name).toBe(thing.name);
      });
    });

    describe('without an existing thing in DB', () => {
      beforeEach(async () => {
        res = await request(app).get('/things/99999');
      });

      it('should return a 404 status code', async () => {
        expect(res.statusCode).toBe(404);
      });
    });
  });

  describe('POST /things', () => {
    describe('with valid attributes', () => {
      const payload = { name: 'computer' };

      beforeEach(async () => {
        res = await request(app).post('/things').send(payload);
      });

      it('should return a 201 status code', async () => {
        expect(res.statusCode).toBe(201);
      });

      it('should return the created thing', async () => {
        expect(res.body.id).toBeDefined();
        expect(res.body.name).toBe(payload.name);
      });
    });

    describe('with invalid attributes', () => {
      describe('empty name', () => {
        const payload = { name: '' };
        beforeEach(async () => {
          res = await request(app).post('/things').send(payload);
        });

        it('should return a 422 status code', async () => {
          expect(res.statusCode).toBe(422);
        });

        it('should return an error message', async () => {
          expect(res.body.error).toContain('empty');
        });
      });

      describe('name too big', () => {
        const payload = {
          name: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        };
        beforeEach(async () => {
          res = await request(app).post('/things').send(payload);
        });

        it('should return a 422 status code', async () => {
          expect(res.statusCode).toBe(422);
        });

        it('should return an error message', async () => {
          expect(res.body.error).toContain('less than 100');
        });
      });
    });
  });
});
