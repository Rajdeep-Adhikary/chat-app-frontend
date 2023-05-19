const socket = io.connect('https://chat-server-xy1s.onrender.com');

let content = document.getElementById('messages');
let message_form = document.getElementById('message-form');
let message_input = document.getElementById('message-input');
let room_input = document.getElementById('room-input');
let room_name_form = document.getElementById("room-name-form");
let room_name_input = document.getElementById('room-name');
let user_name_input = document.getElementById('user-name');
let user_greeting_div = document.getElementById('user-greeting');
let leave_btn = document.getElementById('leave-btn');
let room = user = '';

message_form.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = message_input.value;
    if(message == '')
        return false;
    message_input.value = '';
    add_message(create_message(message));

    socket.emit('send-message', message, room);
})

const create_message = message => {
    const div = document.createElement('div');
    div.innerHTML = message;
    div.classList.add('single-message');
    return div;
}

const create_other_message = message => {
    const div = document.createElement('div');
    div.innerHTML = message;
    div.classList.add('single-message');
    return div;
}

const add_message = msgdiv => {
    let msgcont = document.createElement('div');
    msgcont.appendChild(msgdiv);
    msgcont.classList.add('d-flex');
    msgcont.classList.add('justify-content-end');
    content.appendChild(msgcont);
    scroll_to_bottom();
}

const add_other_message = msgdiv => {
    let msgcont = document.createElement('div');
    msgcont.appendChild(msgdiv);
    msgcont.classList.add('d-flex');
    msgcont.classList.add('justify-content-start');
    content.appendChild(msgcont);
    scroll_to_bottom();
}

socket.on('send-to-other', (message) => {
    add_other_message(create_other_message(message));
})

socket.on('user-joined', user => {
    display_joined(`${user} has joined to this room`);
})

socket.on('user-left', user => {
    display_joined(`${user} has left this room`);
})

room_name_form.addEventListener('submit', e => {
    e.preventDefault();
    room = room_name_input.value;
    user = user_name_input.value;

    socket.emit('join-room', room, user, (message) => {
        display_joined(message);
        toggle_view();
        greet_user();
    })
    
})

const toggle_view = function(){
    $('#welcome-window').hide();
    $('#chat-window').show();
}


const display_joined = message => {
    const div = document.createElement('div');
    div.classList.add('notification');
    div.innerHTML = message;
    content.appendChild(div);
}

const scroll_to_bottom = () => {
    content.scrollTo({left : 0, top : content.scrollHeight, behavior : 'smooth'});
}

const greet_user = () => {
    user_greeting_div.innerHTML = `Hi ${user}`;
}

leave_btn.addEventListener('click', (e) => {
    e.preventDefault();
    socket.emit('leave-room', room, user, () => {
        location.reload();
    })
})