//TO DO LIST 

//1. Add even handler on HTMLButtonElement

//2. Get data from input HTMLFieldSetElement

//3. Add the new item to our data structure

//4. Add the new item to the UI

//5. Calculate the budget

//6. Update the budget UI

//Modules - way to structure code 
//So in ou case there will be two modules:

//UI Module : 2,4,6                                    
//Data Module: 3,5
//Controller: 1

//Lets create module example
//so publicTest uses x and add which are private and in the scope of IIFE
//These modules are independent and there wont be any interaction between them unless we want to

//Budget controller (data model as well)
var budgetController = (function() {
    
    
    //Function-constructor for Exprenses
    var Expense = function(id, description,value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    
    Expense.prototype.calcPercentage = function(totalIncome) {
        if(totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome)*100);
        } else {
            this.percentage = -1;
        }
    };
   
    Expense.prototype.getPercentage = function() {
        return this.percentage;
    }
       
    var Income = function(id, description,value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    //One object for all data sctructures
    var data = {
        allItems : {
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
        
    var calculateTotal = function(type) {
            
        var sum = 0;
        data.allItems[type].forEach(function(cur) {
            
            sum +=+ cur.value;
        });
        
        data.totals[type] = sum;
        };
    
    return {
        addItem: function(type, des, val) {
            
            var newItem,ID;
            
            //ID = last ID + 1
            //Create new ID
            if(data.allItems[type].length === 0) {
                ID = 0;
            } else {
                ID = data.allItems[type][data.allItems[type].length-1].id + 1;
            }

            //Create new item based on 'ink' or 'exp' type
            if(type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if(type === 'inc') {
                newItem = new Income(ID, des, val);
            }  
            
            //Push it into data structure
            data.allItems[type].push(newItem);
            
            //Return new element
            return newItem;

        },
        
        deleteItem: function(type, id) {
            var ids, index;
            // ids =  [1 2 4 6 8] imagine we want to delete 6, then index of 6 = 3
            // map return new array
            ids = data.allItems[type].map(function(current) {
                return current.id;
            });
            
            index = ids.indexOf(id);
            
            if(index !== -1) {
                //splice no slice! splice is used to remove elements; slice to remove copies
                data.allItems[type].splice(index, 1); //delete 1 element at index
            }
            
        },
        
        calculateBudget: function() {
            
            
            // Calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');
        
            // Calculate the budget: income - expenses
            
            data.budget = data.totals.inc - data.totals.exp;
        
            // Calculate the percentage of income that we spent
            if(data.totals.inc > data.totals.exp) {
                data.percentage = Math.round((data.totals.exp/data.totals.inc)*100);
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
            //map returns something and stores it in a variable while forEach does not
            
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
            }
        },
        
        testing: function() {
            console.log(data);
        }
    }

})()

//UI controller

var UIController = (function() { 
    //Some code
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputButton: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: ".budget__value",
        incomeLabel: ".budget__income--value",
        expensesLabel: ".budget__expenses--value",
        percentageExpLabel: ".budget__expenses--percentage",
        container: '.container',
        expensesPercentageLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };
    
    var formatNumber =  function(num, type) {
            var numSplit, int, dec;
            //+ or - before the number
            //exactly 2 decimal points
            //thousand separation by comma
            // 2310.4567 -> + 2,310.46
            
            num = Math.abs(num);
            num = num.toFixed(2); //Formatting number to two decimal points after comma. String and numbers can also have prototypes even if they primitives data types
            //If we use these methods on them JS automatically converts these methods to objects
            
            numSplit = num.split('.');
            
            int = numSplit[0];
            if(int.length > 3) {
                int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, int.length) ; //input 2310, output 2,310
            }
            dec = numSplit[1];
            //ternary operator
            //return bunch of strings
            return (type === 'exp' ? sign = '-' : sign = '+') + ' ' + int + '.' + dec;
            
        };
    
    var nodeListForEach = function(list, callback) {
                
                for(var i = 0; i < list.length; i++) {
                    callback(list[i], i);
                }
                
            };
    
    return {
        getInput: function() {
            return {
                type: document.querySelector(DOMstrings.inputType).value, //Will be either ink or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
            
        },
        getDOMstrings: function() {
            return DOMstrings;
        },
        displayPercentages: function(percentages) {
            //What selector will return is a node list. Nodes are the elements of HTML in a DOM tree. Node list doesnt have forEach method. WE can convert nodelist using slice method
            var fields = document.querySelectorAll(DOMstrings.expensesPercentageLabel);
            
            //Instead let create our own forEach function for nodelists
 
            nodeListForEach(fields, function(current, index) {

                if(percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
            
        },
        addListItem: function(obj, type) {
            var html, newHtml, element;
            //Create HTML string with placeholder text
            if(type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
                    
            //Replace placeholder text with some actual data
            newHtml = html.replace('%id%',obj.id);
            newHtml = newHtml.replace('%description%',obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
        
    
            //Insert HTML into the DOM (using insertAdjacentHTML method)
            
            document.querySelector(element).insertAdjacentHTML('beforeend',newHtml)
        
            
        },
        displayMonth: function() {
            var now, year, month, months;
            now = new Date();
            year = now.getFullYear();
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year ;
        },
        deleteListItem: function(selectorID) {
            //In JS we can only remove a child - so we traverse to parent node and from there on remove a child
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
            
        },
        clearFields: function() {
            var fields,fieldsArray;
            //select the fields we want to clear
            fields = document.querySelectorAll(DOMstrings.inputDescription + ','+ DOMstrings.inputValue);
            
            fieldsArray = Array.prototype.slice.call(fields);
            
            //This callback function has access to 3 elements , current element, current index, current array
            
            fieldsArray.forEach(function(current, index, array) {
                current.value = '';
            });
            
            //Focus of description field to contrinue inputing new data
            fieldsArray[0].focus();
        },
        displayBudget: function(obj) {
            
            obj.budget > 0 ? type = 'inc' : type = 'exp'
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
            
            if(obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageExpLabel).textContent = obj.percentage + '%';
            }  else {
                document.querySelector(DOMstrings.percentageExpLabel).textContent = '---';
            }
        },
        changeType: function() {
            
            var fields = document.querySelectorAll(DOMstrings.inputType + ',' + DOMstrings.inputDescription + ',' + DOMstrings.inputValue);
            
            nodeListForEach(fields, function(cur) {
                cur.classList.toggle('red-focus');
            });
            document.querySelector(DOMstrings.inputButton).classList.toggle('red');
            
        }
        
        
    }
    
})();

//Global App controller (decide what happens upon each event and then delegate tasks to other controllers)
var controller = (function(budgetCtrl, UICtrl){
    
    var setupEventListeners = function() {
        var DOM = UICtrl.getDOMstrings();
        document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem);
        document.addEventListener('keypress', function(event) {
            if(event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);
    }
    
    var updateBudget = function() {
        
        //1. Calculate budget
        
        budgetCtrl.calculateBudget();
        
        //2. Return budget
        
        var budget = budgetCtrl.getBudget();
        
        //3. Display the budget on the UI
        
        UICtrl.displayBudget(budget);
        
    }
    
    var updatePercentages = function() {
        
        //1.Calculate percentages
        budgetCtrl.calculatePercentages();
        
        //2.Read percentage from the budget controller
        var percentages = budgetCtrl.getPercentages();
        
        //3.Update the UI
        UICtrl.displayPercentages(percentages);
        
        
    };
    
    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type;
        
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if(itemID) {
            
            //inc-1
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseFloat(splitID[1]);
            
            //1. delete the item from the data structure
            budgetCtrl.deleteItem(type,ID);
            
            //2.delete item from the UI
            UICtrl.deleteListItem(itemID);
            
            //3. update and show the new budget
            updateBudget();
            
            //4.Calculate and update the percentages
            updatePercentages();
            
        }
    };
    
    var ctrlAddItem = function() {
        var input, newItem;
        
        //1. Get the field input data
        
        input = UICtrl.getInput();
        
        //Checking validity of input
        if(!isNaN(input.value) && input.description !== "" && input.value > 0) {
            
            //2. Add item to budget controller
        
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            //3. Add the new item to the user interface

            UICtrl.addListItem(newItem, input.type);

            //4.Clear the fields
            UICtrl.clearFields();

            //5.Calculate and update budget
            updateBudget();
            
            //6.Calculate and update the percentages
            updatePercentages();
        }
        
        
    };
    
    return {
        init: function() {
            console.log('Application has started');
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            UICtrl.displayMonth();
            setupEventListeners();
        }
    }
    
})(budgetController, UIController);


controller.init();



















