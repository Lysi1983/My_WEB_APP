var formarry = [];
var selectedIndex =-1;

    function init() {
        // clear existing table rows when the page loads
        document.getElementById("tableRows").innerHTML = "";
    if (localStorage.formmData) {
        formarry=JSON.parse(localStorage.formmData);
		for (var i =0 ; i < formarry.length; i++) {
          prepareTableCell(formarry[i].workplace, formarry[i].date, formarry[i].description,i);

        }
       }
    }


    function onRegisterPressed() {

        var workPlace = document.getElementById("workplace").value;
        var daTe = document.getElementById("date").value;
        var descriPtion = document.getElementById("description").value;
        var formObj = {
            workplace: workPlace,
            date: daTe,
            description: descriPtion}
		console.log(selectedIndex);
                if (selectedIndex===-1) {
                   formarry.push(formObj);
                   var newIndex = formarry.length - 1;
                   prepareTableCell(workPlace, daTe, descriPtion, newIndex);
            }else {
		    formarry.splice(selectedIndex, 1, formObj);

		}

        localStorage.formmData = JSON.stringify(formarry);
        onClearPressed();
    	}

    function prepareTableCell(workPlace, daTe, descriPtion,index) {
        var table = document.getElementById("tableRows");
        var row = table.insertRow();
        var workPlaceCell = row.insertCell(0);
        var daTeCell = row.insertCell(1);
        var descriPtionCell = row.insertCell(2);
        var actionCell = row.insertCell(3);

        workPlaceCell.innerHTML = workPlace;
        daTeCell.innerHTML = daTe;
        descriPtionCell.innerHTML = descriPtion;
        actionCell.innerHTML = '<button onclick="deleteTableRow('+ index + ')">Delete</button><button onclick="onEditPressed('+ index + ')">Update</button>';

        }
    function deleteTableRow(index) {
       var table = document.getElementById("tableRows");
       table.deleteRow(index);
       formarry.splice(index,1);
       localStorage.formmData = JSON.stringify(formarry);


    }

    function onClearPressed(index) {
        selectedIndex=-1;
        document.getElementById("workplace").value = "";
        document.getElementById("date").value = "";
        document.getElementById("description").value = "";
        document.getElementById("submit").innerHTML="Add new data";
    }
    function onEditPressed(index) {
		selectedIndex=index;
		var formObj=formarry[index];
		document.getElementById("workplace").value=formObj.workplace;
		document.getElementById("date").value =formObj.date;
		document.getElementById("description").value =formObj.description;
        document.getElementById("submit").innerHTML="Edit Update";
	}