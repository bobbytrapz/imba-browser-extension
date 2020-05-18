const path = require('path');

module.exports = {
	module: {
		rules: [
			{
				test: /\.imba$/,
				loader: 'imba/loader',
			},
			{
				test: /\.css$/,
				loader: 'style-loader'
			}, {
				test: /\.css$/,
				loader: 'css-loader',
				options: {
					modules: {
						mode: 'local',
						localIdentName: '[path][name]__[local]--[hash:base64:5]',
						context: path.resolve(__dirname, 'src'),
						hashPrefix: 'my-custom-hash',
					},
				},
			}
		]
	},
	resolve: {
		extensions: [".imba", ".js", ".json", ".css"]
	},
	entry: {
		browser_action: "./src/browser_action.imba",
		content: "./src/content.imba"
	},
	output: { path: __dirname + '/js', filename: "[name].js" }
}
