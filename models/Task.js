const mongoose = require('mongoose');
const { use } = require('../routes/root');
const AutoIncrement = require('mongoose-sequence')(mongoose);


const taskSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        },
        title: {
            type: String,
            required: true
        },
        text: {
            type: String,
            required: true
        },
        completed: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

taskSchema.plugin(AutoIncrement, {
    inc_field: 'task',
    id: 'taskNums',
    start_seq: 1
});

module.exports = mongoose.model('Task', taskSchema);