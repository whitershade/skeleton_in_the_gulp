var gulp = require('gulp'), // Подключаем Gulp
    sourcemaps = require('gulp-sourcemaps'), // Подключим sourcemaps
    rigger = require('gulp-rigger'), // для склеивания файлов
    uglify = require('gulp-uglify'), // для сжатия js
    browserSync = require('browser-sync'), // Подключаем Browser Sync;
    rimraf = require('rimraf'), // rm rf для ноды
    babel = require('gulp-babel'), // для использования es2015 в старых браузерах
    pug = require('gulp-pug'), // подключает pug (jade)

		sorting = require('postcss-sorting'),
		postcss = require('gulp-postcss'),
		autoprefixer = require('autoprefixer'),
		cssnano = require('cssnano'),
		precss = require('precss'),
		rename = require('gulp-rename');

    // переменные путей
    path = {
      // источник
      src: { //Пути откуда брать исходники
        pug: 'app/*.pug', //Синтаксис src/*.html говорит gulp что мы хотим взять все файлы с расширением .html
        js: 'app/js/main.js', //В стилях и скриптах нам понадобятся только main файлы
        style: 'app/scss/main.scss',
				scss: 'app/scss/',
        img: 'app/img/**/*.*', //Синтаксис img/**/*.* означает - взять все файлы всех расширений из папки и из вложенных каталогов
        fonts: 'app/fonts/**/*.*',
    },
      // куда складывать файлы во время разработки
      build: {
        html: 'build/',
        js: 'build/js/',
        css: 'build/css/',
        img: 'build/img/',
        fonts: 'build/fonts/'
      },
      // куда складывать файлы для продакшена
      dist: {
        html: 'dist/',
        js: 'dist/js/',
        css: 'dist/css/',
        img: 'dist/img/',
        fonts: 'dist/fonts/'
      },
      // за какими файлами будем наблюдать
      watch: {
        pug: 'app/**/*.pug',
        js: 'app/js/**/*.js',
        scss: 'app/scss/*.scss',
        img: 'app/img/**/*.*',
        fonts: 'app/fonts/**/*.*'
      },
      // что будем подчищать
      clean: {
        develop: './build',
        developImg: './build/img/**/*.*',
        developFonts: './build/fonts/**/*.*',
        distImg: './dist/img/**/*.*',
        distFonts: './dist/fonts/**/*.*',
        dist: './dist'
      }
    };

    function handleError(err) {
      console.error(err.message);
      browserSync.notify(err.message, 3000); // Display error in the browser
      this.emit('end'); // Prevent gulp from catching the error and exiting the watch process
    };

// BROWSER SYNC
gulp.task('browser-sync:develop', function() { // Создаем таск browser-sync
    browserSync({ // Выполняем browser Sync
        server: { // Определяем параметры сервера
            baseDir: './build' // Директория для сервера - dist
        }
    });
});

gulp.task('browser-sync:dist', function() { // Создаем таск browser-sync
    browserSync({ // Выполняем browser Sync
        server: { // Определяем параметры сервера
            baseDir: './dist' // Директория для сервера - dist
        }
    });
});

// HTML
gulp.task('pug:develop', function() { // Создаем таск для HTML
  gulp.src(path.src.pug)
    .pipe(pug({
        pretty: true
      }).on('error', handleError)) // компилировать pug в html
    .pipe(gulp.dest(path.build.html)) // выплюнуть html по назначению
    .pipe(browserSync.reload({stream:true})); // Выполняем обновление в браузере
});

gulp.task('pug:dist', function() { // Создаем таск для HTML
    gulp.src(path.src.pug)
    .pipe(pug({
        pretty: true
      })) // компилировать pug в html
    .pipe(gulp.dest(path.dist.html)) // выплюнуть html по назначению
    .pipe(browserSync.reload({stream:true})); // Выполняем обновление в браузере
});

gulp.task('css-sorting', function () {
    return gulp.src(path.watch.scss).pipe(
        postcss([
            sorting({ "sort-order": [ "padding", "margin" ] })
        ])
    ).pipe(
        gulp.dest(path.src.scss)
    );
});

gulp.task('scss:develop', function () {
		var processors = [
			precss(),
			autoprefixer({browsers: ['last 10 version']})
	];

    return gulp.src(path.src.style)
			.pipe(rename('main.css'))
			.pipe(sourcemaps.init())// Инициализируем sourcemaps
			.pipe(postcss(processors).on('error', handleError))
			.pipe(sourcemaps.write('.')) // Запишем sourcemaps
			.pipe(gulp.dest(path.build.css))
			.pipe(browserSync.stream());
});

// IMAGES
gulp.task('image:develop', function (cb) {
    rimraf(path.clean.developImg, cb);
    gulp.src(path.src.img) //Выберем наши картинки
        .pipe(gulp.dest(path.build.img)) //И бросим в build
        .pipe(browserSync.reload({stream: true}));
});

gulp.task('image:dist', function (cb) {
    rimraf(path.clean.distImg, cb);
    gulp.src(path.src.img) //Выберем наши картинки
        .pipe(gulp.dest(path.dist.img)) //И бросим в dist
        .pipe(browserSync.reload({stream: true}));
});

// FONTS
gulp.task('fonts:develop', function(cb) {
    rimraf(path.clean.developFonts, cb);
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts))
        .pipe(browserSync.reload({stream: true}));
});

gulp.task('fonts:dist', function(cb) {
    rimraf(path.clean.distFonts, cb);
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.dist.fonts))
        .pipe(browserSync.reload({stream: true}));
});

// JS
gulp.task('js:develop', function () {
    gulp.src(path.src.js) //Найдем наш main файл
        .pipe(rigger()) //Прогоним через rigger
        .pipe(sourcemaps.init()) //Инициализируем sourcemap
        .pipe(babel({ presets: ['es2015'] }).on('error', handleError)) // перепишем на старый js
        .pipe(sourcemaps.write()) //Пропишем карты
        .pipe(gulp.dest(path.build.js)) //Выплюнем готовый файл в build
        .pipe(browserSync.reload({stream: true})); //И перезагрузим сервер
});

gulp.task('js:dist', function () {
    gulp.src(path.src.js) //Найдем наш main файл
        .pipe(rigger()) //Прогоним через rigger
        .pipe(babel({ presets: ['es2015'] })) // перепишем на старый js
        .pipe(uglify()) //Сожмем наш js
        .pipe(gulp.dest(path.dist.js)) //Выплюнем готовый файл в build
        .pipe(browserSync.reload({stream: true})); // И перезагрузим сервер
});

// WATCHER
gulp.task('watch:develop', function() {
    gulp.watch(path.watch.pug, ['pug:develop']); // Наблюдение за HTML файлами
    gulp.watch(path.watch.scss, ['scss:develop']); // Наблюдение за SCSS файлами
    gulp.watch(path.watch.js, ['js:develop']); // Наблюдение за картинками
    gulp.watch(path.watch.fonts, ['fonts:develop']); // Наблюдение шрифтами
    gulp.watch(path.watch.img, ['image:develop']); // Наблюдение за картинками
});

gulp.task('watch:dist', function() {
    gulp.watch(path.watch.pug, ['pug:dist']); // Наблюдение за HTML файлами
    gulp.watch(path.watch.scss, ['scss:dist']); // Наблюдение за SCSS файлами
    gulp.watch(path.watch.js, ['js:dist']); // Наблюдение за картинками
    gulp.watch(path.watch.fonts, ['fonts:dist']); // Наблюдение шрифтами
    gulp.watch(path.watch.img, ['image:dist']); // Наблюдение за картинками
});

// CLEANER
gulp.task('clean:develop', function (cb) {
    rimraf(path.clean.develop, cb);
});

gulp.task('clean:dist', function (cb) {
    rimraf(path.clean.dist, cb);
});

gulp.task('develop', ['pug:develop', 'css-sorting', 'scss:develop', 'js:develop', 'image:develop', 'fonts:develop', 'watch:develop', 'browser-sync:develop']); // Инициализация всех файлов, включения вотчера и автообновления в браузере

gulp.task('dist', ['pug:dist', 'scss:dist', 'js:dist', 'image:dist', 'fonts:dist', 'watch:dist', 'browser-sync:dist']); // Инициализация всех файлов, включения вотчера и автообновления в браузере
