exports = module.exports = function(done){
    var Role = require('keystone').list('Role');
    Role.model.find({}, function (err, roleDocs) {

        var functions = [];

        for (var i=0; i < roleDocs.length; i++) {
            functions.push((function(doc) {
                return function(callback) {
                    doc.needs = ['Sample need 1','Sample need 2'];
                    doc.secretGoal = 'Sample Secret Goal';
                    doc.save(callback);
                };
            })(roleDocs[i]));
        }

        require('async').parallel(functions, function(err, results) {
            console.log(err);
            console.log(results);
            done();
        });

    });
};