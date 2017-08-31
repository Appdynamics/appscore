
var adqlEnd = new Date();
var adqlStart   = new Date();
adqlStart.setDate(adqlStart.getDate()-1);
var limit = 1000;

function lookup(query,callback){
      var request = {query:query,start:adqlStart.getTime(),end:adqlEnd.getTime(),limit:limit};
      $.ajax({
                url: '/analytics',
                method: "POST",
                data : request
                }).done(function (data) {
                    filteredList = [];
                    data[0].results.forEach(function(rec){
                      filteredList.push(rec[0]);
                    })
                    callback(filteredList);
                }).fail(function (jqXHR, message) { 
                    alert(message);
                }
      );
}

function search (query,callback){
    searchRange(query,adqlStart,adqlEnd,callback);
}  

function searchRange (query,start,end,callback){
      var request = {query:query,start:start.getTime(),end:end.getTime(),limit:limit};
      $.ajax({
                url: '/analytics',
                method: "POST",
                data : request
                }).done(function (data) {
                    callback(data);
                }).fail(function (jqXHR, message) { 
                    alert(message);
                }
      );
}

function getHealthColor(health){
    switch(health){
        case 'NORMAL' : 
            return "#79DD1B";
            break;
        case 'SLOW' : 
            return "#FFD24D";
            break;
        case 'VERY_SLOW' : 
            return "#FF9326";
            break;
        case 'STALL' : 
            return "#938BE6";
            break;
        case 'ERROR' : 
            return "#EF5C5D";
            break;
    }
}

function autoComplete(selector,adqlField,callback){
    $( selector ).autocomplete({
        source: function( request, response ) {
            var value = $(selector).val();
            var query = "SELECT distinct ("+adqlField+") FROM transactions WHERE "+adqlField+" is NOT NULL and "+adqlField+" = '"+value+"*'";
            lookup(query,response);
        },
        minLength: 1,
        select: function( event, ui ) {
            if(callback){
                callback(ui.item);
            }
        }
    } );
}
  
function setEmoji(percentage,width,height){
    var image = "";
    if(percentage == 0){
        image = "emoji_warning.png";
    } else if(percentage < 85){
        image = "emoji_critical.png";
    }else if(percentage < 95){
        image = "emoji_warning.png";  
    }else if(percentage >= 95){
        image = "emoji_good.png";
    }
    if(!width){
        width = 80;
    }
    if(!height){
        height = 80;
    }
    $("#emoji").html('<img src="/analytics/images/'+image+'" style="width:'+width+'%;height:'+height+'%"/>');
}

var buildTransactionTrend = function(company,application,experience,employeeId){
    
    var query = "SELECT series(eventTimestamp, '10m'), avg(responseTime),count(*) FROM transactions WHERE segments.userData.CompanyId = '"+company+"' and segments.userData.EmployeeId ='"+employeeId+"' and userExperience = '"+experience+"' and application = '"+application+"'";
    search(query,function(data){
    buildTransactionTrendChart(company,application,employeeId,experience,data[0].results)
    });
    resetTransactions();
}

var buildTransactionTrendChart = function(company,application,employeeId,experience,data){
    
    //normalize data
    var dates = ['dates'];
    var responseTimes = ['Average Response (ms)'];
    var calls = ['Calls'];
    data.forEach(function(rec){
    dates.push(parseInt(rec[0]));
    responseTimes.push(parseInt(rec[1]));
    calls.push(rec[2]);
    })

    var chart = c3.generate({
        bindto: '#transactionsTrend',
        data: {
            x : 'dates',
            xFormat : null,
            columns: [dates,responseTimes,calls],
            type : 'line',
            onclick: function(e) { buildTransactionList(company,application,experience,employeeId,e.x); }
        },
        axis : {
            x : {
                type : 'timeseries',
                tick: {
                format: '%m-%d %H:%M %p',
                "fit":true,
                "rotate":45
                }
            }
        }
    })
}

var buildTransactionList = function(company,application,experience,employeeId,time){
    var startDate = new Date(time.valueOf());
    startDate.setMinutes(time.getMinutes()-10);
  
    var query = "SELECT eventTimestamp,segments.userData.EmployeeId,userExperience,requestGUID, transactionName,responseTime  FROM transactions WHERE segments.userData.CompanyId = '"+company+"' and segments.userData.EmployeeId ='"+employeeId+"' and userExperience = '"+experience
    +"' and application = '"+application+"' and eventTimestamp >="+startDate.valueOf()+" and eventTimestamp <="+time.valueOf();
    search(query,function(data){
      buildTransactionListTable(company,application,experience,employeeId,data[0].results)
    });
  }
  

  var buildTransactionListTable = function(company,application,experience,employeeId,data){
    var transactionListTable = $('#transactionList_table') ;
    if ( ! $.fn.DataTable.isDataTable( '#transactionList_table' ) ) {
        transactionListTable.DataTable().on('click', 'tr[role="row"]', function () {
              var tr = $(this);
              tr.toggleClass("selected");
              var row = transactionListTable.DataTable().row( tr );
              viewTransaction(row.data());
          } );
    }
    showTransactions();
    transactionListTable.DataTable( {
          destroy: true,
          data: data,
          columns: [
              { title: "Date" },
              { title: "User"},
              { title: "Experience"},
              { title: "GUID"},
              { title: "BT"},
              { title: "Response Time"}            
          ],
          columnDefs:[
          {targets:0, render:function(val){
            var d = new Date(val);
            return  + d.getFullYear()+"/"+(d.getMonth()+1) + "/"+d.getDate()+" "+d.getHours() + ":" + d.getMinutes();
          }},
          {targets:3,visible:false}
          ],
          order: [[ 1, "desc" ]]
      } );
  }

var viewTransaction = function(d){
    var querystring = "https://paylocitytest.saas.appdynamics.com/controller/#/location=ANALYTICS_ADQL_SEARCH&timeRange=last_3_days.BEFORE_NOW.-1.-1.4320&application=7055&adqlQuery=SELECT%2520*%2520FROM%2520transactions%2520where%2520requestGUID%2520%253D%2520'"+d.guid+"'&searchType=SINGLE&searchMode=ADVANCED&viewMode=DATA&dashboardMode=force";
    window.open(querystring,'_blank');
}

var resetApplications = function(){
    $("#applicationsHead").html("Experience By Application");
    $("#applications").html("");
  }
  
  var resetUsers = function(){
    $("#usersHead").html("Experience By Users");
    $("#users").html("");
  }
  
  var resetTransactionsTrend = function(){
    $("#transactionsTrend").html("");
  }
  
  var resetTransactions = function(){
    $("#transactionListPanel").hide();  
  }
  var showTransactions = function(){
    $("#transactionListPanel").show();
  }
  

