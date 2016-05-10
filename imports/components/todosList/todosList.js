import angular from 'angular';
import angularMeteor from 'angular-meteor';
import template from './todosList.html';
import { Meteor } from 'meteor/meteor'
import { Tasks } from '../../api/tasks.js';
 
class TodosListCtrl {
  constructor($scope, $reactive) {
	this.gpsOptions = {
		enableHighAccuracy: true,
		timeout: 10000,
		maximumAge: 10000
	};
	function updateLocation(position)
	{
		console.log('updating location');
		var curLocation = { type:"Point", 
							coordinates: [position.coords.longitude, position.coords.latitude], 
							accuracy: position.coords.accuracy};
		this.location1 = curLocation;
	};
	function failure(err)
	{
		if (err.code === 1)
		{
			alert("Turn on your location services");
		}
		alert("couldn't look up position: " + err.code);
	};
	navigator.geolocation.getCurrentPosition(updateLocation,failure,this.gpsOptions);
    $scope.viewModel(this);
	$reactive(this).attach($scope);
	this.location1 = null;
    this.subscribe('tasks', () => [this.getReactively('location1')]);
    this.hideCompleted = false;
	this.ctrlTask = {};
    this.helpers({
      tasks() {
        const selector = {};
 
        // If hide completed is checked, filter tasks
        if (this.getReactively('hideCompleted')) {
          selector.checked = {
            $ne: true
          };
        }
 
        // Show newest tasks at the top
        return Tasks.find(selector, {
          sort: {
            createdAt: -1
          }
        });
      },
      incompleteCount() {
        return Tasks.find({
          checked: {
            $ne: true
          }
        }).count();
      },
      currentUser() {
        return Meteor.user();
	  }
	})
  }
  
  addTask(newTask) {
    // Insert a task into the collection
	var success  = function(position)
	{
		var curLocation = { type:"Point", 
							coordinates: [position.coords.longitude, position.coords.latitude], 
							accuracy: position.coords.accuracy};
		this.location1 = curLocation;
		ctrlTask.location = curLocation;
		Meteor.call('tasks.insert', ctrlTask);
		ctrlTask = {};
	};
	var failure = function(err)
	{
		alert("couldn't look up position: " + err.code);
	}
	ctrlTask = {"text":newTask};
	navigator.geolocation.getCurrentPosition(success,failure,this.gpsOptions);
	 
    // Clear form
    
  }
 
  setChecked(task) {
    // Set the checked property to the opposite of its current value
    Meteor.call('tasks.setChecked', task._id, !task.checked);
  }
 
  removeTask(task) {
    Meteor.call('tasks.remove', task._id);
  }
  
  setPrivate(task) {
    Meteor.call('tasks.setPrivate', task._id, !task.private);
  }
 
}
 


 
export default angular.module('todosList', [
  angularMeteor
])
  .component('todosList', {
    templateUrl: 'imports/components/todosList/todosList.html',
    controller: ['$scope', '$reactive', TodosListCtrl]
  });