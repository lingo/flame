var webpack = require('webpack');
var path    = require('path');

// webpack.config.js
module.exports = {
	entry: {
		anim: "anim.js"
	},
    resolve: {
    	root: __dirname,
    },
	output: {
		path:          		'./assets',
		filename:      		'[name].js',
        sourceMapFilename: 	'[file]_[hash].map',
        publicPath:        	'assets/'
	},
    // externals: {
    //     //            require("jquery") is external and available
    //     //            on the global var jQuery
    //     "jquery":     "jQuery",
    //     "microevent": "MicroEvent"
    // },
	module: {
		loaders: [
	        /*{
	        		test:    /\.js$/,
	        		exclude: /node_modules/,
	        		loader:  'babel',
	        		query: {
	        			// optional:    'runtime',
	        			plugins:     'object-assign'
	        			// optional: 'minification.removeConsole'
	        		}
	        }*/
		],
	},
	devtool: '#source-map',
	plugins: [
		// new webpack.DefinePlugin({
		// 	ATO_LIBRARY: "'microevent'"
		// })
	]
};



if (process.env.production) {
    // new webpack.optimize.CommonsChunkPlugin(/* chunkName= */"vendor", /* filename= */path.join(__dirname, 'themes/avl/dist', "vendor.js")),
	module.exports.plugins.push(new webpack.optimize.DedupePlugin());
	module.exports.plugins.push(new webpack.optimize.UglifyJsPlugin({minimize: true}));
}