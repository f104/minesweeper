import { src, dest, watch, parallel, series } from 'gulp';
import gulpif from 'gulp-if';
import browsersync from 'browser-sync';
import autoprefixer from 'gulp-autoprefixer';
import sass from 'gulp-sass';
import mincss from 'gulp-clean-css';
import sourcemaps from 'gulp-sourcemaps';
import plumber from 'gulp-plumber';
import debug from 'gulp-debug';
import yargs from 'yargs';
import log from 'fancy-log';
import colors from 'ansi-colors';

const argv = yargs.argv;
const production = !!argv.production;
global.isDev = !production;

const paths = {
    src: {
        stylesBuild: './assets/css/scss/*.scss',
        stylesWatch: './assets/css/scss/**/*',
        scriptsWatch: './assets/js/**/*',
        html: './*.html',
    },
    build: {
        general: './',
        styles: './assets/css/',
    }
};

//const pkg = JSON.parse(fs.readFileSync('./package.json'));

export const errorHandler = (task, title) => {
    return function (err) {
        log.error(task ? colors.red('[' + task + (title ? ' -> ' + title : '') + ']') : '', err.toString());
        this.emit('end');
    };
};

export const server = () => {
    browsersync.init({
        server: paths.build.general,
        port: 9000,
        tunnel: false,
        notify: false
    });
};

export const watchCode = () => {
    watch(paths.src.stylesWatch, styles);
    watch(paths.src.scriptsWatch, scripts);
    watch(paths.src.html, html);
};

export const styles = () => src(paths.src.stylesBuild)
    .pipe(plumber())
    .pipe(gulpif(!production, sourcemaps.init()))
    .pipe(sass()).on('error', errorHandler('styles', 'sass'))
    .pipe(gulpif(production, autoprefixer()))
    .pipe(gulpif(production, mincss({
        compatibility: '*', level: {
            1: {
                specialComments: 0,
                removeEmpty: true,
                removeWhitespace: true
            },
            2: {
                mergeMedia: true,
                removeEmpty: true,
                removeDuplicateFontRules: true,
                removeDuplicateMediaBlocks: true,
                removeDuplicateRules: true,
                removeUnusedAtRules: false
            }
        }
    })))
    .pipe(plumber.stop())
    .pipe(gulpif(!production, sourcemaps.write('./maps/')))
    .pipe(dest(paths.build.styles))
    .pipe(debug({
        'title': 'CSS files'
    }))
    .pipe(browsersync.stream({ match: '**/*.css' }));

export const scripts = () => src(paths.src.scriptsWatch)
    .on('end', browsersync.reload);

export const html = () => src(paths.src.html)
    .on('end', browsersync.reload);

// export const development = series(parallel(pugToHTML, styles, scripts, copyStatic),
export const development = series(styles, parallel(watchCode, server));

// export const prod = series(cleanFiles, svgsprites, pngsprites, stylesStatic, pugToHTML, styles, scripts, copyStatic);

export default server;
