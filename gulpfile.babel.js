'use strict';

import babel from 'gulp-babel';
import gulp from 'gulp';
import ts from 'gulp-typescript';
import del from 'del';
import merge from 'merge2'

const tsProject = ts.createProject('tsconfig.json');

gulp.task('clean', () => del('dist'));

gulp.task('compile-js', () => merge([
    gulp.src('src/**/*.js', { base: 'src' }).
        pipe(babel()).
        pipe(gulp.dest('dist')),
    gulp.src('package.json').
        pipe(gulp.dest('dist'))
    ])
);

gulp.task('compile-ts', () => {
    let tsResult = tsProject.src().pipe(tsProject());
    return merge([
        tsResult.js.pipe(gulp.dest('dist')),
        tsResult.dts.pipe(gulp.dest('dist'))
    ]);
});
  