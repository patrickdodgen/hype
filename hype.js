if (Meteor.isClient) {
  // counter starts at 0
  Session.setDefault('counter', 0);

  Template.hello.helpers({
    counter: function () {
      return Session.get('counter');
    }
  });

  Template.hello.events({
    'click button': function () {
      // increment the counter when button is clicked
      navigator.geolocation.getCurrentPosition(gpsLookup, gpsFail, gpsOptions);
    }
  });
}
var gpsOptions = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0
};
function gpsLookup(position)
{
	return Session.set('counter', position.coords.latitude + ' ' + position.coords.longitude + ' ' + position.coords.accuracy);
}

function gpsFail(err)
{
	alert("couldn't look up position");
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
