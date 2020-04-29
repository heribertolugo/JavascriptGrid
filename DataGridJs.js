
jQuery.DataGridJs = DataGrid;


function DataGrid(options) {

	var that = this;

	this.val;

	var gridName;
	var typeOfValue = typeof options;
	var currentSelected = null; // currently selected row
	var isGrabbed = false; // whether the title bar is currently grabbed
	var mouseToObjOffset = new Point(); // the offset from the mouse pointer to the title bar
	var isShown = false;
	var isCreated = false;
	var lastPosition;


	var defaults = {
		gridName: "DataGrid" + new Date().getTime(),
		title: "Select a Record",
		pageMax: 25,
		requestUrl: null,
		requestCdgc: null,
		requestSort: null,
		requestFirstRecord: 0,
		requestLastRecord: -1,
		requestSearchPattern: "",
		requestSearchType: null,
		requestSort: "",
		width: 600,
		gridHeight: 300,
		startPage: 0,
		isModal: true,
		deleteOnClose: false,
		valueContainer: "",
		dataId: "",
		closeOnSelect : true
	};

	options = typeOfValue == "string" ? defaults : options;

	var height = (typeof (options.gridHeight) !== 'undefined' && typeof (options.gridHeight) !== '' && typeof (options.gridHeight) !== null) ? options.gridHeight : 300;
	var width = (typeof (options.width) !== 'undefined' && typeof (options.width) !== '' && typeof (options.width) !== null) ? options.width : 600;
	var currentPage = (typeof (options.startPage) !== 'undefined' && typeof (options.startPage) !== '' && typeof (options.startPage) !== null) ? options.startPage : 0;


	if (typeof (options.gridName) === 'undefined' || typeof (options.gridName) === '' || typeof (options.gridName) === null) options.gridName = defaults.gridName;
	if (typeof (options.title) === 'undefined' || typeof (options.title) === '' || typeof (options.title) === null) options.title = defaults.title;
	if (typeof (options.pageMax) === 'undefined' || typeof (options.pageMax) === '' || typeof (options.pageMax) === null) options.pageMax = defaults.pageMax;
	if (typeof (options.requestCdgc) === 'undefined' || typeof (options.requestCdgc) === '' || typeof (options.requestCdgc) === null) options.cdgc = defaults.requestCdgc;
	if (typeof (options.requestSort) === 'undefined' || typeof (options.requestSort) === '' || typeof (options.requestSort) === null) options.requestSort = defaults.requestSort;
	if (typeof (options.requestFirstRecord) === 'undefined' || typeof (options.requestFirstRecord) === '' || typeof (options.requestFirstRecord) === null) options.first = defaults.requestFirstRecord;
	if (typeof (options.requestLastRecord) === 'undefined' || typeof (options.requestLastRecord) === '' || typeof (options.requestLastRecord) === null) options.last = defaults.requestLastRecord;
	if (typeof (options.requestSearchPattern) === 'undefined' || typeof (options.requestSearchPattern) === '' || typeof (options.requestSearchPattern) === null) options.pattern = defaults.requestSearchPattern
	if (typeof (options.requestSearchType) === 'undefined' || typeof (options.requestSearchType) === '' || typeof (options.requestSearchType) === null) options.matchPosition = defaults.requestSearchType;
	if (typeof (options.isModal) === 'undefined' || typeof (options.isModal) !== "boolean") options.isModal = defaults.isModal;
	if (typeof (options.deleteOnClose) === 'undefined' || typeof (options.deleteOnClose) !== "boolean") options.deleteOnClose = defaults.deleteOnClose;
	if (typeof (options.valueContainer) === 'undefined' || typeof (options.valueContainer) === '' || typeof (options.valueContainer) === null) options.valueContainer = defaults.valueContainer;
	if (typeof (options.dataId) === 'undefined' || typeof (options.dataId) === '' || typeof (options.dataId) === null) options.dataId = defaults.dataId;
	if (typeof (options.closeOnSelect) === 'undefined' || typeof (options.closeOnSelect) !== "boolean") options.closeOnSelect = defaults.closeOnSelect;

	this.ValueContainer;
	this.IdColumn;



	/************************************************************************************************************************************************************************
    ******* REGION PROPERTIES AND METHODS ***********************************************************************************************************************************
    *************************************************************************************************************************************************************************
    ************************************************************************************************************************************************************************/




	///************************************************************************************
	//* Creates and displays the DataGrid
	//************************************************************************************/
	this.Show = function (container) {
		if (!isCreated) {
			if (typeof (container) === 'undefined' || typeof (container) === '') container = "body";
			CreateGridWindow(container);
			SetPageCount();
			that.GetData();



			$(document).bind("mouseup", function (event) {
				DropIt(event);
			});

			$(document).bind("mousemove", function (event) {
				MoveGridObject(event);
			});

			isCreated = true;
		} else {

			if (!isShown) {
				var gridPos = $("#" + options.gridName).offset();

				if (options.isModal) $("#wrappie").css({ display: "block" });

				$("#" + options.gridName).animate({
					top: "toggle",
					left: "toggle",
					opacity: 1,
					width: "toggle",
					duration: "slow",
					complete: function () {

					}
				});
			}
		}

		isShown = true;
	}



	///************************************************************************************
	//* Gets the next batch of data in the next page, and displays it. Updates current page 
	//************************************************************************************/
	this.GetData = function () {
		currentPage++;
		var dataCallback = function (data) {
			DisplayNextData(data);
			$("#" + options.gridName + "CurrentPageNumberInput").val(currentPage);
			// kill loading
			AnimatedLoadingText($("#" + options.gridName + "DataWrapper", "loading", false));
			return data
		};

		// show loading
		isTextInitialized = false; //hack - so we can animate the loading. infinite loop when placed in function. set to true in function
		AnimatedLoadingText("#" + options.gridName + "GridDataWrapper", "loading", true);

		//setTimeout(function () { FetchData(dataCallback) }, 3000);
		FetchData(dataCallback);

	}

	///************************************************************************************
	//* Returns the value selected as JSON object to the callback function passed in parameter. 
	//************************************************************************************/
	var selectedConfirmCallback;
	this.SelectedConfirmed = function (callback) {
		//        if (typeof selectedConfirmCallback !== 'undefined') {
		//            $(options.gridName + "OkBut").unbind("click", selectedConfirmCallback);
		//        } else if(callback != selectedConfirmCallback) {

		$("#" + options.gridName + "OkBut").bind("click", { selected: $("#" + options.gridName + "SelectedItemValue").val() }, callback);
		//        }

		//        if (typeof callback !== 'undefined' && callback != "") {
		//            selectedConfirmCallback = callback;
		//        }
	};


	function getVal() {
		var v = $("#" + options.gridName + "SelectedItemValue").val();
		alert(v.CompanyName);
		return that.val;
	}

	///************************************************************************************
	//* cdgc value used in request to server 
	//************************************************************************************/
	this.requestCdgc = function (value) {
		if (typeof (value) !== 'undefined' || typeof (value) !== '') {
			that.options.requestCdgc = value;
		}

		return that.options.requestCdgc;
	}

	this.requestSort = function (value) {
		if (typeof (value) !== 'undefined' || typeof (value) !== '') {
			that.options.requestSort = value;
		}

		return that.options.requestSort;
	}

	this.requestFirstRecord = function (value) {
		if (typeof (value) !== 'undefined' || typeof (value) !== '') {
			that.options.requestFirstRecord = value;
		}

		return that.options.requestFirstRecord;
	}

	this.requestLastRecord = function (value) {
		if (typeof (value) !== 'undefined' || typeof (value) !== '') {
			that.options.requestLastRecord = value;
		}

		return that.options.requestLastRecord;
	}

	this.requestSearchPattern = function (value) {
		if (typeof (value) !== 'undefined' || typeof (value) !== '') {
			that.options.requestSearchPattern = value;
		}

		return that.options.requestSearchPattern;
	}

	this.requestSearchType = function (value) {
		if (typeof (value) !== 'undefined' || typeof (value) !== '') {
			that.options.requestSearchType = (value == "begins" || value == "ends") ? value : "contains";
		}

		return that.options.requestSearchType;
	}

	this.GetOptions = function () {
		return that.options;
	}




	/************************************************************************************************************************************************************************
    ******* REGION PRIVATE FUNCTIONS **************************************************************************************************************************************** 
    *************************************************************************************************************************************************************************
    ************************************************************************************************************************************************************************/


	///************************************************************************************
	//* Sets the count for total number of pages
	//************************************************************************************/
	function SetPageCount() {
		var countCallback = function (count) {
			$("#" + options.gridName + "MaxPage").text(Math.ceil(count / options.pageMax));
			return count
		};

		FetchCount(countCallback);
	}


	///************************************************************************************
	//* Gets the next page of data
	//************************************************************************************/
	function FetchData(dataCallback) {
		var lastPage = ((options.pageMax * currentPage));
		var firstPage = ((lastPage - options.pageMax) + 1);
		var reqData = {
			cdgc: options.requestCdgc,
			s: options.requestSort,
			f: firstPage,
			l: lastPage,
			p: options.requestSearchPattern,
			m: options.requestSearchType
		};

		$.ajax({
			url: options.requestUrl,
			type: "GET",
			data: reqData,
			//data: ReqData,
			dataType: "json",
			success: function (data, status, xhr) {
				dataCallback(data);
			},
			error: function (data) {
				$(options.gridName + "load_div").remove();
				runLoop = false;
				isTextInitialized = false;
				AnimatedLoadingText($("#" + options.gridName + "DataWrapper", "Error:\nPlease reload.", false));
			}
		});
	}


	///************************************************************************************
	//* Gets the count for the entirety of records as set in option. 
	//  This is total number of rows in all pages
	//************************************************************************************/
	var FetchCount = function (countCallback) {
		var reqData = {
			cdgc: options.requestCdgc,
			s: options.requestSort,
			f: options.requestFirstRecord,
			l: options.requestLastRecord,
			p: options.requestSearchPattern,
			m: options.requestSearchType,
			count: 1
		};

		$.ajax({
			url: options.requestUrl,
			type: "GET",
			data: reqData,
			dataType: "json",
			success: function (data, status, xhr) {
				countCallback(data);
			},
			error: function (data) {
				$(options.gridName + "load_div").remove();
				runLoop = false;
				isTextInitialized = false;
				AnimatedLoadingText($("#" + options.gridName + "DataWrapper", "Error:\nPlease reload.", false));
			}
		});
	}




	///************************************************************************************
	//* Creates and displays the next page of data
	// @data - data to be displayed. this should be in JSON format representing rows and columns
	//************************************************************************************/
	function DisplayNextData(data) {
		var headers = new Array(); // just keeps track of what header columns have been added 
		var headerRow = document.createElement("tr");
		var result = "";
		var colNum = 0; // keep track of column count for naming purpose - should be replaced with table.rows.cells.length
		var rowNum = 0;
		var cellWidths = new Array();
		var headerTable = document.getElementById(options.gridName + "GridHeader");
		var dataTable = document.getElementById(options.gridName + "GridData");

		$(headerTable).empty();
		$(dataTable).empty();

		$.each(data, function (k, v) {

			if (headerTable.rows.length === 0) headerRow = headerTable.insertRow(0);

			var dataRow = dataTable.insertRow(-1);

			dataRow.setAttribute("id", (options.gridName + "Row" + rowNum + "P" + currentPage));

			if ($(dataRow).attr("id") === currentSelected) $(dataRow).css({ backgroundColor: "#d8d8d8", border: "10px solid #0000cc" });

			$.each(v, function (col, val) {
				if (headers.indexOf(col) < 0) { // we need to create a header for this column
					var hcellId = (options.gridName + "HCellC" + colNum + "R" + rowNum);
					var hcell = Cell(headerRow, hcellId, "", col, "auto", true);
					hcell.setAttribute("class", "headerCell");

					// if we are sorting, show a glyph to let user know which column we are sorted by
					if (col == options.requestSort) {
						var sortHeaderIcon = document.createElement("span");
						var sortHeaderIconText = document.createTextNode(" 6");

						sortHeaderIcon.setAttribute("id", options.gridName + "HCellSortIcon");
						$(sortHeaderIcon).css({ fontFamily: "Webdings", margin: "0px auto" });
						sortHeaderIcon.appendChild(sortHeaderIconText);

						$(hcell).children("div").append(sortHeaderIcon);
					}

					headers.push(col);
					cellWidths.push($("#" + hcellId).outerWidth());
				}

				var cellId = (options.gridName + "CellC" + colNum + "R" + rowNum);
				var cell = Cell(dataRow, cellId, v, val, "auto", false);
				var cWidth = $("#" + cellId).outerWidth();
				cell.setAttribute("class", "cell");

				if (cellWidths[colNum] < cWidth) {
					cellWidths[colNum] = ((cWidth > 250) ? 250 : cWidth);
				}


				colNum++;
			})

			rowNum++;
			colNum = 0;
		});

		// add a spacer cell to end of header row to take up scrollbar slack
		Cell(headerRow, options.gridName + "HeaderSpacer", "", "", "", true);

		// resize the cells
		$(document.getElementById(options.gridName + "GridData").rows).each(function (row) {
			$(document.getElementById(options.gridName + "GridData").rows[row].cells).each(function (column) {
				if (row < 1) {
					$(headerRow.cells[column]).outerWidth(cellWidths[column] + "px");
					$(headerRow.cells[column]).children("div").outerWidth(cellWidths[column] + "px");
				}
				$(this).outerWidth(cellWidths[column] + "px");
				$(this).children("div").outerWidth(cellWidths[column] + "px");
			});
		});

		$(".cell").bind("mouseover", { msg: "over" }, RowHover);
		$(".cell").bind("mouseout", { msg: "out" }, RowHover);
		$(".cell").bind("click", CellClicked);
		$(".headerCell").bind("mouseover", { status: "over" }, HeaderMouseOver);
		$(".headerCell").bind("mouseout", { status: "out" }, HeaderMouseOver);
		$(".headerCell").bind("click", SortByHeaderClick);

	} // end DisplayNextData()



	///************************************************************************************
	//* Creates and appends a cell to a table row
	//************************************************************************************/
	var Cell = function (row, id, value, text, width, isHeader) {

		this.text = (typeof (text) === 'undefined') ? "" : text;
		this.value = (typeof (value) === 'undefined') ? "" : value;
		this.width = (typeof (width) === 'undefined' || width == "") ? "100%" : width;
		this.id = (typeof (id) === 'undefined' || id == "") ? ("Cell" + new Date().getTime()) : id;
		this.isHeader = (typeof (isHeader) === 'undefined' || typeof (isHeader) !== "boolean") ? false : isHeader;

		var tdStyle = {
			width: this.width,
			border: "thin solid #bdbdbd",
			overflow: "hidden",
			//display: "inline-block",
			whiteSpace: "normal"
		};

		var thStyle = {
			width: this.width,
			whiteSpace: "normal",
			backgroundColor: "#e9edf1",
			borderTop: "solid thin #ffffff",
			borderLeft: "solid thin #ffffff",
			borderBottom: "solid thin #848484",
			borderRight: "solid thin #848484",
			cursor: "pointer",
			textAlign: "center"
		};

		var tdWrapStyle = {
			width: this.width,
			padding: "2px",
			overflow: "hidden",
			whiteSpace: "normal"
		};

		var thWrapStyle = {
			width: this.width,
			padding: "3px",
			overflow: "hidden",
			whiteSpace: "normal"
		};

		var newCell = row.insertCell(-1);

		var div = document.createElement("div");
		var val = document.createElement("input");
		var txt = document.createTextNode(this.text);

		newCell.setAttribute("id", this.id);
		div.setAttribute("id", this.id + "ValWrapper");

		val.setAttribute("id", this.id + "Value");
		val.setAttribute("name", this.id + "Value");
		val.setAttribute("type", "hidden");
		val.setAttribute("value", value);

		$(newCell).css((isHeader) ? thStyle : tdStyle);
		$(div).css((isHeader) ? thWrapStyle : tdWrapStyle);

		$(div).append(txt);
		$(div).append(val);

		newCell.appendChild(div);


		return newCell;
	} // end Cell()



	///************************************************************************************
	//* Checks if given Location is inside the ModalGrid Title Bar
	//* Returns Boolean.
	//************************************************************************************/
	function IsLocationInTitle(point) {
		var titleBarLoc = $("#" + options.gridName + "Title").offset();
		var titleButLoc = $("#" + options.gridName + "TitleButton").offset();
		var titleButRight = (titleButLoc.left + $("#" + options.gridName + "Title").outerWidth());
		var titleButBottom = (titleButLoc.top + $("#" + options.gridName + "Title").outerHeight());
		var titleButLeft = titleButLoc.left;
		var titleButTop = titleButLoc.top;
		var right = (titleBarLoc.left + $("#" + options.gridName + "Title").outerWidth());
		var bottom = (titleBarLoc.top + $("#" + options.gridName + "Title").outerHeight());
		var left = titleBarLoc.left;
		var top = titleBarLoc.top;

		if (point.x > right || point.x < left) return false;
		if (point.y < top || point.y > bottom) return false;
		if ((point.x >= titleButLeft && point.x <= titleButRight) && (point.y >= titleButTop && point.y <= titleButBottom)) return false;

		return true;
	}



	///************************************************************************************
	//* Toggles the text section mode
	//************************************************************************************/
	function ToggleDocumentSelection(status) {
		if (!status) {
			$("body").css({
				'-moz-user-select': '-moz-none',
				'-moz-user-select': 'none',
				'-o-user-select': 'none',
				'-khtml-user-select': 'none',
				'-webkit-user-select': 'none',
				'-ms-user-select': 'none',
				'user-select': 'none'
			})
		} else {
			$("body").css({
				'-moz-user-select': 'auto',
				'-moz-user-select': 'auto',
				'-o-user-select': 'auto',
				'-khtml-user-select': 'auto',
				'-webkit-user-select': 'auto',
				'-ms-user-select': 'auto',
				'user-select': 'auto'
			})
		}
	}



	///************************************************************************************
	//* Animates the loading text  
	//************************************************************************************/
	var runLoop = false;
	var isTextInitialized = false;
	function AnimatedLoadingText(element, text, status) {

		if (!isTextInitialized) {
			var tSize = parseFloat($("body").css("font-size"));
			var textContainer = document.createElement("div");
			var textArr = text.split("");

			$(element).children("table").empty();

			textContainer.setAttribute("id", options.gridName + "load_div");

			$(textArr).each(function () {
				var t = document.createElement("span");
				var tn = document.createTextNode(this);
				t.setAttribute("id", options.gridName + "load_" + this);
				$(t).css({ fontSize: tSize + "px" });
				$(t).append(tn);
				$(textContainer).append(t);
				tSize += 2;
			});

			$(element).append(textContainer);

			$(textContainer).css({ width: options.width, height: "100%", textAlign: "center", paddingTop: "25%", paddingLeft: "50px", zIndex: "99999" });

			isTextInitialized = true;
			runLoop = status;
		}

		if (status && runLoop) {

			var colors = [];
			colors[0] = "#0000ff";
			colors[1] = "#00ffff";
			colors[2] = "#ffffff";
			colors[3] = "#ffff00";
			colors[4] = "#ff0000";
			colors[5] = "#ff00ff";
			colors[6] = "#00ff00";

			$("#" + options.gridName + "load_div").children("span").each(function () {
				var step = "+=";
				if (parseFloat($(this).css("font-size")) >= 30) step = "-=";
				if (parseFloat($(this).css("font-size")) <= 10) step = "+=";
				$(this).animate({
					"color": colors[Math.floor((Math.random() * 6) + 1)],
					"font-size": step + Math.floor((Math.random() * 4) + 1) + "px"
				}, 450, function () {
					$("#" + options.gridName + "load_div").animate({
						//                        "background-color": colors[Math.floor((Math.random() * 6) + 1)]
						"background-color": "#000000"
					}, 450, function () { if (status) { AnimatedLoadingText(element, text, status) } });
				});
			})
		} else {
			$("#" + options.gridName + "load_div").remove();
			//           isTextInitialized = false;
			runLoop = false;
		}
	}





	/************************************************************************************************************************************************************************
    ******* REGION EVENT HANDLERS ******************************************************************************************************************************************* 
    *************************************************************************************************************************************************************************
    ************************************************************************************************************************************************************************/


	///************************************************************************************
	//* Rolloever for page buttons
	//* NextPreviousFirstLastPager type
	//************************************************************************************/
	var NavButtonHover = function (event) {

		var navButOut = {
			fontFamily: "Webdings",
			marginLeft: "3px",
			borderLeft: "thin solid #ffffff",
			borderTop: "thin solid #ffffff",
			borderRight: "thin solid #c0c0c0",
			borderBottom: "thin solid #c0c0c0",
			cursor: "pointer"
		};

		var navButOver = {
			fontFamily: "Webdings",
			marginLeft: "3px",
			borderLeft: "thin solid #c0c0c0",
			borderTop: "thin solid #c0c0c0",
			borderRight: "thin solid #ffffff",
			borderBottom: "thin solid #ffffff",
			cursor: "pointer"
		};

		if (event.data.msg === "over") $(this).css(navButOver);
		if (event.data.msg === "out") $(this).css(navButOut);
	}; // end NavButtonHover


	///************************************************************************************
	//* Scrolls the header with the content
	//************************************************************************************/
	var ScrollHeader = function (event) {
		var header = $("#" + options.gridName + "GridHeaderWrapper");

		header.scrollLeft($(this).scrollLeft());
	};


	///************************************************************************************
	//* Descriptive text effect in search bar
	//************************************************************************************/
	var SetSearchBox = function (event) {

		event.stopPropagation();

		var mouseOut = {
			"border": "none",
			"color": "#d8d8d8",
			"font-style": "italic",
			"outline": "none"
		};

		var mouseOver = {
			"border": "none",
			"color": "#000000",
			//"font-style": "normal", // removed because if set causes a flicker and expands the search bar slightly
			"outline": "initial"
		};

		if (event.data.msg === "in") {
			if ($(this).val().trim() == "-search") $(this).val("");
			$(this).css(mouseOver);
		}
		if (event.data.msg === "out") {
			if ($(this).val().trim() == "") {
				$(this).val("-search");
				$(this).css(mouseOut);
			}
		}
	};


	///************************************************************************************
	//* Hides the grid (closes, but does not remove from DOM)
	//************************************************************************************/
	var Close = function (event) {
		var gridPos = $("#" + options.gridName).offset();
		var bottom = ($("#" + options.gridName).outerHeight() + gridPos.top);
		var bottomOut = ($(window).height() - bottom);

		event.stopPropagation();

		lastPosition = new Point();
		lastPosition.y = gridPos.top;
		lastPosition.x = gridPos.left;

		if (isShown) {

			$("#" + options.gridName).animate({
				top: "toggle",
				left: "toggle",
				opacity: 0,
				width: "toggle",
				duration: "slow"
			}, {
				complete: function () {
					if (options.isModal) $("#wrappie").css({ display: "none" });
				}
			});
		}

		isShown = false;
	};




	///************************************************************************************
	//* Highlights or un-highlights a row of data in the grid
	//************************************************************************************/
	var RowHover = function (event) {
		if ($(this).parent().attr("id") === currentSelected) return;

		if (event.data.msg === "over") {
			$(this).parent().css({ backgroundColor: "#c4dcf7" });
		}
		if (event.data.msg === "out") {
			$(this).parent().css({ "background-color": "" });
		}
	};


	///************************************************************************************
	//* Gets the row that is clicked on and creates an object from the row data
	//************************************************************************************/
	var CellClicked = function (event) {
		var rowDataObjs = [];
		var obj = new Object();
		var child = $(this).parent().children();
		var dataStr = "";
		var curPage = $("#" + options.gridName + "CurrentPageNumberInput").val();

		event.stopPropagation();

		$(this).parent().children().each(function (index) {
			//            var _key = $("#" + options.gridName + "GridHeader").contents().find("div").eq(index).text();
			var _key = $("#" + options.gridName + "GridHeader").children().find("div").eq(index).clone().children().remove().end().text(); // we need this to get text without sort glyph of column header
			var _val = $(this).children().text();

			obj[_key] = _val;
			rowDataObjs[index] = obj;

		});

		dataStr = JSON.stringify(rowDataObjs[0]);

		that.val = dataStr;

		dataStr = dataStr.replace("{", "");
		dataStr = dataStr.replace(/\:/g, "=");
		dataStr = dataStr.replace("}", "");

		$("#" + options.gridName + "SelectedItemDisplay").text(" On Page: " + curPage + " . " + dataStr);
		$("#" + options.gridName + "SelectedItemValue").val(rowDataObjs[0]);

		// check if a value container exists and populate it
		if (typeof options.valueContainer !== 'undefined') {
			var containerID = ("#" + options.valueContainer);

			// if a IdColumn is defined, just put that value in form object
			if (typeof options.idColumn !== 'undefined') {
				$.each(rowDataObjs[0], function (k, v) {
					console.log(k);
					if (k == options.idColumn) {
						$(containerID).val(v);
						//$("#<%= " + containerID + ".ClientID %>").val(v);
						//$(containerID).text(v);
						return;
					}
				});
			} else {
				// if a IdColumn is NOT defined, put entire value in form object
				$(containerID).val(dataStr);
			}
		}


		// unselect previous selected item
		if (currentSelected !== null) {
			$("#" + currentSelected).css({ backgroundColor: "" });
		}

		// select new item
		if (currentSelected !== $(this).parent().attr("id")) {
			$(this).parent().css({ backgroundColor: "#d8d8d8", border: "10px solid #0000cc" });
			currentSelected = $(this).parent().attr("id");

		} else {
			// unselect currently selected item if it is clicked while selected
			$(this).parent().css({ backgroundColor: "", border: "" });
			currentSelected = null;
			$("#" + options.gridName + "SelectedItemDisplay").text("");
			// clear the value container if selection is cleared
			if (typeof options.valueContainer !== 'undefined') {
				var containerID = ("#" + options.valueContainer);
				$(containerID).val("");
			}
		}

		if (options.closeOnSelect === true) Close(event);
	};



	///************************************************************************************
	//* Initiates the grabbing of title bar
	//************************************************************************************/
	function GrabIt(mouseEvent) {
		var origin = new Point(); // location of click event
		origin.x = mouseEvent.pageX;
		origin.y = mouseEvent.pageY;

		mouseEvent.stopPropagation();

		if (IsLocationInTitle(origin)) {
			ToggleDocumentSelection(false);

			$("#" + options.gridName + "Title").css({ "cursor": "pointer" });

			var objLoc = $("#" + options.gridName + "Title").offset();

			isGrabbed = true;

			mouseToObjOffset.x = (objLoc.left - mouseEvent.pageX);
			mouseToObjOffset.y = (objLoc.top - mouseEvent.pageY);
		}
	}



	///************************************************************************************
	//* Terminates the grabbing of the title bar
	//************************************************************************************/
	function DropIt(mouseEvent) {
		isGrabbed = false;

		mouseEvent.stopPropagation();

		ToggleDocumentSelection(true);

		$("#" + options.gridName + "Title").css({ "cursor": "default" });
	}



	///************************************************************************************
	//* Moves the grid if the title bar is grabbed
	//************************************************************************************/
	function MoveGridObject(mouseEvent) {
		if (!isGrabbed) return;

		mouseEvent.stopPropagation();

		var mouseLoc = new Point();
		var objLoc = $("#" + options.gridName + "Title").offset();
		var newPoint = new Point();

		mouseLoc.x = mouseEvent.pageX;
		mouseLoc.y = mouseEvent.pageY;

		newPoint.x = (mouseLoc.x + mouseToObjOffset.x);
		newPoint.y = (mouseLoc.y + mouseToObjOffset.y);

		$("#" + options.gridName).offset({ top: newPoint.y, left: newPoint.x });
	}



	///************************************************************************************
	//* Sets the filter to use for the data, and initiates the geting of the data
	//************************************************************************************/
	function GetFilteredData(event) {
		var val = $("[name = '" + options.gridName + "SearchText']").val();
		var type = $("input[type='radio'][name = '" + options.gridName + "SearchType']:checked").val();

		event.stopPropagation();

		if (val.trim() == "" || typeof val === 'undefined' || val == "-search") val = "*";

		options.requestSearchPattern = val;
		options.requestSearchType = type;

		currentPage = 0;

		SetPageCount();
		that.GetData();
	}



	///************************************************************************************
	//* Sets the filter to use for the data, and initiates the geting of the data
	//************************************************************************************/
	function HeaderMouseOver(event) {
		var outCss = {
			borderTop: "solid thin #ffffff",
			borderLeft: "solid thin #ffffff",
			borderBottom: "solid thin #848484",
			borderRight: "solid thin #848484"
		};
		var overCss = {
			borderTop: "solid thin #848484",
			borderLeft: "solid thin #848484",
			borderBottom: "solid thin #ffffff",
			borderRight: "solid thin #ffffff"
		};

		if (event.data.status == "over") {
			$(this).css(overCss);
		} else {
			$(this).css(outCss);
		}

	}


	///************************************************************************************
	//* Sets the filter to use for the data, and initiates the geting of the data
	//************************************************************************************/
	function SortByHeaderClick(event) {
		var sortId = $(this).children("div").text();

		event.stopPropagation();

		if (options.requestSort == sortId) return;

		options.requestSort = sortId;

		currentPage--;

		SetPageCount();
		that.GetData();
	}


	///************************************************************************************
	//* Animates an elements background color from transparent to black, back to transparent
	//************************************************************************************/
	function RunColors(event) {

		event.stopPropagation()

		$(this).animate({
			"background-color": "#000000"
		}, 450, function () {
			$(this).animate({
				"background-color": "transparent"
			}, 450);
		});
	}


	///************************************************************************************
	//* Sets the filter to use for the data, and initiates the geting of the data
	//************************************************************************************/
	function ReturnCurrentSelected() {
		//        if (typeof that.ValueContainer !== 'undefined') {
		//            var containerID2 = ("#" + that.ValueContainer); // same value container, just changed name to hush up VS error complaints
		//            $(containerID2).val($("#" + options.gridName + "SelectedItemValue").val())

		//        }



		//        // if a form object that can hold a value (like input box)
		//        // has been defined, put the value of the selected row in there
		//        if (typeof that.ValueContainer !== 'undefined') {
		//            var containerID = ("#" + that.ValueContainer);

		//            // if a IdColumn is defined, just put that value in form object
		//            if (typeof that.IdColumn !== 'undefined') {
		//                $.each(rowDataObjs[0], function (k, v) {
		//                    //result += k + " , " + v + "\n";
		//                    if (k == IdColumn) {
		//                        $(containerID).val(v); ;
		//                        return;
		//                    }
		//                });
		//            } else {
		//                // if a IdColumn is NOT defined, put entire value in form object
		//                $(containerID).val(dataStr);
		//            }
		//        }
	}





	/************************************************************************************************************************************************************************
    ******* REGION CREATE HTML ELEMENTS *************************************************************************************************************************************
    *************************************************************************************************************************************************************************
    ************************************************************************************************************************************************************************/




	///************************************************************************************
	//* Creates the entire window, including grid and any other items
	//************************************************************************************/
	function CreateGridWindow(container) {
		var dataGridWindow = document.createElement("div");
		var dataGrid = document.createElement("div");
		var modalWrapper;

		if (options.isModal) {
			modalWrapper = document.createElement("div");
			modalWrapper.setAttribute("id", "wrappie");
			$(modalWrapper).css({ position: "absolute", top: "0px", left: "0px", width: "100%", height: "100%", textAlign: "center", verticalAlign: "middle", backgroundColor: "", zIndex: "999" }); //9.518e23
			container = modalWrapper;
		}

		dataGridWindow.setAttribute("id", options.gridName);
		dataGrid.setAttribute("id", options.gridName + "gridArea");

		$(dataGridWindow).css({ "border": "thin solid #c0c0c0", "background-color": "#FAFAFA", "width": width, "height": "auto", "overflow": "hidden" });
		$(dataGrid).css({ "marginLeft": "5px", "marginRight": "5px", "marginBottom": "5px", "border": "thin solid #a4a4a4" });

		if (options.isModal) $(dataGridWindow).css({ margin: "auto auto" });

		AppendTitleBar(dataGridWindow);
		AppendSearchBar(dataGrid);
		AppendGridElement(dataGrid);
		AppendNextPreviousFirstLastPager(dataGrid);
		AppendGridFooter(dataGrid);

		$(dataGridWindow).append(dataGrid);

		AppendButtonArea(dataGridWindow);

		if (!options.isModal) $(container).append(dataGridWindow);

		if (options.isModal) {
			$(modalWrapper).append(dataGridWindow);
			$("body").append(modalWrapper);
		}


		/************************************************************
        *    Bind events
        ************************************************************/
		$("." + options.gridName + "NavBut").bind("mouseenter", { msg: "over" }, NavButtonHover);
		$("." + options.gridName + "NavBut").bind("mouseleave", { msg: "out" }, NavButtonHover);
		if (options.isModal) $(modalWrapper).bind("click", RunColors);
		if (options.isModal) $(dataGridWindow).bind("click", function (event) { event.stopPropagation() });
	} //end CreateGridWindow(container)


	///************************************************************************************
	//* Create and append the title bar
	//************************************************************************************/
	function AppendTitleBar(container) {
		var titleStyle = {
			borderBottom: "thin solid #a4a4a4",
			padding: "5px",
			backgroundColor: "#ced8f6"
		};

		var butStyle = {
			float: "right",
			fontFamily: "Webdings",
			border: "thin solid #c0c0c0",
			width: "25px",
			textAlign: "center",
			cursor: "pointer"
		};

		var titleBar = document.createElement("div");
		var titleText = document.createElement("span");
		var titleButton = document.createElement("span");

		titleBar.setAttribute("id", options.gridName + "Title");
		titleText.setAttribute("id", options.gridName + "TitleText");
		titleButton.setAttribute("id", options.gridName + "TitleButton");

		$(titleBar).css(titleStyle);
		$(titleButton).css(butStyle);

		$(titleBar).append(titleText);
		$(titleBar).append(titleButton);

		$(titleText).text(options.title);
		$(titleButton).text("r");

		$(container).append(titleBar);


		/************************************************************
        *    Bind events
        ************************************************************/
		$(titleBar).bind("mousedown", function (event) {
			GrabIt(event);
		});

		$(titleButton).bind("click", function (event) { Close(event) });
	} //end  AppendTitleBar(container)


	///************************************************************************************
	//* Create and append the search bar
	//************************************************************************************/
	function AppendSearchBar(container) {
		var searchBoxStyle = {
			backgroundColor: "#e9edf1",
			borderTop: "thin solid #a4a4a4",
			borderBottom: "thin solid #ffffff",
			width: "100%",
			textAlign: "right"
		};

		var searchWrappersStyle = {
			float: "none",
			display: "inline"
		};

		var searchboxWrapperStyle = {
			border: "thin solid #c0c0c0",
			float: "none",
			display: "inline",
			backgroundColor: "#ffffff"
		};

		var radioStyle = {
			marginLeft: "3px"
		};

		var marginStyle = {
			marginLeft: "5px",
			marginRight: "5px"
		};

		var butStyle = {
			padding: "0px",
			width: "25px",
			border: "1px solid #c0c0c0",
			backgroundColor: "#F2F2F2"
		};


		var searchBar = document.createElement("div");
		var searchStartsWrapper = document.createElement("div");
		var searchStarts = document.createElement("input");
		var searchContainsWrapper = document.createElement("div");
		var searchContain = document.createElement("input");
		var searchEndsWrapper = document.createElement("div");
		var searchEnds = document.createElement("input");
		var searchAllWrapper = document.createElement("div");
		var searchAll = document.createElement("input");
		var searchBoxWrapper = document.createElement("div");
		var searchText = document.createElement("input");
		var searchBut = document.createElement("button");
		var searchStartsWrapperText = document.createTextNode("Starts With");
		var searchContainsWrapperText = document.createTextNode("Contains");
		var searchEndsWrapperText = document.createTextNode("Ends With");
		var searchAllWrapperText = document.createTextNode("All");
		var searchButText = document.createTextNode("GO");

		searchBar.setAttribute("id", options.gridName + "searchBar");

		searchStartsWrapper.setAttribute("id", options.gridName + "SearchStartsWrapper");
		searchStarts.setAttribute("id", options.gridName + "SearchStarts");
		searchStarts.setAttribute("name", options.gridName + "SearchType");
		searchStarts.setAttribute("type", "radio");
		searchStarts.setAttribute("value", "begins");

		searchContainsWrapper.setAttribute("id", options.gridName + "SearchContainsWrapper");
		searchContain.setAttribute("id", options.gridName + "SearchContain");
		searchContain.setAttribute("name", options.gridName + "SearchType");
		searchContain.setAttribute("type", "radio");
		searchContain.setAttribute("value", "contains");
		searchContain.setAttribute("checked", "true");

		searchEndsWrapper.setAttribute("id", options.gridName + "SearchEndsWrapper");
		searchEnds.setAttribute("id", options.gridName + "SearchEnds");
		searchEnds.setAttribute("name", options.gridName + "SearchType");
		searchEnds.setAttribute("type", "radio");
		searchEnds.setAttribute("value", "ends");

		searchAllWrapper.setAttribute("id", options.gridName + "SearchAllWrapper");
		searchAll.setAttribute("id", options.gridName + "SearchAll");
		searchAll.setAttribute("name", options.gridName + "SearchType");
		searchAll.setAttribute("type", "radio");
		searchAll.setAttribute("value", "");

		searchBoxWrapper.setAttribute("id", options.gridName + "SearchBoxWrapper");
		searchText.setAttribute("type", "text");
		searchText.setAttribute("name", options.gridName + "SearchText");
		searchText.setAttribute("id", options.gridName + "SearchText");
		searchText.setAttribute("value", "-search");

		searchBut.setAttribute("name", options.gridName + "SearchBut");
		searchBut.setAttribute("id", options.gridName + "SearchBut");
		searchBut.setAttribute("type", "button");
		searchBut.setAttribute("value", "search");

		$(searchBar).css(searchBoxStyle);
		$(searchStartsWrapper).css(searchWrappersStyle);
		$(searchStartsWrapper).css(marginStyle);
		$(searchContainsWrapper).css(searchWrappersStyle);
		$(searchContainsWrapper).css(marginStyle);
		$(searchEndsWrapper).css(searchWrappersStyle);
		$(searchEndsWrapper).css(marginStyle);
		$(searchAllWrapper).css(searchWrappersStyle);
		$(searchAllWrapper).css(marginStyle);
		$(searchBoxWrapper).css(searchboxWrapperStyle);
		$(searchBoxWrapper).css(marginStyle);
		$(searchBoxWrapper).css({ padding: "3px", overflow: "hidden", "height": "auto" });
		$(searchStarts).css(radioStyle);
		$(searchContain).css(radioStyle);
		$(searchEnds).css(radioStyle);
		$(searchAll).css(radioStyle);
		$(searchText).css({ "border": "none", "font-size": "-2px", "color": "#d8d8d8", "font-style": "italic", "outline": "none" });
		$(searchBut).css(butStyle);

		$(searchStartsWrapper).append(searchStartsWrapperText);
		$(searchContainsWrapper).append(searchContainsWrapperText);
		$(searchEndsWrapper).append(searchEndsWrapperText);
		$(searchAllWrapper).append(searchAllWrapperText);
		$(searchBut).append(searchButText);

		$(searchStartsWrapper).append(searchStarts);
		$(searchContainsWrapper).append(searchContain);
		$(searchEndsWrapper).append(searchEnds);
		$(searchAllWrapper).append(searchAll);
		$(searchBoxWrapper).append(searchText);
		$(searchBoxWrapper).append(searchBut);

		$(searchBar).append(searchStartsWrapper);
		$(searchBar).append(searchContainsWrapper);
		$(searchBar).append(searchEndsWrapper);
		$(searchBar).append(searchAllWrapper);
		$(searchBar).append(searchBoxWrapper);

		$(container).append(searchBar);


		/************************************************************
        *    Bind events
        ************************************************************/
		$(searchText).bind("focusin", { msg: "in" }, SetSearchBox);
		$(searchText).bind("blur", { msg: "out" }, SetSearchBox);
		$(searchBut).bind("click", GetFilteredData);
	} //end  AppendSearchBar(container)


	///************************************************************************************
	//* Create and append the grid
	//************************************************************************************/
	function AppendGridElement(container) {
		var gridElement = document.createElement("div");
		var gridHeaderWrapper = document.createElement("div");
		var gridDataWrapper = document.createElement("div");
		var gridHeader = document.createElement("table");
		var gridData = document.createElement("table");

		gridElement.setAttribute("id", options.gridName + "GridElement");
		gridHeaderWrapper.setAttribute("id", options.gridName + "GridHeaderWrapper");
		gridDataWrapper.setAttribute("id", options.gridName + "GridDataWrapper");
		gridHeader.setAttribute("id", options.gridName + "GridHeader");
		gridData.setAttribute("id", options.gridName + "GridData");

		$(gridHeaderWrapper).css({ "overflow": "hidden" });
		$(gridDataWrapper).css({ "overflow": "scroll", "height": height + "px" });
		$(gridHeader).css({ "width": "auto", "table-layout": "fixed", "border-collapse": "separate", "border-spacing": "2px" });
		$(gridData).css({ "width": "auto", "table-layout": "fixed", "border-collapse": "separate", "border-spacing": "2px", zIndex: "99" });

		$(gridHeaderWrapper).append(gridHeader);
		$(gridDataWrapper).append(gridData);

		$(gridElement).append(gridHeaderWrapper);
		$(gridElement).append(gridDataWrapper);

		$(container).append(gridElement);


		/************************************************************
        *    Bind events
        ************************************************************/
		$(gridDataWrapper).bind("scroll", ScrollHeader);
	}


	///************************************************************************************
	//* Create and append the NextPreviousFirstLastPager
	//************************************************************************************/
	function AppendNextPreviousFirstLastPager(container) {
		var pagerBarStyle = {
			backgroundColor: "#e9edf1",
			border: "thin solid #a4a4a4",
			padding: "3px"
		};

		var navButStyle = {
			fontFamily: "Webdings",
			marginLeft: "3px",
			borderLeft: "thin solid #ffffff",
			borderTop: "thin solid #ffffff",
			borderRight: "thin solid #c0c0c0",
			borderBottom: "thin solid #c0c0c0",
			cursor: "pointer"
		};

		var itemStyle = {
			marginLeft: "5px",
			marginRight: "5px",
			cursor: "default"
		};

		var gridPagerBar = document.createElement("div");
		var firstBut = document.createElement("span");
		var previousBut = document.createElement("span");
		var separator1 = document.createElement("span");
		var pageDesc = document.createElement("span");
		var currentPageNumber = document.createElement("span");
		var currentPageNumberInput = document.createElement("input");
		var ofPage = document.createElement("span");
		var maxPage = document.createElement("span");
		var separator2 = document.createElement("span");
		var nextBut = document.createElement("span");
		var lastBut = document.createElement("span");

		var firstButText = document.createTextNode("9"); // webdings
		var previousButText = document.createTextNode("3"); // webdings
		var separator1Text = document.createTextNode("|");
		var pageDescText = document.createTextNode("Page");
		var ofPageText = document.createTextNode("Of");
		var maxPageText = document.createTextNode("1");
		var separator2Text = document.createTextNode("|");
		var nextButText = document.createTextNode("4"); // webdings
		var lastButText = document.createTextNode(":"); // webdings

		gridPagerBar.setAttribute("id", options.gridName + "GridPagerBar");
		firstBut.setAttribute("id", options.gridName + "FirstBut");
		firstBut.setAttribute("class", options.gridName + "NavBut");
		firstBut.setAttribute("value", "first");
		previousBut.setAttribute("id", options.gridName + "PreviousBut");
		previousBut.setAttribute("class", options.gridName + "NavBut");
		previousBut.setAttribute("value", "previous");
		separator1.setAttribute("id", options.gridName + "Separator1");
		pageDesc.setAttribute("id", options.gridName + "PageDesc");
		currentPageNumber.setAttribute("id", options.gridName + "currentPageNumber");
		currentPageNumberInput.setAttribute("type", "text");
		currentPageNumberInput.setAttribute("name", options.gridName + "CurrentPageNumberInput");
		currentPageNumberInput.setAttribute("id", options.gridName + "CurrentPageNumberInput");
		currentPageNumberInput.setAttribute("value", "1");
		currentPageNumberInput.setAttribute("size", "4");
		ofPage.setAttribute("id", options.gridName + "OfPage");
		maxPage.setAttribute("id", options.gridName + "MaxPage");
		separator2.setAttribute("id", options.gridName + "Separator2");
		nextBut.setAttribute("id", options.gridName + "NextBut");
		nextBut.setAttribute("class", options.gridName + "NavBut");
		nextBut.setAttribute("value", "next");
		lastBut.setAttribute("id", options.gridName + "LastBut");
		lastBut.setAttribute("class", options.gridName + "NavBut");
		lastBut.setAttribute("value", "last");

		$(gridPagerBar).css(pagerBarStyle);

		$(currentPageNumber).append(currentPageNumberInput);

		$(firstBut).append(firstButText);
		$(previousBut).append(previousButText);
		$(separator1).append(separator1Text);
		$(pageDesc).append(pageDescText);
		$(ofPage).append(ofPageText);
		$(maxPage).append(maxPageText);
		$(separator2).append(separator2Text);
		$(nextBut).append(nextButText);
		$(lastBut).append(lastButText);

		$(firstBut).css(navButStyle);
		$(previousBut).css(navButStyle);
		$(previousBut).css({ "margin-right": "5px" });
		$(separator1).css(itemStyle);
		$(pageDesc).css(itemStyle);
		$(currentPageNumberInput).css(itemStyle);
		$(ofPage).css(itemStyle);
		$(maxPage).css(itemStyle);
		$(separator2).css(itemStyle);
		$(nextBut).css(navButStyle);
		$(lastBut).css(navButStyle);

		$(gridPagerBar).append(firstBut);
		$(gridPagerBar).append(previousBut);
		$(gridPagerBar).append(separator1);
		$(gridPagerBar).append(pageDesc);
		$(gridPagerBar).append(currentPageNumber);
		$(gridPagerBar).append(ofPage);
		$(gridPagerBar).append(maxPage);
		$(gridPagerBar).append(separator2);
		$(gridPagerBar).append(nextBut);
		$(gridPagerBar).append(lastBut);

		$(container).append(gridPagerBar);


		/************************************************************
        *    Bind events
        ************************************************************/
		$(firstBut).bind("click", function () {
			event.stopPropagation();
			currentPage = 0;
			that.GetData();
		});
		$(previousBut).bind("click", function () {
			event.stopPropagation();
			if (currentPage == 1) return;
			currentPage -= 2;
			that.GetData();
		});
		$(nextBut).bind("click", function () {
			event.stopPropagation();
			if (currentPage == eval($("#" + options.gridName + "MaxPage").text())) return;
			that.GetData();
		});
		$(lastBut).bind("click", function () {
			event.stopPropagation();
			currentPage = eval($("#" + options.gridName + "MaxPage").text()) - 1;
			that.GetData();
		});

		$(currentPageNumberInput).bind("keypress", function (event) {
			event.stopPropagation();
			if (event.which == 13) {
				currentPage = eval($("#" + options.gridName + "CurrentPageNumberInput").val() - 1);
				that.GetData();
			}
		});

	} // end AppendNextPreviousFirstLastPager(container)


	///************************************************************************************
	//* Create and append the grid footer. This shows the currently selected item
	//************************************************************************************/
	function AppendGridFooter(container) {
		var gridFooter = document.createElement("div");
		var selectedItemLabel = document.createElement("span");
		var selectedItemDisplay = document.createElement("span");
		var selectedItemValue = document.createElement("input");
		var selectedItemLabelText = document.createTextNode("Selected");

		gridFooter.setAttribute("id", options.gridName + "GridFooter");
		selectedItemLabel.setAttribute("id", options.gridName + "SelectedItemLabel");
		selectedItemDisplay.setAttribute("id", options.gridName + "SelectedItemDisplay");
		selectedItemValue.setAttribute("id", options.gridName + "SelectedItemValue");
		selectedItemValue.setAttribute("name", options.gridName + "SelectedItemValue");
		selectedItemValue.setAttribute("type", "hidden");

		$(selectedItemValue).val(" ");

		$(gridFooter).css({ "padding": "3px", "background-color": "#ffffff", "overflow-wrap": "break-word", "overflow": "auto" });
		$(selectedItemLabel).css({ "fontWeight": "bold" });
		$(selectedItemDisplay).css({ padding: "2px", margin: "2px" });

		$(selectedItemLabel).append(selectedItemLabelText);

		$(gridFooter).append(selectedItemLabel);
		$(gridFooter).append(selectedItemDisplay);
		$(gridFooter).append(selectedItemValue);

		$(container).append(gridFooter);
	}


	///************************************************************************************
	//* Create and append the area which contains the ok and cancel buttons
	//************************************************************************************/
	function AppendButtonArea(container) {
		var butStyle = {
			//float: "right",
			marginRight: "5px",
			marginBottom: "5px",
			width: "75px",
			border: "thin solid #a4a4a4",
			cursor: "pointer"
		}

		var buttonArea = document.createElement("div");
		var okBut = document.createElement("button");
		var cancelBut = document.createElement("button");
		var okButText = document.createTextNode("Ok");
		var cancelButText = document.createTextNode("Cancel");

		buttonArea.setAttribute("id", options.gridName + "ButtonArea");
		okBut.setAttribute("id", options.gridName + "OkBut");
		okBut.setAttribute("name", options.gridName + "OkBut");
		okBut.setAttribute("type", "button");
		okBut.setAttribute("value", "ok");
		cancelBut.setAttribute("id", options.gridName + "CancelBut");
		cancelBut.setAttribute("name", options.gridName + "CancelBut");
		cancelBut.setAttribute("type", "button");
		cancelBut.setAttribute("value", "cancel");

		$(buttonArea).css({ "textAlign": "right", "display": "none" });
		$(okBut).css(butStyle);
		$(cancelBut).css(butStyle);

		$(okBut).append(okButText);
		$(cancelBut).append(cancelButText);

		$(buttonArea).append(okBut);
		$(buttonArea).append(cancelBut);

		$(container).append(buttonArea);


		/************************************************************
        *    Bind events
        ************************************************************/
		$(cancelBut).bind("click", function (event) { Close(event) });
		$(okBut).bind("click", ReturnCurrentSelected);
	}

}// end DataGrid



/************************************************************************************
* Represents a pair of Coordinates x and y
* Must be instantiated.
************************************************************************************/
function Point() {
	this.y = null;
	this.x = null;
}




/************************************************************************************
* Represents options for the grid
* Must be instantiated.
************************************************************************************/
function GridOptions() {
		this.gridName= "DataGrid" + new Date().getTime();
		this.title = "Select a Record";
		this.pageMax = 25;
		this.requestUrl = null;
		this.requestCdgc = null;
		this.requestSort = null;
		this.requestFirstRecord = 0;
		this.requestLastRecord = -1;
		this.requestSearchPattern = "";
		this.requestSearchType = null;
		this.requestSort = "";
		this.width = 600;
		this.gridHeight = 300;
		this.startPage = 0;
		this.isModal = true;
		this.deleteOnClose = false;
		this.valueContainer = "";
		this.dataId = "";
		this.closeOnSelect = true
	};