const Sequelize = require('sequelize');
const sequelize = new Sequelize('postgres://postgres:secret@localhost:5432/postgres');
const express = require('express')
const app = express()
const port = process.env.PORT || 3000
const bodyParser = require('body-parser')
const jsonParser = bodyParser.json()
let limit = 5;

app.use(jsonParser)

const User = sequelize.define('user', {
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    }
});

// Create a new user account

app.post('/users', (req, res, next) => {
    limit--
    if (limit <= 0) {
        return res.status(429).end()
    }

    User.create(req.body)
        .then(user => res.json(user))
        .catch(err => next(err))
})

app.post('/users/:userId/tasks', (req, res, next) => {
    Task.create(req.body)
        .then(task => res.json(task))
        .catch(err => next(err))
})

// Get all user's tasks
app.get('/users/:userId/tasks', (req, res, next) => {
    Task.findAll(req.body)
        .then(task => res.json(task))
        .catch(err => next(err))
})

// Update an existing task
app.put('/users/:userId/tasks/:taskId', (req, res, next) => {
    Task.findByPk(req.params.taskId)
        .then(task => {
            if (task) {
                return task.update(req.body)
                    .then(task => res.json(task))
            }
            return res.status(404).end()
        })
        .catch(next)
})

// Delete a user's task
app.delete('/users/:userId/tasks/:taskId', (req, res, next) => {
    Task.destroy({
        where: {
            id: req.params.taskId,
            userId: req.params.userId
        }
    })
        .then(numDeleted => {
            if (numDeleted) {
                return res.status(204).end()
            }
            return res.status(404).end()
        })
        .catch(next)
})

// Delete all user's tasks
app.delete('/users/:userId/tasks', (req, res, next) => {
    Task.destroy({
        where: {
            userId: req.params.userId,
        }
    })
        .then(() => {
            return res.status(204).end()
        })
        .catch(next)
})

app.get('/users/:userId', (req, res, next) => {
    User.findByPk(req.params.userId)
        .then(user => {
            if (!user) {
                res.status(404).end()
            } else {
                res.json(user)
            }
        })
        .catch(next)
})

app.put('/users/:userId', (req, res, next) => {
    User.findByPk(req.params.userId)
        .then(user => {
            if (user) {
                return user.update(req.body)
                    .then(user => res.json(user))
            }
            return res.status(404).end()
        })
        .catch(next)
})

// Get a single user task
app.get('/users/:userId/tasks/:taskId', (req, res, next) => {
    Task.findOne({
        where: {
            id: req.params.taskId,
            userId: req.params.userId
        }
    })
        .then(task => {
            if (task) {
                return res.json(task)
            }
            return res.status(404).end()
        })
        .catch(next)
})

const Task = sequelize.define('task', {
    userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    description: {
        type: Sequelize.STRING
    },
    completed: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    }
})

sequelize.sync()
    .then(() => console.log('Tables created successfully'))
    .catch(err => {
        console.error('Unable to create tables, shutting down...', err);
        process.exit(1);
    })

app.post('/echo', (req, res) => {
    res.json(req.body)
})

app.listen(port, () => console.log("listening on port " + port))