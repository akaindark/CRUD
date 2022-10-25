import express from 'express';
import { executeSQL } from './db';

const port = process.env.PORT || 3000;

const app = express();

app.use(express.json());

app.get('/users', async (_, res) => {
  const list = await executeSQL('SELECT * FROM "clients"');
  res.send(list);
});

app.get('/users/:id', async (req, res) => {
  const clientId = req.params.id;
  const [client] = await executeSQL('SELECT * FROM "clients" WHERE id = $1', [
    clientId,
  ]);
  res.send(client);
});

app.post('/users', async (req, res) => {
  const { user_name, first_name, last_name, age, email } = req.body;

  const [client] = await executeSQL(
    `INSERT INTO "clients"
      (user_name, first_name, last_name, age, email)
      VALUES
      ($1, $2, $3, $4, $5)
      RETURNING *;
      `,
    [user_name, first_name, last_name, age, email]
  );

  res.status(201).send({ id: client.id });
});

app.put('/users/:id', async (request, response) => {
  const clientId = request.params.id;
  const { user_name, first_name, last_name, age, email } = request.body;
  const [updatedClient] = await executeSQL(
    `
        UPDATE "clients"
        SET
          user_name = $1,
          first_name = $2,
          last_name = $3,
          age = $4,
          email = $5
        WHERE id = $6
        RETURNING *;
      `,
    [user_name, first_name, last_name, age, email, clientId]
  );
  response.send(updatedClient);
});

app.delete('/users/:id', async (request, response) => {
  const clientId = request.params.id;

  const [deletedClient] = await executeSQL(
    'DELETE FROM "clients" WHERE id = $1 RETURNING *;',
    [clientId]
  );

  response.send(deletedClient);
});

app.listen(port, () => console.log(`Server started on: ${port} port`));
