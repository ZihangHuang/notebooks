const path = require('path');
const express = require('express');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const webpack = require('webpack');
const webpackConfig = require('../webpack.dev.js');

process.env.NODE_ENV = 'development';

const app = express();

const compiler = webpack(webpackConfig);

app.use(webpackDevMiddleware(compiler, {
    publicPath: webpackConfig.output.publicPath || '/',
    hot: true,
    stats: {
        colors: true,
        chunks: false
    }
}));

app.use(webpackHotMiddleware(compiler));

app.use(express.static(path.resolve(__dirname, '../public')));

//routes
app.get('/:viewname?', function(req, res, next) {
    if(req.params.viewname === 'favicon.ico') return res.status(204);

    var viewname = req.params.viewname 
        ? req.params.viewname
        : 'index.html';
    
    var filepath = path.join(compiler.outputPath, '/' + viewname);
    
    // 使用webpack提供的outputFileSystem
    compiler.outputFileSystem.readFile(filepath, function(err, result) {
        if (err) {
            
            return next(err);
        }
        res.set('content-type', 'text/html');
        res.send(result);
        res.end();
    });
});

app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.send(err.stack || 'Service Error');
});

var port = 3004;
app.listen(port, () => console.log(`development is listening on port ${port}`));