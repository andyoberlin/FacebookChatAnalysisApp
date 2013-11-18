require.config({
	shim: {
		'facebook' : {
			export: 'FB'
		}
	},
	paths: {
		'facebook': '//connect.facebook.net/en_US/all'
	}
})

require(['fb']);