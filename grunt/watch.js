module.exports = function(grunt, options) {

    var watchFilter = ['../public/styles/**/*.scss'];
    
	return {
	
		express: {
			files: [
				'app.js',
				'../public/js/lib/**/*.{js,json}'
			],
			tasks: ['concurrent:dev']
		},
		sass: {
			files: watchFilter,
			tasks: ['sass']
		},
		livereload: {
			files: [
				'../public/styles/**/*.css',
			],
			options: {
				livereload: true
			}
		}   
    }

};