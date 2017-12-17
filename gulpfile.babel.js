'use strict';

import gulp from 'gulp';

import babel from 'gulp-babel';
import del from 'del';

gulp.task('clean', () => del('dist'));

gulp.task('compile', () =>
    gulp.src('lib/**/*.js', { base: '.' }).
        pipe(babel()).
        pipe(gulp.dest('dist')));

gulp.task('default', [ 'clean', 'compile' ]);