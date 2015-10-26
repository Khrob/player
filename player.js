Clips = new Mongo.Collection ("Clips")

if (Meteor.isClient) 
{
	Tracker.autorun (function () {
		Meteor.subscribe("clips")
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
			console.log(this)
			"" + this.head * 100.0 + "%"
		},
		timecode : "00:00:00"
	})

	Template.ui.events
	({
		'click #add' : function () {
			Meteor.call("createClip", $("#newUrl").val())
		},
		'click #playPause' : function () {
			this.playing = !this.playing
		}
	})

	function update (player) 
	{
		if (player.playing == true)
		{
			console.log("tick")
			player.head += 0.02
		}
	}

	Template.ui.onCreated(function () {

		this.playing 	= false
		this.head 		= 0.0
		this.fps 		= 29.97
		this.duration	= 100.0

		var self = this

		var ticker = Meteor.setInterval (function () 
		{
			update(self)
		}, 1000 * 1.0 / this.fps)

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
	})

	Meteor.publish ("clips", function () {
		return Clips.find({})
	})
}
