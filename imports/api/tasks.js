import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
 
export const Tasks = new Mongo.Collection('tasks');

Meteor.methods({
  'tasks.insert' (message) {
    check(message.text, String);
	check(message.location.coordinates, Array);
	check(message.location.accuracy, Number);
 
    // Make sure the user is logged in before inserting a task
    if (!Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }
 
    Tasks.insert({
      text: message.text,
	  location: message.location,
      createdAt: new Date(),
      owner: Meteor.userId(),
      username: Meteor.user().username,
    });
  },
  'tasks.remove' (taskId) {
    check(taskId, String);
 
    Tasks.remove(taskId);
  },
  'tasks.setChecked' (taskId, setChecked) {
    check(taskId, String);
    check(setChecked, Boolean);
	
	    const task = Tasks.findOne(taskId);
    if (task.private && task.owner !== Meteor.userId()) {
      // If the task is private, make sure only the owner can check it off
      throw new Meteor.Error('not-authorized');
    }
 
    Tasks.update(taskId, {
      $set: {
        checked: setChecked
      }
    });
  },
  'tasks.setPrivate' (taskId, setToPrivate) {
    check(taskId, String);
    check(setToPrivate, Boolean);
 
    const task = Tasks.findOne(taskId);
    if (task.private && task.owner !== Meteor.userId()) {
      // If the task is private, make sure only the owner can delete it
      throw new Meteor.Error('not-authorized');
    }
 
    // Make sure only the task owner can make a task private
    if (task.owner !== Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }
 
    Tasks.update(taskId, {
      $set: {
        private: setToPrivate
      }
    });
  },
});

if (Meteor.isServer) {
  // This code only runs on the server
  // Only publish tasks that are public or belong to the current user
  Meteor.publish('tasks', function tasksPublication(location1) {
	console.log(location1);
	if (location1 == null)
		return;
    return Tasks.find({
		geoNear: "tasks", 
		near: location1.coordinates,
		minDistance: 0,
		maxDistance: 300,
		//spherical: true, 
		query: {createdAt: {$gte: new Date(new Date().setDate(new Date().getDate()-1))}}});
  });
}