var assert    		= require("chai").assert;
var sinon      		= require('sinon');
var synUtil	        = require("../../public/js/synthetics-utils-src.js");

describe("Functional Testing of Synthetic Manager", function() {
	it('Test Fetch Synthetic Record By ID', function (done) {
        var rec = {};
		synUtil.buildSnapshotLink(rec);
        console.log(rec);
        done();
	});
});