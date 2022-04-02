const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

module.exports = {
	module: {
		rules: [
			{
		        test: /\.(js|mjs|jsx|ts|tsx)$/,
		        use: [
		          {
		            loader: 'babel-loader',
		          },
		        ],
		        exclude: /node_modules/,
		     },
		]
	},
	plugins: [
						new ForkTsCheckerWebpackPlugin({
							eslint: {
								enabled: true,
								files: '**/src/**/*.{ts,tsx}'
							}
						})
	 ]
}