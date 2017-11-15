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




