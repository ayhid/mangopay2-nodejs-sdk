var expect = require('chai').expect;
var helpers = require('../helpers');

describe('Reports', function() {
    var report;

    before(function (done) {
        report = {
            ReportType: "TRANSACTION"
        };
        api.Reports.create(report).then(function () {
            done();
        });
    });


    describe('Create', function () {
        it('should exist', function () {
            expect(report.Id).to.exist;
        });
    });

    describe('Get', function () {
        var getReport;

        before(function(done){
            api.Reports.get(report.Id).then(function(data, response){
                getReport = data;
                done();
            });
        });

        it('should be correctly fetched', function () {
            expect(report.Id).to.equal(getReport.Id);
            expect(report.CreationDate).to.equal(getReport.CreationDate);
        });
    });


});
