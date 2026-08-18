const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres:l0g!cbOmb@localhost:5432/postgres' });
client.connect().then(() => {
  client.query('SELECT id, email, "email_verified", "created_at" FROM "user"').then(res => {
    console.log(res.rows);
    client.end();
  });
}).catch(console.error);
