const mongoose = require('mongoose')
const express = require('express');
const bodyParser = require('body-parser')
const app = express();

app.use(bodyParser.json());

const taskSchema = new mongoose.Schema({
  title: {
     type: String,
  },
  content: {
    type: String,
  },
  status: {
    type: String,
  },
  createdAt: {
    type: Date,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});
const userSchema = new mongoose.Schema({
  name: {
    type: String
  },
  tasks: [{
    type: mongoose.Schema.Types.ObjectId, ref: "Task"
  }]
});

const Task = mongoose.model('Task', taskSchema);
const User = mongoose.model('User', userSchema);

app.post('/tasks/create-test-data', async (request, response) => {
  let tasks = await Task.create([
    { title: 'Tache1', content: 'Faire quelque chose pour accomplir une tâche', status: 'en cours', createdAt: new Date(2023, 0, 5)},
    { title: 'Tache2', content: 'Faire quelque chose pour accomplir une tâche', status: 'terminé', createdAt: new Date(2022, 3, 10)},
    { title: 'Tache3', content: 'Faire quelque chose pour accomplir une tâche', status: 'en cours', createdAt: new Date(2021, 5, 15)},
    { title: 'Tache4', content: 'Faire quelque chose pour accomplir une tâche', status: 'terminé', createdAt: new Date(2020, 7, 20)},
    { title: 'Tache5', content: 'Faire quelque chose pour accomplir une tâche', status: 'en cours', createdAt: new Date(2019, 9, 25)},
    { title: 'Tache6', content: 'Faire quelque chose pour accomplir une tâche', status: 'terminé', createdAt: new Date(2022, 11, 6)},
    { title: 'Tache7', content: 'Faire quelque chose pour accomplir une tâche', status: 'en cours', createdAt: new Date(2023, 2, 12)},
    { title: 'Tache8', content: 'Faire quelque chose pour accomplir une tâche', status: 'terminé', createdAt: new Date(2021, 4, 18)},
]);
  response.send(tasks);
})

app.post('/users', async (request, response) => {
  let user = await User.create(request.body)
  response.send(user)
})
app.get('/users', async (request, response) => {
  let users = await User.find().populate("tasks");
  response.send(users);
})
app.get('/users/:id', async (request, response) => {
  let user = await User.findById(request.params.id).populate("tasks").exec();
  response.send(user);
})
app.put('/users/:id', async (request, response) => {
  let user = await User.findByIdAndUpdate(request.params.id, request.body, {new: true})
  response.send(user)
})
app.delete('/users/:id', async (request, response) => {
  let user = await User.findByIdAndDelete(request.params.id)
  response.send(user)
})

app.get('/tasks', async (request, response) => {
    let tasks
    let { date, ...filteredQuery} = request.query
    if (filteredQuery) {
      if (date) {
        tasks = await Task.find({...filteredQuery, createdAt: { $gt: new Date(request.query.date) }});
      } else{
        tasks = await Task.find(filteredQuery);
      }
    } else if(date){
        tasks = await Task.find({ $gt: new Date(request.query.date) })
    } else{
        tasks = await Task.find()
    }
  response.send(tasks);
})
app.get('/tasks/:id', async (request, response) => {
  let task = await Task.findById(request.params.id)
  response.send(task);
})

app.post('/tasks', async (request, response) => {
  let newTask = {...request.body, createdAt: new Date}
  let task = await Task.create(newTask);
  if (request.body.user) {
    let userId = request.body.user
    let user = await User.findById(userId)
    user.tasks.push(task._id)
    await user.save()
  }

  response.send(task);
})

app.delete('/tasks/:id', async (request, response) => {
  let task = await Task.findByIdAndDelete(request.params.id)
  response.send(task)
})

app.put('/tasks/:id', async (request, response) => {
  let task = await Task.findByIdAndUpdate(request.params.id, request.body, {new: true})
  if (request.body.user) {
    let userId = request.body.user
    let user = await User.findById(userId)
    user.tasks.push(task._id)
    await user.save()
  }

  response.send(task)
})


async function start() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/mon-projet');
    console.log('✅ Connected to MongoDB')

    app.listen(8000, () => console.log('✅ Server started on port 8000'))

  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

start()