const {generateMessage,} = require('../src/utils/messages')
const assert = require('assert')

describe('testformessage',function(){
it('generate message', function(){

result= generateMessage ('tester','This is being tested');
assert(result.username==='tester');
assert(result.text==='This is being tested')
})

})