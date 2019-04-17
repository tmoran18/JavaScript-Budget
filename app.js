// These are the three different Modules are wrapped in an IIFE allowing for public and private functions

/******BUDGET CONTROLLER********/
var budgetController = (function() {
  
  // Function constructors for Expense Object
    var Expense = function(id, description, value){
      this.id = id;
      this.description = description;
      this.value = value;
    };

    // Function constructors for Income Object
    var Income = function(id, description, value){
      this.id = id;
      this.description = description;
      this.value = value;
    };
    
    // Object holding the data 
    var data = {
      allItems: {
          exp: [],
          inc: []
      },
      totals:{
        exp: 0,
        inc: 0
      }
    };

    return {
      addItem: function(type, des, val){

        var newItem, ID;

        // create new ID -- ID = last ID + 1
        if (data.allItems[type].length > 0 ){
          ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
        } else {
          ID = 0;
        }

        // Create new item based on 'inc' or 'exp' type
        if (type === 'exp') {
            newItem = new Expense(ID, des, val);
        } else if (type === 'inc') {
            newItem = new Income(ID, des, val);
        }

        // The array from the allItems oject is selected then new data will be pushed to the exp or inc array depending on the if statement.
        data.allItems[type].push(newItem);

        // Return the new element
        return newItem;
      },
      testing: function (){
        console.log(data);
      }
    };
})();

/******UI CONTROLLER********/
var UIController = (function() {
  // An object containing HTML element being used in the DOM manipulation in grabbing the input data.
  var DOMstrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputBtn: '.add__btn',
    incomeContainer: '.income__list',
    expensesContainer: '.expenses__list'
  };

  //First method being used in the **ctrlAddItem** function
  //This first return is returning a global object. The return inside the getInput is returning an object with the three inputs being collected.
  return {
    getInput: function() {
      return {
        type: document.querySelector(DOMstrings.inputType).value, // This will grab either inc or exp
        description: document.querySelector(DOMstrings.inputDescription).value, // This will grab the income description
        value: document.querySelector(DOMstrings.inputValue).value // This will grab the value field
      };
    },

    addListItem: function(obj, type){
      var html, newHtml, element;
      // Create HTML string with placeholder text
      if(type === 'inc'){
        element = DOMstrings.incomeContainer;
        html = '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else if (type === 'exp'){
        element = DOMstrings.expensesContainer;
        html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }
      // Replace the placeholder text with some actual data
      newHtml = html.replace('%id%', obj.id);
      newHtml = newHtml.replace('%description%', obj.description);
      newHtml = newHtml.replace('%value%', obj.value);

      // Insert the HTML into the DOM.. insertAdjacentHTML.beforeend will insert as last child in the classes income__list or expense__list depending on the if statement
      document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
    },
    // Clear the input fields
    clearFields: function(){
      var fields, fieldsArr;

      fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
      
      // Convery the fields query selector into an array by using the prototype Array function constructor
      fieldsArr = Array.prototype.slice.call(fields);
      fieldsArr.forEach(function(current, index, array) {
        current.value = "";
      });
      // Set the focus back to description
      fieldsArr[0].focus();
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
      if (event.keyCode === 13 || event.which === 13 /*This is for older browsers or browsers that dont have keycode property*/) {
        ctrlAddItem();
      }
    });
  };
 
  // Function for the event listeners for getting input data.
  var ctrlAddItem = function() {
    var input, newItem;
    // 1. Get the field input data
    input = UICtrl.getInput();
    // 2. Add the item to the budget controller
    newItem = budgetCtrl.addItem(input.type, input.description, input.value);
    // 3. Add the new item to the UI
    UICtrl.addListItem(newItem, input.type);
    // 4. Clear the fields
    UICtrl.clearFields();
    // 5. Calc the budget
    // 6. Display the budget on the UI
  };

  // All the functions that will setup the app when starting.
  return {
      init: function(){
          console.log('Application has been started');
          setupEventListeners();
      }
  };
})(budgetController, UIController);

controller.init();