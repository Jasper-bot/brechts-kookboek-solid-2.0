const express = require('express');
const router = express.Router();
var crypto = require('crypto');

router.get('/test', (request, response) => {
    console.log("test");
    response.send();
 });

 // alles in 1 route?
router.post('/solid/formcheck', (request, response) => {
    const body = request.body;
    if(body.Comment.length <= 3 || body.Comment.length > 255) {
        response.status(422).send("Comment is not in the correct form.");
    }

    response.json({ok: true});
});

router.post('/solid/hash-and-post', (request, response) => {
    const hashedComment = crypto.createHash('md5').update(request.body.Comment).digest('hex');

    response.json({hashedComment: hashedComment});
});

module.exports = router