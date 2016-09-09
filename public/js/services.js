angular.module('DeployApp.services',[])
.factory('deployRequest', function() {
	function DeployRequest(){
		this.configId = 1;
		this.targetAppId = 0;
		this.deployDash = false;
		this.newDashName = "";
		this.deployHR = false;
		this.deployHRAndOverWrite=true;
	}
	
	function _deployRequest(){
		this.deployRequest = new DeployRequest();
	}
	
	return new _deployRequest();
})
.factory('deployTemplates', function($http,$location) {
	
	function Templates(){
		this.data = null;
	}
	
	function _templatesService(){
		this.template = new Templates();
	}
	
	_templatesService.prototype.getTemplates = function($scope) {
		$http.get('/templates.json').success(function(result) {
			$scope.templates = result;
		});	
	}
	
	_templatesService.prototype.getApps = function($scope) {
		$http.get('/applications.json').success(function(result) {
			$scope.applications = result;
		});	
	}
	
	_templatesService.prototype.deployHealthRules = function(template,application,overwrite) {
		
		var hrRequest = [];
		hrRequest.push(template);
		hrRequest.push(application);
		hrRequest.push(overwrite);
				
		$http({
		    url: '/copyhealthrules',
		    method: "POST",
		    data: JSON.stringify(hrRequest),
		    headers: {'Content-Type': 'application/json'}
		    }).success(function (data, status, headers, config) {
		        alert(data);
		    }).error(function (data, status, headers, config) {
		    	
		    });
	}
	
_templatesService.prototype.deployDashboards = function(template,application,dashboardName) {
		
		var hrRequest = [];
		hrRequest.push(template);
		hrRequest.push(application);
		hrRequest.push(dashboardName);
				
		$http({
		    url: '/copydashboards',
		    method: "POST",
		    data: JSON.stringify(hrRequest),
		    headers: {'Content-Type': 'application/json'}
		    }).success(function (data, status, headers, config) {
		        alert(data);
		    }).error(function (data, status, headers, config) {
		    	
		    });
	}
	
	return new _templatesService();
});
