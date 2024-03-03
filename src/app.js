import express from 'express';

import users from './routers/usersRouter.js';
import auth from './routers/authenticationRouter.js';
import recommendations from './routers/recommendationRouter.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use('/users', users);
app.use('/auth', auth);
app.use('/recommendations', recommendations);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

export default app;