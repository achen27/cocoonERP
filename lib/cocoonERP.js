// Set up a collection to contain player information. On the server,
// it is backed by a MongoDB collection named "players".

Players = new Mongo.Collection("players");

BOM = new Mongo.Collection("bom");

currTree = new Mongo.Collection("currtree")

stackCount = 0;

isChild = 0;



if (Meteor.isClient) {

  function addNewBOM () {

          bootbox.dialog({
                        title: "New BOM",
                        message:
                            '<form>' +
                            '<label>Item Number:</label><input name="newbomid" class="newbomid"/><label>' +
                            'Description:</label><input type="text" id="newbomdesc" name="newbomdesc"/></form>',
                        buttons: {
                            success: {
                                label: "Add",
                                className: "btn-success",
                                callback: function () {
                                    var name = $('#name').val();
                                    var answer = $("input[name='awesomeness']:checked").val()
                                    Example.show("Hello " + name + ". You've chosen <b>" + answer + "</b>");
                                }
                            }
                        }
                    }
                );
    };


  
  Session.set("sessionParents", '');
  // Single use function for the current page
  Template.top.helpers({

    bomitem: function () {
      return BOM.find().fetch();
    },

    bomID: function () {

      return this._id;
    }

  });

  Template.top.events({


    'click': function () {

      Session.set("selectedItem", '');
      Session.set("addFormDisplay", '');
    },

    'change .currbom': function (event){
      event.preventDefault();
     // window.location.href = "/bom/" + event.target.value;
      Session.set("currentBOM", event.target.value);
    }


  });

  Template.bottom.events({

    'click': function () {

      Session.set("selectedItem", '');
    }
  });

  Template.testF.helpers({

    removeTree: function () {

    //  Meteor.call("removeAllTree");
    },

    items: function () {
      var findThis =  Session.get("currentBOM");
      return BOM.findOne(findThis);
    },

    setNotChild: function () {

      isChild = 0;

    }

  });


  Template.itemTemp.helpers({

    bomitem: function () {
      return BOM.find().fetch();
    },

    bomID: function () {

      return this._id;
    },

    id: function() {

      return this._id;
    },

    name: function() {

      return this.desc;
    },

    selected: function () {
      return Session.equals("selectedItem", this._id) ? "selected" : '';
    },

    displayed: function () {
      return Session.equals("addFormDisplay", this._id) ? "displayed" : '';
    },

    isChild: function () {

      return isChild;
    },

    qty: function () {

  
      var currentParent = this.thisParent;
      var obj = _.find(this.parents, function(obj) { return obj.parentID == currentParent });
      // this is an array search method from the Underscore.JS library.
      // this here searches for the current node on all its parents for one that matches the currentParent
      // then returns the Qty for the parent.

      return obj.qty;
       //return 'nothing';
    }

  });

   Template.itemTemp.events({

    
    'change .bomid': function (event){
      var newid = event.target.value;
      if (newid === "-----New BOM Item-----" ){
        addNewBOM();

      } 
    },


    'click': function() {

      Session.set("selectedItem", this._id);
     
    },

    'click .addChild': function () {
    //  $(".addForm selected").css( "display", "inline" );
      Session.set("addFormDisplay", this._id);
    },

    'submit .addForm': function (event) {
      event.preventDefault();
      var ID = event.target.bomid.value;
      var desc = event.target.name.value;
      var qty = Number(event.target.qty.value);

      if (this._id === ID) {
        throw new Meteor.Error("self-reference");
      }

      if(qty) {

        // reset the form to blank for better looks
        event.target.bomid.value ='';
        event.target.name.value ='';
        event.target.qty.value ='';

        Meteor.call("addChild", ID, desc, qty, this);
      } else {
      //  bootbox.alert("Hello World!");
         window.alert("Quantity must be a number!");
      }
      

      //console.log(this);
      //console.log(event.target.name.value);
    }

  });

  Template.comment.events({

    'click .toggleBOM': function (event){
      /*
      console.log("toggleBOM." + event.target.name);
      $("#" + event.target.id).toggle();
      $("li." + event.target.name + " > ul").toggle();
   // $(event).children("ul").toggle();
    
    */
    }

  });

  Template.comment.helpers({

    currClass: function () {
      return this._id;
    },

    removeThis: function () {
      //currTree.remove({key: this._id});
    },

    addThis: function () {
      //currTree.insert({key: this._id, parent: this.thisParent});
    },

    parentNode: function () {
      //console.log(this._id);
      return this._id;
    },

    console2: function (test) {
      console.log(test);
    },

    currentParent: function(){

      return this._id;
    },

    consoleChild: function(){
      console.log('child');
      console.log(this);
    },

    setIsChild: function() {
      isChild = 1;

    },

    name: function() {

      return this.desc;
    },

    items2: function() {

      var searchKey = {};
      var currentParent = this._id;

      searchKey["_id"] = {$in:this.children};
      var temp = BOM.find(searchKey).fetch();
      temp.forEach(function (child) {

        child["thisParent"] = currentParent;
      });
      return temp;
  },
    hasChildren: function() {

      return this.children;
    }
  });

  Template.mwCategories.events({

    'click .haha': function() {

      var item = BOM.findOne("1");
      stack.push(item);

      while (stack.length>0) {

          var currentNode = stack.pop();
          var searchKey = {};



          searchKey["key"] = {$in:currentNode.children};


          var childrenList = BOM.find(searchKey); // array of children of current Node

          //console.log(childrenList.fetch());
  
          childrenList.forEach(function (child) {

            console.log('Parent: ' + currentNode.desc + ' Child: ' + child.desc);
            if(child.children.length>0) {
                stack.push(child);
            }
          
          });
      }

    }

  });
}

// On server startup, 
if (Meteor.isServer) {
  Meteor.methods({
    addItem : function (id, desc) {
      return BOM.insert({_id: id, desc: desc, children:[]});
    },

    addChild : function (ID, desc, qty, event) {

        if(!BOM.findOne(ID)) {
          // if the BOM item number being added as Child doesn't yet exist
        //  Meteor.call("addItem", ID, desc);
          BOM.insert({_id: ID, desc: desc, children:[]}); // add this new item
        }
        
        var newNode = BOM.findOne(ID); // set an object to load its data


        var parentQty = {};
        if(event.children.indexOf(ID) === -1) {
          // if this child is new then add it
          
          parentQty['parents'] = {'parentID': event._id, 'qty': qty}; // set its parents

          BOM.update(newNode._id, {$push: parentQty}); // update the new object with parents

          // console.log(BOM.findOne(ID).parents);
          var action = {};
          
          action['children'] = ID; // set children for the parent node (this node)

          BOM.update(event._id, {$push: action}); // update mongo for parent
          BOM.update(event._id, {$set: {type: 'F'}});  // type F for made and not purchased
        } else {
          // if not new then edit the qty

          var currentNode = event._id;

          var obj = _.indexOf(_.pluck(newNode.parents, 'parentID'), currentNode);

          newNode.parents[obj].qty = qty;
          //console.log(newNode.parents);

          var action = {};
          action['parents'] = newNode.parents;
          BOM.update(newNode._id, {$set: action});
        }
        
    }
  });
}
