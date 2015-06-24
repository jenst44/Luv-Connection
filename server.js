var express = require('express');
var app = express();

var path = require('path');

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded());

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/message_board');

var validate = require('mongoose-validator');

var nameValidator = function(val) {
	if(val && val.length>3){
		return true;
	}
	return false;
}

var Schema = mongoose.Schema;

var CommentSchema = new mongoose.Schema({
	name: String,
	comment: String,
	// created_at: Number,
	// updated_at: Number,
	_message: {type: Schema.ObjectId, ref: 'Message'}
})

var Comment = mongoose.model('Comment', CommentSchema);

var MessageSchema = new mongoose.Schema({
	name: String,
	message: String,
	// created_at: Number,
	// updated_at: Number,
	comments: [{type: Schema.Types.ObjectId, ref: 'Comment'}]
})

MessageSchema.path('message').required(true, 'Luv Message cannot be blank');
MessageSchema.path('name').validate(nameValidator, 'Safe Word must be at least luv 4 characters long');

CommentSchema.path('comment').required(true, 'Luv Message cannot be blank');
CommentSchema.path('name').validate(nameValidator, 'Safe Word must be at least luv 4 characters long');

var Message = mongoose.model('message', MessageSchema);

app.use(express.static(__dirname + '/static'));

app.set('views', (__dirname + '/views'));
app.set('view engine', 'ejs');

app.get('/', function(req, res) {
	Message.find({})
	.populate('comments')
	.exec(function(err, messages) {
		res.render('index', {messages:messages, messageError:''});
	})
})

app.post('/message', function(req, res) {
	var message = new Message(req.body);
	message.save(function(err) {
		if(err){	
			res.render('index', {messageError: 'You have problems in the bedroom!', messages:''})
		}
		else {
			res.redirect('/');
		}
	})
})

app.post('/comment', function(req,res) {
	Message.findOne({_id: req.body.id}, function(err, message){
        // data from form on the front end
        var comment = new Comment(req.body);
        //  set the reference like this:
        comment._message = message._id;
        message.comments.push(comment);
        // now save both to the DB
        comment.save(function(err){
            message.save(function(err){
      if(err) {
                   console.log('Error');
      } else {
          res.redirect('/');
      }
            });
        });
    });
})


app.listen('6969', function() {
	console.log('You are know on the_luv_connection');
})