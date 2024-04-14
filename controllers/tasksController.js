const User = require('../models/User');
const Task = require('../models/Task');
const asyncHandler = require('express-async-handler');

// @desc Get all tasks
// @route GET /tasks
// @access Private
const getAllTasks = asyncHandler(async (req, res) => {
    
    const tasks = await Task.find().lean();
    
    if (!tasks?.length) {
        return res.status(400).json({ message: 'No tasks found'});
    }

    // Add a username to each note before sending response
    const tasksWithUser = await Promise.all(tasks.map(async (task) => {
        const user = await User.findById(task.user).lean().exec();
        return { ...task, username: user.username }
    }))

    res.json(tasksWithUser); 
});



// @desc Create new user
// @route POST /users
// @access Private
const createNewTask = asyncHandler(async (req, res) => {
    const { user, title, text } = req.body;

    // Confirming data
    if (!user || !title || !text) {
        return res.status(400).json({ message: 'All fields are required'});
    }
 
    // Check for duplicate task --can remove
    const duplicate = await Task.findOne({ title }).collation({ locale: 'en', strength: 2 }).lean().exec();

    if (duplicate) {
        return res.status(409).json({ message: 'Duplicate task title'});
    }

    const task = await Task.create({ user, title, text });

    if (task) { // created
        res.status(201).json({ message: `New task created`});
    } else {
        res.status(400).json({ message: 'Invalid task data recieved'});
    }

});


// @desc Update a task
// @route PATCH /tasks
// @access Private
const updateTask = asyncHandler(async (req, res) => {
    const { id, user, title, text, completed } = req.body;

    // Confirm data
    if (!id || !user || !title || !text || typeof completed !== 'boolean') {
        return res.status(400).json({ message: 'All fields are required'});
    }

    const task = await Task.findById(id).exec();

    if (!task) {
        return res.status(400).json({ message: 'Task not found' });
    }

    // Check for duplicate
    const duplicate = await Task.findOne({ title }).collation({ locale: 'en', strength: 2 }).lean().exec();
    // Allow updates to the original task
    if ( duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({ message: 'Duplicate task title'});
    }

    task.user = user;
    task.title = title;
    task.text = text; 
    task.completed = completed;

    const updatedTask = await task.save();

    res.json({ message: `${updatedTask.title} updated` });

});


// @desc Delete a user
// @route DELETE /users
// @access Private
const deleteTask = asyncHandler(async (req, res) => {

    const { id } = req.body

    if ( !id ) {
        return res.status(400).json({ message: 'Task ID Required'});
    }

    const task = await Task.findById(id).exec();

    if (!task) {
        return res.status(400).json({ message: 'Task not found' });
    }

    const result = await task.deleteOne();
    const reply = `Task ${result.title} with ID ${result._id} deleted`;

    res.json(reply);
});

module.exports = {
    getAllTasks,
    createNewTask,
    updateTask,
    deleteTask
};
