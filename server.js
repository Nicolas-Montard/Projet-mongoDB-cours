const mongoose = require('mongoose')
const express = require('express');
const bodyParser = require('body-parser')
const app = express();

app.use(bodyParser.json());

const taskSchema = new mongoose.Schema({
  content: {
    type: String,
  },
  status: {
    type: String,
  },
  createdAt: {
    type: Date,
  }
});
const Task = mongoose.model('Task', taskSchema);

app.get('/', async (request, response) => {
    let tasks
    if (request.body.status) {
        tasks = await Task.find({"status": request.body.status});
    } else{
        tasks = await Task.find()
    }
  response.send(tasks);
})
app.get('/tasks/:id', async (request, response) => {
  let task = await Task.findById(request.params.id)
  response.send(task);
})

app.post('/tasks/create', async (request, response) => {

  let newTask = {...request.body, createdAt: new Date}
  response.send(newTask)
  let task = await Task.create(newTask);

  response.send(task);
})

app.delete('/tasks/delete/:id', async (request, response) => {
  let task = await Task.findByIdAndDelete(request.params.id)
  response.send(task)
})

app.put('/tasks/update/:id', async (request, response) => {
  let task = await Task.findByIdAndUpdate(request.params.id, { "content": request.body.newTask})

  response.send(task)
})


async function start() {
  try {
    await mongoose.connect('mongodb://localhost:27017/mon-projet')
    console.log('✅ Connected to MongoDB')

    app.listen(8000, () => console.log('✅ Server started on port 8000'))
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

start()