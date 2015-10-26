Clips = new Mongo.Collection ("Clips")
Projects = new Mongo.Collection ("Projects")

if (Meteor.isClient) 
{
	State = new Mongo.Collection(null)

	Tracker.autorun (function () 
	{
		Meteor.subscribe ("clips")
		Meteor.subscribe ("projects")
	})

	Template.clips.helpers
	({
		clips : function () { return Clips.find({}).fetch() }
	})

	Template.clip.events
	({
		'click .deleteClip' : function (e) {
			Meteor.call("removeClip", this._id)
		},

		'click .playClip' : function (e, template) {
			
			var audio = template.find(".clipAudio")

			if (audio.paused)
			{
				console.log("Playing")
				audio.play()
			} 
			else 
			{
				console.log("Pausing")
				audio.pause()
			}
		}
	})

	Template.ui.helpers
	({
		head : function () {
			return "" + Session.get("elapsed") + "%"
		},
		timecode : function () {
			var elapsedSeconds = Math.floor(Session.get("elapsed"))
			var hours   = Math.floor(elapsedSeconds / 3600)
			var minutes = Math.floor(elapsedSeconds / 60 - hours * 60)
			var seconds = elapsedSeconds % 60
			var frames  = Math.floor(Session.get("fps") * (Session.get("elapsed") - elapsedSeconds))
			return ""+hours+":"+minutes+":"+seconds+":"+frames
		},
	})

	Template.ui.events
	({
		'click #add' : function () {
			Meteor.call("createClip", $("#newUrl").val())
		},
		'click #playPause' : function () {
			Session.set("playing", !Session.get("playing"))
		}
	})

	function update () 
	{
		if (Session.get("playing") == true)
		{
			Session.set("elapsed", Session.get("elapsed") + (1.0 / Session.get("fps")))
			console.log("blip " + Session.get("elapsed"))
		}
	}

	Template.ui.onCreated(function () 
	{
		Session.set("duration", 100.0)
		Session.set("fps", 29.97)
		Session.set("elapsed", 0.0)
		Session.set("playing", false)

		this.autorun (function () 
		{
			var ticker = Meteor.setInterval (function () 
			{
				update()
			}, 1000 * 1.0 / Session.get("fps"))
		})
	})
}

if (Meteor.isServer) 
{
	Meteor.methods
	({
		createClip : function (url) {
			Clips.insert({url:url})
		},

		removeClip : function (_id) {
			Clips.remove({_id:_id})
		},

		createProject : function (name) {
			Projects.insert({name:name})
		},
	})

	Meteor.publish ("clips", function () {
		return Clips.find({})
	})

	Meteor.publish ("projects", function () {
		return Projects.find({})
	})
}
