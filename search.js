const Story = require('../models/story')
const getCode=async(search)=>{
    let story=await Story.find({title:/.*search.*/});
    return story;
}
module.exports=getCode