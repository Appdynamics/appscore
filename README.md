FastAppConfig
==========

Deploy Health Rules and Dashboards quickly.

#### Required Frameworks
1. node.js <br/>
2. bower<br/>

References :<br/>
http://www.thinkingmedia.ca/2015/07/how-to-install-nodejs-bower-and-grunt-on-windows-8/<br/>
https://nodejs.org/en/download/<br/>
http://bower.io/<br/>

####Installation

1. Clone from repository : 
>git clone https://github.com/Appdynamics/FastAppConfig.git

2. Change into the directory
> cd FastAppConfig

3. Download the dependencies
> bower install

4. Download npm dependencies
> npm install

5. Configure the application. See Configuration Steps

6. start node.js
> npm start

6. Open browser to :
http://localhost:3000

####Configuration Steps

Create a config.json file in the root directory with the following :

<pre>
{
	"restuser" : "username@account_name",
	"restpasswrd" : "password",
	"controller" : "server.saas.appdynamics.com",
	"https" : true,
	"templates":[
		{"id":1,"name":"Java Template","type":"Java","description":"Java Application - Health Rules and Dashboards","appid":38,"dashid":39},
		{"id":2,"name":".NET Template","type":".NET","description":".NET Application - Health Rules and Dashboards","appid":27,"dashid":3},
	]
}
</pre>
<br/>
restuser is the username @ the account <br/>
https is a flag to set if you are using https to reference your controller.<br/>
appid is the application id<br/>
dashid is the id of the dashboard<br/>
templates are entries that point to your template application on your controller.<br/> 

#### Screenshots
Step 1 : Select Template
<img src="https://github.com/Appdynamics/FastAppConfig/blob/master/public/img/step1.png"/>
Once you have your templates configured, then first step is decide if which template's health rules you are going to copy. When you select copy in Step 3
the Health Rules are first copied and then modified, then it is pushed back to the Controller.

Step 2 : Select Destination Application
<img src="https://github.com/Appdynamics/FastAppConfig/blob/master/public/img/step2.png"/>
In Step 2 you will select your destination application that the health rules and dashboard will be copied to. To copy to all applications selec the "All Application" option.

Step 3 : Copy Health Rules
<img src="https://github.com/Appdynamics/FastAppConfig/blob/master/public/img/step3.png"/>
If you select to overwrite the rules, then all the rules from the template application will be copied to the destination application. If you select to not overwrite the rules, then only new rules will be copied over.

Step 4 : Copy Dashboards
<img src="https://github.com/Appdynamics/FastAppConfig/blob/master/public/img/step4.png"/>
When you copy the Dashboard, the template dashboard will be downloaded and modified. The internal references to health rules and deep links will be modified to reference the destination application. If you copy again, a new dashboard will be created. Overwriting dashboards are not supported right now .

---
#### Scenario : Copy Health Rules <br/>
You would create or use an existing application as your template on your controller. In this template application configure your health rules the way you want. These rules would then be copied to the target application that you select in Step 2. 
<p/>
#### Scenario : Copy Dashboard <br/>
You would create a dashboard and use this as a template. If you have status widgets tied to health rules, then make sure that these health rules are also copied to the target application. When you are ready to the copy the dashboard to the target application, this app downloads the 
dashboard and update any references e.g. Health Rules and deep links, and updates it to the target application. 
<p/>
#### Scenario : Copy Health Rules to All Applications <br/>
You can select a template and select the "All Applications" option in the target application from the drop down selection. This would copy
all the health rules from the template application to all other applications on the Controller. 
If you want to push just 1 health rule change, then make sure that only 1 health rule exist in the template application.




