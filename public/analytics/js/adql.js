
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
  
function setEmoji(percentage){
    if(percentage == 0){
        $("#emoji").html('<img src="/analytics/images/emoji_warning.png" style="width:60%;height:60%"/>');
      } else if(percentage < 93){
        $("#emoji").html('<img src="/analytics/images/emoji_critical.png" style="width:60%;height:60%"/>');
      }else if(percentage < 95){
        $("#emoji").html('<img src="/analytics/images/emoji_warning.png" style="width:60%;height:60%"/>');
      }else if(percentage >= 95){
        $("#emoji").html('<img src="/analytics/images/emoji_good.png" style="width:60%;height:60%"/>');
      }
}
