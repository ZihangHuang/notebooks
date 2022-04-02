const { CheckerPlugin } = require('awesome-typescript-loader')

module.exports = {
	module: {
		rules: [
			{
		        test: /\.(tsx|ts)?$/,
		        loader: 'awesome-typescript-loader',
		        exclude: /node_modules/
		    },
		]
	},
	plugins: [
	    new CheckerPlugin()
	 ],
}