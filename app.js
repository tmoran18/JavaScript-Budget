// These are the three different Modules are wrapped in an IIFE allowing for
// public and private functions

/******BUDGET CONTROLLER********/
var budgetController = (function() {
   // Function constructors for Expense Object
   var Expense = function(id, description, value) {
      this.id = id;
      this.description = description;
      this.value = value;
      this.percentage = -1;
   };

   // Calculate the budget percentages
   Expense.prototype.calcPercentage = function(totalIncome) {
      if (totalIncome > 0) {
         this.percentage = Math.round((this.value / totalIncome) * 100);
      } else {
         this.percentage = -1;
      }
   };

   // Return the budget percentages
   Expense.prototype.getPercentage = function() {
      return this.percentage;
   };

   // Function constructors for Income Object
   var Income = function(id, description, value) {
      this.id = id;
      this.description = description;
      this.value = value;
   };

   var calculateTotal = function(type) {
      var sum = 0;
      data.allItems[type].forEach(function(cur) {
         sum += cur.value;
      });
      data.totals[type] = sum;
   };

   // Object holding the data
   var data = {
      allItems: {
         exp: [],
         inc: []
      },
      totals: {
         exp: 0,
         inc: 0
      },
      budget: 0,
      percentage: -1
   };

   return {
      addItem: function(type, des, val) {
         var newItem, ID;

         // create new ID -- ID = last ID + 1
         if (data.allItems[type].length > 0) {
            ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
         } else {
            ID = 0;
         }

         // Create new item based on 'inc' or 'exp' type
         if (type === "exp") {
            newItem = new Expense(ID, des, val);
         } else if (type === "inc") {
            newItem = new Income(ID, des, val);
         }

         // The array from the allItems oject is selected then new data will be pushed to the exp or inc array depending on the if statement.
         data.allItems[type].push(newItem);

         // Return the new element
         return newItem;
      },

      // This functions loops over allitems ID array.
      deleteItem: function(type, id) {
         var ids, index;

         ids = data.allItems[type].map(function(current) {
            return current.id;
         });

         index = ids.indexOf(id);

         if (index !== -1) {
            data.allItems[type].splice(index, 1);
         }
      },

      calculateBudget: function() {
         // calculate total income and expenses
         calculateTotal("exp");
         calculateTotal("inc");

         // calculate the budget: income - expenses
         data.budget = data.totals.inc - data.totals.exp;

         // calculate the percentage of income that we spent
         if (data.totals.inc > 0) {
            data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
         } else {
            data.percentage = -1;
         }
      },

      calculatePercentages: function() {
         data.allItems.exp.forEach(function(cur) {
            cur.calcPercentage(data.totals.inc);
         });
      },

      getPercentages: function() {
         var allPerc = data.allItems.exp.map(function(cur) {
            return cur.getPercentage();
         });
         return allPerc;
      },

      getBudget: function() {
         return {
            budget: data.budget,
            totalInc: data.totals.inc,
            totalExp: data.totals.exp,
            percentage: data.percentage
         };
      },

      testing: function() {
         console.log(data);
      }
   };
})();

/******UI CONTROLLER********/
var UIController = (function() {
   // An object containing HTML element being used in the DOM manipulation in grabbing the input data.
   var DOMstrings = {
      inputType: ".add__type",
      inputDescription: ".add__description",
      inputValue: ".add__value",
      inputBtn: ".add__btn",
      incomeContainer: ".income__list",
      expensesContainer: ".expenses__list",
      budgetLabel: ".budget__value",
      incomeLabel: ".budget__income--value",
      expensesLabel: ".budget__expenses--value",
      percentageLabel: ".budget__expenses--percentage",
      container: ".container",
      expensesPercLabel: ".item__percentage",
      dateLabel: ".budget__title--month"
   };

   var formatNumber = function(num, type) {
      var numSplit, int, dec, type;
      /*
    Formatting the numbers
    + or - before each number
    number to exactly 2 decimals places
    comma seperating the thousands
    */

      num = Math.abs(num);
      num = num.toFixed(2);
      // Splits the number string up between the decimal place
      numSplit = num.split(".");
      // Save anything above decimal in the int and all decimals in dec
      int = numSplit[0];
      if (int.length > 3) {
         int = int.substr(0, int.length - 3) + "," + int.substr(int.length - 3, 3);
      }
      dec = numSplit[1];

      return (type === "exp" ? "-" : "+") + " " + int + "." + dec;
   };

   // Loops over the list, each iteration calls the callback function
   var nodeListForEach = function(list, callback) {
      for (var i = 0; i < list.length; i++) {
         callback(list[i], i);
      }
   };

   //First method being used in the **ctrlAddItem** function
   //This first return is returning a global object. The return inside the getInput is returning an object with the three inputs being collected.
   return {
      getInput: function() {
         return {
            type: document.querySelector(DOMstrings.inputType).value, // This will grab either inc or exp
            description: document.querySelector(DOMstrings.inputDescription).value, // This will grab the income description
            value: parseFloat(document.querySelector(DOMstrings.inputValue).value) // This will grab the value field - Parse float will convert the string to an int
         };
      },

      addListItem: function(obj, type) {
         var html, newHtml, element;
         // Create HTML string with placeholder text
         if (type === "inc") {
            element = DOMstrings.incomeContainer;
            html =
               '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
         } else if (type === "exp") {
            element = DOMstrings.expensesContainer;
            html =
               '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
         }
         // Replace the placeholder text with some actual data
         newHtml = html.replace("%id%", obj.id);
         newHtml = newHtml.replace("%description%", obj.description);
         newHtml = newHtml.replace("%value%", formatNumber(obj.value, type));

         // Insert the HTML into the DOM.. insertAdjacentHTML.beforeend will insert as last child in the classes income__list or expense__list depending on the if statement
         document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
      },

      // Remove and item from the UI
      // This has to be done by traversing up into the parent node to then select the child node
      deleteListItem: function(selectorID) {
         var el = document.getElementById(selectorID);
         el.parentNode.removeChild(el);
      },

      // Clear the input fields
      clearFields: function() {
         var fields, fieldsArr;

         fields = document.querySelectorAll(
            DOMstrings.inputDescription + ", " + DOMstrings.inputValue
         );

         // Convery the fields query selector into an array by using the prototype Array function constructor
         fieldsArr = Array.prototype.slice.call(fields);
         fieldsArr.forEach(function(current, index, array) {
            current.value = "";
         });
         // Set the focus back to description
         fieldsArr[0].focus();
      },

      displayBudget: function(obj) {
         var type;
         obj.budget > 0 ? (type = "inc") : (type = "exp");
         document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(
            obj.budget,
            type
         );
         document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(
            obj.totalInc,
            "inc"
         );
         document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(
            obj.totalExp,
            "exp"
         );

         if (obj.percentage > 0) {
            document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + "%";
         } else {
            document.querySelector(DOMstrings.percentageLabel).textContent = "---";
         }
      },
      displayPercentages: function(percentages) {
         var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

         // When this is called a callback function is parsed into it which is assigned to the callback argument in the nodeListForEach method
         nodeListForEach(fields, function(current, index) {
            if (percentages[index] > 0) {
               current.textContent = percentages[index] + "%";
            } else {
               current.textContent = "---";
            }
         });
      },

      displayMonth: function() {
         var now, year, months, month;
         now = new Date();
         months = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December"
         ];
         month = now.getMonth();
         year = now.getFullYear();
         document.querySelector(DOMstrings.dateLabel).textContent = months[month] + " " + year;
      },

      // The function used to change the colour outline of the change event listener
      changedType: function() {
         var fields = document.querySelectorAll(
            DOMstrings.inputType + "," + DOMstrings.inputDescription + "," + DOMstrings.inputValue
         );

         nodeListForEach(fields, function(cur) {
            cur.classList.toggle("red-focus");
         });

         document.querySelector(DOMstrings.inputBtn).classList.toggle("red");
      },

      // Makes the DOM string object globally accessible
      getDOMstrings: function() {
         return DOMstrings;
      }
   };
})();

/******GLOBAL APP CONTROLLER********/
var controller = (function(budgetCtrl, UICtrl) {
   var setupEventListeners = function() {
      //Accessing the DOMstrings object in UI controller
      var DOM = UICtrl.getDOMstrings();
      // Event handler for the click when the tick button is clicked
      document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem);
      // Event listener for pressing the enter key
      document.addEventListener("keypress", function(event) {
         if (
            event.keyCode === 13 ||
            event.which ===
               13 /*This is for older browsers or browsers that dont have keycode property*/
         ) {
            ctrlAddItem();
         }
      });
      // Event listener on the container in the HTML - EVENT DELETGATION - BUBBLING
      document.querySelector(DOM.container).addEventListener("click", ctrlDeleteItem);
      // Change event, turn the border to red when selecting the expenses
      document.querySelector(DOM.inputType).addEventListener("change", UICtrl.changedType);
   };

   var updateBudget = function() {
      // 1. Calculate the budget
      budgetCtrl.calculateBudget();
      // 2. Return the budget
      var budget = budgetCtrl.getBudget();
      // 3. Display the budget on the UI
      UICtrl.displayBudget(budget);
   };

   var updatePercentages = function() {
      //1. Calculate percentages
      budgetCtrl.calculatePercentages();
      //2. Read percentages from the budget controller
      var percentages = budgetCtrl.getPercentages();
      //3. Update the UI with the new percentages
      UICtrl.displayPercentages(percentages);
   };

   // Function for the event listeners for getting input data.
   var ctrlAddItem = function() {
      var input, newItem;
      // 1. Get the field input data
      input = UICtrl.getInput();
      // Check to see if user has entered data into fields. Not = to empty string, not NaN and greater than 0.
      if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
         // 2. Add the item to the budget controller
         newItem = budgetCtrl.addItem(input.type, input.description, input.value);
         // 3. Add the new item to the UI
         UICtrl.addListItem(newItem, input.type);
         // 4. Clear the fields
         UICtrl.clearFields();
         // 5. Calculate and update the budget
         updateBudget();
         // 6. Calculate and update percentages
         updatePercentages();
      }
   };

   // Event function for clicking on the close ICON
   var ctrlDeleteItem = function(event) {
      var itemID, splitID, type, ID;
      // Traverses the DOM up to the parent container - EVENT DELEGATION BUBBLING
      itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

      // Takes the unique income/expense object ID and splits it up
      if (itemID) {
         splitID = itemID.split("-");
         type = splitID[0];
         // Parse Int converts ID which is a string to an interger
         ID = parseInt(splitID[1]);

         // 1. Dlete item from the data structure
         budgetCtrl.deleteItem(type, ID);
         // 2. Delete the item from the UI
         UICtrl.deleteListItem(itemID);
         // 3. Update and show the new budget
         updateBudget();
      }
   };

   // All the functions that will setup the app when starting.
   return {
      init: function() {
         console.log("Application has been started");
         UICtrl.displayMonth();
         UICtrl.displayBudget({
            budget: 0,
            totalInc: 0,
            totalExp: 0,
            percentage: -1
         });
         setupEventListeners();
      }
   };
})(budgetController, UIController);

controller.init();
