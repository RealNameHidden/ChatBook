const Myform = document.querySelector('#send');
const socket = io();

//Elements
const $messageForm = document.querySelector('#message-form')
const $messageInput = document.querySelector('input')
const $messageButton = document.querySelector('button')
const $messages = document.querySelector('#messages')
const $sendLocationButton = document.querySelector('#share-location')

const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML
//get the loction of user
const {username,room} = Qs.parse(location.search,{ ignoreQueryPrefix:true})

const autoscroll= ()=>{
    //new msg element

    const $newMessage = $messages.lastElementChild
    //height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    const visibleHeight= $messages.offsetHeight

    const containerHeight =$messages.scrollHeight

    const scrollOffset = $messages.scrollTop +visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

$sendLocationButton.addEventListener('click',(e)=>{
    e.preventDefault;
    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit('location',{
            latitude:position.coords.latitude,
            longitude:position.coords.longitude
        },()=>{
            console.log("Location shared!");
            
        });
    })

})

//Just print to console
socket.on('message',(message)=>{
    console.log(message);
    const html = Mustache.render(messageTemplate, {
        username:message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    $messages.scrollTop = $messages.scrollHeight
});

socket.on('locationMessage', (url) => {
    console.log(url)
    const html = Mustache.render(locationMessageTemplate, {
        username: message.username,
        url:url.text,
        createdAt: moment(url.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    $messages.scrollTop = $messages.scrollHeight
})

Myform.addEventListener('submit',(e)=>{
    e.preventDefault();
    $messageButton.setAttribute('disabled','disabled')
    const message = document.querySelector('input').value;
// console.log(message);
    
    socket.emit('sentMessage', message , (error)=>{
        $messageButton.removeAttribute('disabled')
        if (error) {
            return console.log(error)
            }
            console.log('Message delivered!')
            Myform.reset();
    });

});

socket.emit('join',{ username, room},(error)=>{
    if(error){
    console.log(error)
    location.href='/'
    }
    
})

socket.on('roomData', ({room,users})=>{
    const html = Mustache.render(sidebarTemplate,{
        room,
        users
    } )
    document.querySelector('#sidebar').innerHTML = html
    
    
})