angular.module('DeployApp.controllers', ['DeployApp.services']).
controller('DeployController', function($scope,deployTemplates) {
    
	deployTemplates.getTemplates($scope);
	deployTemplates.getApps($scope);
	
	$scope.owHR = "true";	
	$scope.copy = "true";

	$scope.pushHealthRules = function(template, application, overwrite,copy,contains) {
		deployTemplates.deployHealthRules(template,application,overwrite,copy,contains);
	};
	
	$scope.pushDashboards = function(template, application, dashboardName) {
		deployTemplates.deployDashboards(template,application,dashboardName);
	};
	
	$scope.updateDashName = function(scope){
		scope.dashName = scope.selectedApp.name + ' - OPs';
	}
	
});