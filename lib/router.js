Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading'
});

Router.route('/', {name: 'testF'});
Router.route('/bom/:_id', {
  name: 'BOMPage',
data: function() { return BOM.findOne(this.params._id); } });