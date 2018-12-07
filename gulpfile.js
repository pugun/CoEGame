var gulp = require('gulp');
var nodemon = require('gulp-nodemon');
var browsersync = require('browser-sync');

//monitor code recompile
gulp.task('nodemon',function() {
    nodemon({
        script: 'app',
        ext: 'js json',
        ignore: ['gulpfile.js','public'],
        env: {
            "NODE_ENV": 'development',
            "DEBUG": 'coe:*'
        }
    });
});

gulp.task('default', ['nodemon']);